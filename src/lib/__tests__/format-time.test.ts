import { describe, expect, it } from "vitest";

import { formatTime } from "@/lib/format-time";

describe("formatTime", () => {
  it("0秒を 0:00 と表示する", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("59秒を 0:59 と表示する", () => {
    expect(formatTime(59)).toBe("0:59");
  });

  it("60秒を 1:00 と表示する", () => {
    expect(formatTime(60)).toBe("1:00");
  });

  it("1470秒（24分30秒）を 24:30 と表示する", () => {
    expect(formatTime(1470)).toBe("24:30");
  });

  it("3600秒（60分）を 60:00 と表示する", () => {
    expect(formatTime(3600)).toBe("60:00");
  });

  it("5秒を 0:05 と表示する", () => {
    expect(formatTime(5)).toBe("0:05");
  });
});
