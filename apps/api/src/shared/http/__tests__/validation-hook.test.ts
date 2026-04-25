import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validationHook } from "../validation-hook";

function setupTestApp() {
  const schema = z.object({
    name: z.string().min(1, "タスク名を入力してください"),
    count: z.number().int().positive("1以上の数値を入力してください"),
  });

  const app = new Hono()
    .use("/*", requestId())
    .post("/", zValidator("json", schema, validationHook), (c) => {
      return c.json({ ok: true });
    });

  return app;
}

describe("validationHook", () => {
  it("バリデーション成功時はハンドラに処理が渡る", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "テスト", count: 1 }),
    });

    // Then
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("バリデーション失敗時に VALIDATION_ERROR コードを返す", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // Then
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message).toBe("入力内容に誤りがあります");
    expect(body.requestId).toBeDefined();
  });

  it("errors 配列にフィールドごとのエラーを含む", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // Then
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "count" }),
      ]),
    );
  });

  it("カスタムエラーメッセージが errors に含まれる", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", count: -1 }),
    });

    // Then
    const body = await res.json();
    const nameError = body.errors.find(
      (e: { field: string }) => e.field === "name",
    );
    const countError = body.errors.find(
      (e: { field: string }) => e.field === "count",
    );
    expect(nameError.message).toBe("タスク名を入力してください");
    expect(countError.message).toBe("1以上の数値を入力してください");
  });
});
