import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "@/hooks/use-media-query";

describe("useMediaQuery", () => {
  let listeners: Array<() => void>;
  let matches: boolean;

  beforeEach(() => {
    listeners = [];
    matches = false;

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        get matches() {
          return matches;
        },
        addEventListener: (_: string, cb: () => void) => {
          listeners.push(cb);
        },
        removeEventListener: (_: string, cb: () => void) => {
          listeners = listeners.filter((l) => l !== cb);
        },
      })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態でmatchMediaの結果を返す", () => {
    matches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("初期状態で不一致の場合falseを返す", () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("matchMediaの変更時に値が更新される", () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      for (const listener of listeners) {
        listener();
      }
    });

    expect(result.current).toBe(true);
  });
});
