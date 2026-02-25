import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLocalStorage } from "@/hooks/use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("初期値を返す（localStorageにデータがない場合）", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current.value).toBe("default");
  });

  it("localStorageに保存されたデータを返す", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current.value).toBe("stored-value");
  });

  it("setValueで値を更新しlocalStorageに保存する", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current.setValue("new-value");
    });

    expect(result.current.value).toBe("new-value");
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe("new-value");
  });

  it("setValueに関数を渡して前の値を基に更新できる", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    act(() => {
      result.current.setValue((prev) => prev + 1);
    });

    expect(result.current.value).toBe(1);
  });

  it("配列データの読み書きができる", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>("test-key", []),
    );

    act(() => {
      result.current.setValue(["a", "b"]);
    });

    expect(result.current.value).toEqual(["a", "b"]);
    expect(JSON.parse(localStorage.getItem("test-key")!)).toEqual(["a", "b"]);
  });
});
