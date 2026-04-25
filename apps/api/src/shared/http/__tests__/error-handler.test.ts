import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { LogEntry } from "../../../__tests__/helpers/log";
import { createLogCapture } from "../../../__tests__/helpers/log";
import { createLogger } from "../../lib/logger";
import { createErrorHandler } from "../error-handler";
import { validationHook } from "../validation-hook";

function setupTestApp(): { app: Hono; logs: LogEntry[] } {
  const { logs, stream } = createLogCapture();
  const logger = createLogger({ level: "trace", destination: stream });
  const handler = createErrorHandler(logger);

  const app = new Hono()
    .use("/*", requestId())
    .get("/error", () => {
      throw new Error("テストエラー");
    })
    .post(
      "/data",
      zValidator("json", z.object({ name: z.string() }), validationHook),
      (c) => c.json({ ok: true }),
    )
    .onError(handler);

  return { app, logs };
}

describe("createErrorHandler", () => {
  describe("未捕捉例外のログ出力", () => {
    it("error レベルで 'unhandled error' メッセージを出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/error");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
      expect(logs[0].msg).toBe("unhandled error");
    });

    it("err.message を出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/error");

      // Then
      const err = logs[0].err as Record<string, unknown>;
      expect(err.message).toBe("テストエラー");
    });

    it("err.name を出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/error");

      // Then
      const err = logs[0].err as Record<string, unknown>;
      expect(err.name).toBe("Error");
    });

    it("err.stack を出力する", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/error");

      // Then
      const err = logs[0].err as Record<string, unknown>;
      expect(typeof err.stack).toBe("string");
      expect(err.stack as string).toContain("テストエラー");
    });
  });

  describe("レスポンス", () => {
    it("500 ステータスを返す", async () => {
      // Given
      const { app } = setupTestApp();

      // When
      const res = await app.request("/error");

      // Then
      expect(res.status).toBe(500);
    });

    it("統一エラーレスポンス形式のボディを返す", async () => {
      // Given
      const { app } = setupTestApp();

      // When
      const res = await app.request("/error");
      const body = await res.json();

      // Then
      expect(body.code).toBe("INTERNAL_SERVER_ERROR");
      expect(body.message).toBe("サーバーエラーが発生しました");
      expect(body.requestId).toBeDefined();
    });
  });

  describe("requestId 伝播", () => {
    it("requestId がログに含まれる", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/error");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].requestId).toBeDefined();
      expect(typeof logs[0].requestId).toBe("string");
    });
  });

  describe("不正な JSON リクエスト", () => {
    it("400 INVALID_JSON を返す", async () => {
      // Given
      const { app } = setupTestApp();

      // When
      const res = await app.request("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json",
      });
      const body = await res.json();

      // Then
      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_JSON");
      expect(body.message).toBe("リクエストの形式が正しくありません");
    });

    it("warn レベルでログ出力する（error ではない）", async () => {
      // Given
      const { app, logs } = setupTestApp();

      // When
      await app.request("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json",
      });

      // Then
      const warnLogs = logs.filter((l) => l.level === "warn");
      const errorLogs = logs.filter((l) => l.level === "error");
      expect(warnLogs.length).toBeGreaterThanOrEqual(1);
      expect(errorLogs).toHaveLength(0);
    });
  });

  describe("requestId 未設定", () => {
    it("requestId ミドルウェアなしでもエラーを処理する", async () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "trace", destination: stream });
      const handler = createErrorHandler(logger);

      const app = new Hono()
        .get("/error", () => {
          throw new Error("テストエラー");
        })
        .onError(handler);

      // When
      const res = await app.request("/error");

      // Then
      expect(res.status).toBe(500);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
    });
  });
});
