import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTasks } from "@/hooks/use-tasks";

describe("useTasks - カテゴリ操作", () => {
  let uuidCounter: number;

  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      uuidCounter++;
      return `uuid-${uuidCounter}`;
    });
  });

  it("addCategoryでカテゴリを追加できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addCategory("インスタ投稿", "#3B82F6");
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe("インスタ投稿");
    expect(result.current.categories[0].color).toBe("#3B82F6");
  });

  it("カテゴリIDが設定されたタスクにcategoryが解決される", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addCategory("リサーチ", "#22C55E");
    });

    const categoryId = result.current.categories[0].id;

    act(() => {
      result.current.addTask({
        name: "リサーチタスク",
        categoryId,
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    expect(result.current.tasks[0].category.name).toBe("リサーチ");
    expect(result.current.tasks[0].category.color).toBe("#22C55E");
  });

  it("updateCategoryでカテゴリの名前と色を更新できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addCategory("インスタ投稿", "#3B82F6");
    });

    const categoryId = result.current.categories[0].id;

    act(() => {
      result.current.updateCategory(categoryId, "ブログ執筆", "#22C55E");
    });

    expect(result.current.categories[0].name).toBe("ブログ執筆");
    expect(result.current.categories[0].color).toBe("#22C55E");
    expect(result.current.categories[0].id).toBe(categoryId);
  });

  it("deleteCategoryでカテゴリを削除できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addCategory("インスタ投稿", "#3B82F6");
    });

    const categoryId = result.current.categories[0].id;

    act(() => {
      result.current.deleteCategory(categoryId);
    });

    expect(result.current.categories).toHaveLength(0);
  });

  it("deleteCategoryで紐づくタスクのcategoryIdが空文字になる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addCategory("インスタ投稿", "#3B82F6");
    });

    const categoryId = result.current.categories[0].id;

    act(() => {
      result.current.addTask({
        name: "紐づくタスク",
        categoryId,
        scheduledDate: null,
        estimatedMinutes: null,
      });
      result.current.addTask({
        name: "紐づかないタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    act(() => {
      result.current.deleteCategory(categoryId);
    });

    expect(result.current.tasks[0].categoryId).toBe("");
    expect(result.current.tasks[1].categoryId).toBe("");
    expect(result.current.categories).toHaveLength(0);
  });
});
