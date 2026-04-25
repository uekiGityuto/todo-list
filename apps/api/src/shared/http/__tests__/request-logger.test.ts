import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { describe, expect, it } from "vitest";
import type { LogEntry } from "../../../__tests__/helpers/log";
import { createLogCapture } from "../../../__tests__/helpers/log";
import { createLogger } from "../../lib/logger";
import { createErrorHandler } from "../error-handler";
import { createRequestLogger } from "../request-logger";

function setupTestApp(): { app: Hono; logs: LogEntry[] } {
  const { logs, stream } = createLogCapture();
  const logger = createLogger({ level: "trace", destination: stream });
  const middleware = createRequestLogger(logger);

  const app = new Hono()
    .use("/*", requestId())
    .use("/*", middleware)
    .get("/ok", (c) => c.text("ok"))
    .get("/not-found", (c) => c.json({ error: "Not Found" }, 404))
    .get("/server-error", (c) =>
      c.json({ error: "Internal Server Error" }, 500),
    )
    .get("/throw", () => {
      throw new Error("テストエラー");
    })
    .post("/data", (c) => c.json({ result: "ok" }))
    .onError(createErrorHandler(logger));

  return { app, logs };
}

describe("createRequestLogger", () => {
  describe("正常リクエスト（2xx）", () => {
    it("info レベルで requestId, method, path, status, durationMs を出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/ok");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("info");
      expect(logs[0].requestId).toBeDefined();
      expect(logs[0].method).toBe("GET");
      expect(logs[0].path).toBe("/ok");
      expect(logs[0].status).toBe(200);
      expect(typeof logs[0].durationMs).toBe("number");
      expect(logs[0].msg).toBe("request completed");
    });
  });

  describe("4xx レスポンス", () => {
    it("warn レベルで出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/not-found");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("warn");
      expect(logs[0].status).toBe(404);
      expect(logs[0].msg).toBe("request completed");
    });
  });

  describe("5xx レスポンス", () => {
    it("error レベルで出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/server-error");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
      expect(logs[0].status).toBe(500);
      expect(logs[0].msg).toBe("request completed");
    });
  });

  describe("ハンドラが例外を throw したケース（onError 経由）", () => {
    it("error レベルで status 500 の request completed ログを出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/throw");

      // Then
      const requestLog = logs.find((l) => l.msg === "request completed");
      expect(requestLog).toBeDefined();
      expect(requestLog!.level).toBe("error");
      expect(requestLog!.status).toBe(500);
      expect(requestLog!.method).toBe("GET");
      expect(requestLog!.path).toBe("/throw");
      expect(typeof requestLog!.durationMs).toBe("number");
    });
  });

  describe("リクエストボディ", () => {
    it("リクエストボディをログに含めない", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: "password123" }),
      });

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0]).not.toHaveProperty("body");
      expect(JSON.stringify(logs[0])).not.toContain("password123");
    });
  });
});
