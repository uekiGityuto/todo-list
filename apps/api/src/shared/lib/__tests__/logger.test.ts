import { describe, expect, it } from "vitest";
import { createLogCapture } from "../../../__tests__/helpers/log";
import { createLogger } from "../logger";

describe("createLogger", () => {
  describe("JSON 構造化出力", () => {
    it("level を文字列ラベルで出力する", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info("テストメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("info");
    });

    it("time を ISO 8601 形式で出力する", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info("テストメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      const time = logs[0].time as string;
      expect(typeof time).toBe("string");
      expect(Number.isNaN(Date.parse(time))).toBe(false);
    });

    it("msg フィールドを出力する", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info("テストメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].msg).toBe("テストメッセージ");
    });

    it("pid と hostname を出力しない", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info("テストメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0]).not.toHaveProperty("pid");
      expect(logs[0]).not.toHaveProperty("hostname");
    });
  });

  describe("redact", () => {
    it.each([
      ["authorization", "Bearer secret-token"],
      ["cookie", "session=abc123"],
      ["set-cookie", "session=abc; Path=/"],
      ["password", "secret123"],
      ["accessToken", "access-token-value"],
      ["refreshToken", "refresh-token-value"],
      ["token", "jwt-value"],
    ])("%s フィールドを [Redacted] に置換する", (field, value) => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info({ [field]: value }, "機密データ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0][field]).toBe("[Redacted]");
    });

    it("ネストされたオブジェクト内の機密フィールドを [Redacted] に置換する", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "info", destination: stream });

      // When
      logger.info(
        { headers: { authorization: "Bearer nested-secret" } },
        "ネストされたヘッダー",
      );

      // Then
      const headers = logs[0].headers as Record<string, unknown>;
      expect(headers.authorization).toBe("[Redacted]");
    });
  });

  describe("ログレベルフィルタ", () => {
    it("level=warn 設定時に info ログが出力されない", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "warn", destination: stream });

      // When
      logger.info("フィルタされるべきメッセージ");

      // Then
      expect(logs).toHaveLength(0);
    });

    it("level=warn 設定時に warn ログが出力される", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "warn", destination: stream });

      // When
      logger.warn("表示されるべきメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("warn");
    });

    it("level=warn 設定時に error ログが出力される", () => {
      // Given
      const { logs, stream } = createLogCapture();
      const logger = createLogger({ level: "warn", destination: stream });

      // When
      logger.error("エラーメッセージ");

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
    });
  });
});
