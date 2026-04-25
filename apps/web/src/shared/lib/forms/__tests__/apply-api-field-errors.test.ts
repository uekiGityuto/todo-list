import { describe, expect, it, vi } from "vitest";
import { applyApiFieldErrors } from "../apply-api-field-errors";

describe("applyApiFieldErrors", () => {
  it("対応する fieldMap があるエラーだけ setError に流す", () => {
    const setError = vi.fn();

    const handled = applyApiFieldErrors(
      [
        { field: "name", message: "名前は必須です" },
        { field: "unknown", message: "unknown" },
      ],
      setError,
      { name: "name" },
    );

    expect(handled).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("name", {
      type: "server",
      message: "名前は必須です",
    });
  });

  it("対応する fieldMap がなければ false を返す", () => {
    const setError = vi.fn();

    const handled = applyApiFieldErrors(
      [{ field: "name", message: "名前は必須です" }],
      setError,
      { color: "color" },
    );

    expect(handled).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
