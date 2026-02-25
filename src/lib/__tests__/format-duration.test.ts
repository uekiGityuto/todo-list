import { describe, expect, it } from "vitest";

import { formatDuration } from "@/lib/format-duration";

describe("formatDuration", () => {
  it("60分未満は「○分」形式で返す", () => {
    expect(formatDuration(15)).toBe("15分");
    expect(formatDuration(30)).toBe("30分");
    expect(formatDuration(45)).toBe("45分");
  });

  it("ちょうどN時間のときは「○時間」形式で返す", () => {
    expect(formatDuration(60)).toBe("1時間");
    expect(formatDuration(120)).toBe("2時間");
    expect(formatDuration(180)).toBe("3時間");
  });

  it("端数があるときは「○時間○分」形式で返す", () => {
    expect(formatDuration(90)).toBe("1時間30分");
    expect(formatDuration(150)).toBe("2時間30分");
  });
});
