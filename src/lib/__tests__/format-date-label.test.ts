import { describe, expect, it } from "vitest";

import { formatDateLabel } from "@/lib/format-date-label";

describe("formatDateLabel", () => {
  it("日付を日本語フォーマットに変換する", () => {
    expect(formatDateLabel("2026-02-25")).toBe("2月25日（水）");
  });

  it("月初の日付を正しく変換する", () => {
    expect(formatDateLabel("2026-03-01")).toBe("3月1日（日）");
  });
});
