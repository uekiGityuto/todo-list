import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "@/shared/hooks/use-tasks";
import * as api from "@/shared/lib/api";
import type { Category, Task } from "@/shared/types/task";

import { createQueryClientWrapper } from "./query-client-wrapper";

vi.mock("@/shared/lib/api", () => ({
  createCategory: vi.fn(),
  createTask: vi.fn(),
  deleteCategory: vi.fn(),
  deleteTask: vi.fn(),
  fetchCategories: vi.fn(),
  fetchTasks: vi.fn(),
  updateCategory: vi.fn(),
  updateTask: vi.fn(),
}));

const now = "2026-01-01T00:00:00.000Z";

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "category-1",
  name: "インスタ投稿",
  color: "#3B82F6",
  ...overrides,
});

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  name: "タスク",
  categoryId: "",
  status: "todo",
  isNext: false,
  estimatedMinutes: null,
  scheduledDate: null,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

function renderUseTasks(tasks: Task[] = [], categories: Category[] = []) {
  vi.mocked(api.fetchTasks).mockResolvedValue(tasks);
  vi.mocked(api.fetchCategories).mockResolvedValue(categories);

  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useTasks({ tasks, categories }), { wrapper });
}

describe("useTasks - カテゴリ操作", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addCategoryでカテゴリを追加できる", async () => {
    const createdCategory = makeCategory();
    vi.mocked(api.createCategory).mockResolvedValue(createdCategory);

    const { result } = renderUseTasks();

    await act(async () => {
      await result.current.addCategory(
        createdCategory.name,
        createdCategory.color,
      );
    });

    await waitFor(() => expect(result.current.categories).toHaveLength(1));
    expect(result.current.categories[0].name).toBe("インスタ投稿");
    expect(result.current.categories[0].color).toBe("#3B82F6");
  });

  it("updateCategoryでカテゴリの名前と色を更新できる", async () => {
    const category = makeCategory();
    vi.mocked(api.updateCategory).mockResolvedValue(
      makeCategory({
        id: category.id,
        name: "ブログ執筆",
        color: "#22C55E",
      }),
    );

    const { result } = renderUseTasks([], [category]);

    await act(async () => {
      await result.current.updateCategory(category.id, "ブログ執筆", "#22C55E");
    });

    await waitFor(() =>
      expect(result.current.categories[0].name).toBe("ブログ執筆"),
    );
    expect(result.current.categories[0].color).toBe("#22C55E");
    expect(result.current.categories[0].id).toBe(category.id);
  });

  it("deleteCategoryでカテゴリを削除できる", async () => {
    const category = makeCategory();
    vi.mocked(api.deleteCategory).mockResolvedValue(undefined);

    const { result } = renderUseTasks([], [category]);

    await act(async () => {
      await result.current.deleteCategory(category.id);
    });

    await waitFor(() => expect(result.current.categories).toHaveLength(0));
  });

  it("deleteCategoryで紐づくタスクのcategoryIdが空文字になる", async () => {
    const category = makeCategory();
    const tasks = [
      makeTask({ id: "task-1", categoryId: category.id }),
      makeTask({ id: "task-2", categoryId: "" }),
    ];
    vi.mocked(api.deleteCategory).mockResolvedValue(undefined);

    const { result } = renderUseTasks(tasks, [category]);

    await act(async () => {
      await result.current.deleteCategory(category.id);
    });

    await waitFor(() => expect(result.current.tasks[0].categoryId).toBe(""));
    expect(result.current.tasks[1].categoryId).toBe("");
    expect(result.current.categories).toHaveLength(0);
  });
});
