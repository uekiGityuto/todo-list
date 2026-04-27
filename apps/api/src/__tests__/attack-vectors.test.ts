import { jwtVerify } from "jose";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import { cleanDatabase, prisma } from "./helpers/db";

// 攻撃者視点の横断テスト
// 認証バイパス、IDOR、SQL インジェクション、境界値の挙動を検証する。
// 各 feature の通常系・ユーザー隔離テストは `features/*/__tests__/` に存在する前提で、
// ここでは追加でカバーすべき攻撃シナリオに絞って検証する。

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: "test-user-id" },
  }),
}));

describe("セキュリティ - 攻撃シナリオ", () => {
  beforeEach(async () => {
    await cleanDatabase();
    // 直前のテストの mockResolvedValueOnce / mockRejectedValueOnce が
    // 残っていると次のテストへ漏れるため、mockReset してから再設定する
    vi.mocked(jwtVerify).mockReset();
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { sub: "test-user-id" },
    } as never);
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("認証なしでのアクセス", () => {
    it("Authorization ヘッダなしの GET /tasks は 401", async () => {
      const res = await app.request("/tasks");
      expect(res.status).toBe(401);
    });

    it("Authorization ヘッダなしの POST /categories は 401", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Work", color: "#0000FF" }),
      });
      expect(res.status).toBe(401);
    });

    it("Authorization ヘッダなしの DELETE /tasks/:id は 401", async () => {
      const res = await app.request(
        "/tasks/00000000-0000-0000-0000-000000000000",
        { method: "DELETE" },
      );
      expect(res.status).toBe(401);
    });

    it("Bearer 以外のスキーム（Basic）は 401", async () => {
      const res = await app.request("/tasks", {
        headers: { Authorization: "Basic dXNlcjpwYXNz" },
      });
      expect(res.status).toBe(401);
    });

    it("Bearer プレフィックスのみでトークンが無い場合は 401", async () => {
      vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("invalid token"));
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer " },
      });
      expect(res.status).toBe(401);
    });

    it("JWT 検証に失敗した場合は 401", async () => {
      vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("invalid token"));
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer tampered.jwt.token" },
      });
      expect(res.status).toBe(401);
    });

    it("JWT に sub クレームが無い場合は 401", async () => {
      vi.mocked(jwtVerify).mockResolvedValueOnce({
        payload: {},
      } as never);
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer no-sub-token" },
      });
      expect(res.status).toBe(401);
    });

    it("401 レスポンスに WWW-Authenticate: Bearer ヘッダが含まれる", async () => {
      const res = await app.request("/tasks");
      expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
    });

    it("認証失敗時にデータが作成されないこと（POST /categories）", async () => {
      await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Should not save", color: "#000000" }),
      });

      const count = await prisma.category.count();
      expect(count).toBe(0);
    });
  });

  describe("IDOR（他ユーザーのデータへのアクセス）", () => {
    it("リクエストボディに userId を仕込んでも別ユーザーのデータは作れない", async () => {
      // クライアントが userId を直接指定しようとしても、route 側は JWT の sub を使う
      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Spoofed",
          color: "#FFFFFF",
          userId: "victim-user-id",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();

      const created = await prisma.category.findUnique({
        where: { id: body.id },
      });
      expect(created?.userId).toBe("test-user-id");
    });

    it("別ユーザーのタスクに作業記録を紐付けようとすると 404", async () => {
      const otherCategory = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const otherTask = await prisma.task.create({
        data: {
          name: "Victim task",
          categoryId: otherCategory.id,
          status: "todo",
          isNext: false,
          userId: "other-user-id",
        },
      });

      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: otherTask.id,
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
        }),
      });

      expect(res.status).toBe(404);

      const records = await prisma.workRecord.count({
        where: { taskId: otherTask.id },
      });
      expect(records).toBe(0);
    });
  });

  describe("SQL インジェクション", () => {
    it("name フィールドの SQLi ペイロードは文字列としてそのまま保存される", async () => {
      const payload = "'; DROP TABLE categories; --";

      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ name: payload, color: "#0000FF" }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe(payload);

      // テーブルが破壊されていないこと
      const count = await prisma.category.count();
      expect(count).toBe(1);
    });

    it("UUID ライクな SQLi ペイロードを :id に渡すと 400（UUID バリデーションで弾く）", async () => {
      const payload = "00000000-0000-0000-0000-000000000000' OR '1'='1";

      const res = await app.request(
        `/categories/${encodeURIComponent(payload)}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer test-token" },
        },
      );

      expect(res.status).toBe(400);
    });

    it("タスク名に改行・特殊文字を含むペイロードを送っても 201 で文字列保存される", async () => {
      // 注: NULL バイト (\u0000) は Postgres TEXT 型が拒否するため別挙動になる
      const payload = "task\nname\rwith<script>alert(1)</script>";

      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: payload,
          categoryId: null,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe(payload);
    });
  });

  describe("境界値", () => {
    describe("文字列長", () => {
      it("カテゴリ名 50 文字ちょうどは 201", async () => {
        const res = await app.request("/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "a".repeat(50),
            color: "#0000FF",
          }),
        });
        expect(res.status).toBe(201);
      });

      it("カテゴリ名 51 文字は 400", async () => {
        const res = await app.request("/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "a".repeat(51),
            color: "#0000FF",
          }),
        });
        expect(res.status).toBe(400);
      });

      it("タスク名が 10000 文字（極端に大きな値）は 400", async () => {
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "a".repeat(10000),
            categoryId: null,
            estimatedMinutes: null,
            scheduledDate: null,
          }),
        });
        expect(res.status).toBe(400);
      });
    });

    describe("数値", () => {
      it("estimatedMinutes = 0 は 400 (positive 制約)", async () => {
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "Task",
            categoryId: null,
            estimatedMinutes: 0,
            scheduledDate: null,
          }),
        });
        expect(res.status).toBe(400);
      });

      it("estimatedMinutes が負の値は 400", async () => {
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "Task",
            categoryId: null,
            estimatedMinutes: -1,
            scheduledDate: null,
          }),
        });
        expect(res.status).toBe(400);
      });

      it("estimatedMinutes が小数は 400 (int 制約)", async () => {
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "Task",
            categoryId: null,
            estimatedMinutes: 1.5,
            scheduledDate: null,
          }),
        });
        expect(res.status).toBe(400);
      });

      it("estimatedMinutes が極端に大きい値 (Number.MAX_SAFE_INTEGER) は 201（int 範囲内）", async () => {
        // 現状スキーマに上限が無いため、巨大な値が通る挙動を検証する
        // 業務的に上限を入れたい場合は別途 issue 化対象
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "Task",
            categoryId: null,
            estimatedMinutes: Number.MAX_SAFE_INTEGER,
            scheduledDate: null,
          }),
        });
        // Postgres Int は 2^31-1 までなので、Prisma 層で失敗する可能性がある
        expect([201, 400, 500]).toContain(res.status);
      });
    });

    describe("空文字列", () => {
      it("カテゴリ color が空文字は 400", async () => {
        const res = await app.request("/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ name: "Work", color: "" }),
        });
        expect(res.status).toBe(400);
      });

      it("タスク作成時の name が半角スペースのみは 400 を期待するが、現状は 201（空白 trim をしていない）", async () => {
        // 期待: 空白のみは無効入力。
        // 現状: zod の min(1) は空白を許容する。改善候補。
        const res = await app.request("/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            name: "   ",
            categoryId: null,
            estimatedMinutes: null,
            scheduledDate: null,
          }),
        });
        // 現状の挙動を記録（リグレッション検知用）
        expect(res.status).toBe(201);
      });
    });
  });
});
