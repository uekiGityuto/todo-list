import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: "test-user-id" },
  }),
}));

describe("作業記録 API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /work-records", () => {
    it("作業記録が存在しない場合、空配列を返す", async () => {
      const res = await app.request("/work-records", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("すべての作業記録を返す", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });
      await prisma.workRecord.create({
        data: {
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
          userId: "test-user-id",
        },
      });
      await prisma.workRecord.create({
        data: {
          taskId: task.id,
          date: "2026-04-18",
          durationMinutes: 15,
          result: "interrupted",
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/work-records", {
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("taskId");
      expect(body[0]).toHaveProperty("date");
      expect(body[0]).toHaveProperty("durationMinutes");
      expect(body[0]).toHaveProperty("result");
    });
  });

  describe("POST /work-records", () => {
    it("有効な入力で作業記録を作成する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 45,
          result: "completed",
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.taskId).toBe(task.id);
      expect(body.date).toBe("2026-04-19");
      expect(body.durationMinutes).toBe(45);
      expect(body.result).toBe("completed");
      expect(body.id).toBeDefined();
    });

    it("作業時間が 0 でも作業記録を作成できる", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 0,
          result: "interrupted",
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.durationMinutes).toBe(0);
    });

    it("date が不正な日付形式の場合、400 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026/04/19",
          durationMinutes: 30,
          result: "completed",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("taskId が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "not-a-uuid",
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("result が無効な enum 値の場合、400 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026-04-19",
          durationMinutes: 30,
          result: "invalid_result",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("durationMinutes が負の値の場合、400 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026-04-19",
          durationMinutes: -1,
          result: "completed",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("必須フィールドが不足している場合、400 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("タスクが存在しない場合、404 を返す", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
        }),
      });

      expect(res.status).toBe(404);
    });
  });
});
