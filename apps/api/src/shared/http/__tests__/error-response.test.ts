import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { describe, expect, it } from "vitest";
import { errorResponse } from "../error-response";

function setupTestApp() {
  const app = new Hono()
    .use("/*", requestId())
    .get("/not-found", (c) => errorResponse(c, 404, "TASK_NOT_FOUND"))
    .get("/unauthorized", (c) => errorResponse(c, 401, "UNAUTHORIZED"))
    .get("/server-error", (c) =>
      errorResponse(c, 500, "INTERNAL_SERVER_ERROR"),
    );

  return app;
}

describe("errorResponse", () => {
  it("指定したステータスコードを返す", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/not-found");

    // Then
    expect(res.status).toBe(404);
  });

  it("code にエラーコードを含む", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/not-found");
    const body = await res.json();

    // Then
    expect(body.code).toBe("TASK_NOT_FOUND");
  });

  it("message に日本語メッセージを含む", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/not-found");
    const body = await res.json();

    // Then
    expect(body.message).toBe("タスクが見つかりません");
  });

  it("requestId を含む", async () => {
    // Given
    const app = setupTestApp();

    // When
    const res = await app.request("/not-found");
    const body = await res.json();

    // Then
    expect(body.requestId).toBeDefined();
    expect(typeof body.requestId).toBe("string");
  });

  it("エラーコードごとに正しい日本語メッセージを返す", async () => {
    // Given
    const app = setupTestApp();

    // When / Then
    const unauthorized = await app.request("/unauthorized");
    const unauthorizedBody = await unauthorized.json();
    expect(unauthorizedBody.message).toBe("認証が必要です");

    const serverError = await app.request("/server-error");
    const serverErrorBody = await serverError.json();
    expect(serverErrorBody.message).toBe("サーバーエラーが発生しました");
  });
});
