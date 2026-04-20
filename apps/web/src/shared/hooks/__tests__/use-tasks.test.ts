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

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  name: "テストタスク",
  categoryId: "",
  status: "todo",
  isNext: false,
  estimatedMinutes: null,
  scheduledDate: null,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "category-1",
  name: "カテゴリ",
  color: "#3B82F6",
  ...overrides,
});

function renderUseTasks(tasks: Task[] = [], categories: Category[] = []) {
  vi.mocked(api.fetchTasks).mockResolvedValue(tasks);
  vi.mocked(api.fetchCategories).mockResolvedValue(categories);

  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useTasks({ tasks, categories }), { wrapper });
}

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では空のタスクとカテゴリを返す", () => {
    const { result } = renderUseTasks();

    expect(result.current.tasks).toEqual([]);
    expect(result.current.categories).toEqual([]);
  });

  it("addTaskでタスクを追加できる", async () => {
    vi.mocked(api.createTask).mockResolvedValue(
      makeTask({
        estimatedMinutes: 30,
      }),
    );

    const { result } = renderUseTasks();

    await act(async () => {
      await result.current.addTask({
        name: "テストタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: 30,
      });
    });

    await waitFor(() => expect(result.current.tasks).toHaveLength(1));
    expect(result.current.tasks[0].name).toBe("テストタスク");
    expect(result.current.tasks[0].status).toBe("todo");
    expect(result.current.tasks[0].isNext).toBe(false);
    expect(result.current.tasks[0].estimatedMinutes).toBe(30);
  });

  it("updateTaskでタスクを更新できる", async () => {
    const task = makeTask();
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({
        id: task.id,
        name: "更新後のタスク",
        scheduledDate: "2026-03-01",
        estimatedMinutes: 60,
      }),
    );

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.updateTask(task.id, {
        name: "更新後のタスク",
        categoryId: "",
        scheduledDate: "2026-03-01",
        estimatedMinutes: 60,
      });
    });

    await waitFor(() =>
      expect(result.current.tasks[0].name).toBe("更新後のタスク"),
    );
    expect(result.current.tasks[0].scheduledDate).toBe("2026-03-01");
    expect(result.current.tasks[0].estimatedMinutes).toBe(60);
  });

  it("deleteTaskでタスクを削除できる", async () => {
    const task = makeTask();
    vi.mocked(api.deleteTask).mockResolvedValue(undefined);

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.deleteTask(task.id);
    });

    await waitFor(() => expect(result.current.tasks).toHaveLength(0));
  });

  it("toggleCompleteでタスクの完了を切り替えられる", async () => {
    const task = makeTask();
    vi.mocked(api.updateTask)
      .mockResolvedValueOnce(makeTask({ id: task.id, status: "done" }))
      .mockResolvedValueOnce(makeTask({ id: task.id, status: "todo" }));

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.toggleComplete(task.id);
    });

    await waitFor(() => expect(result.current.tasks[0].status).toBe("done"));

    await act(async () => {
      await result.current.toggleComplete(task.id);
    });

    await waitFor(() => expect(result.current.tasks[0].status).toBe("todo"));
  });

  it("完了時にisNextがtrueのタスクは自動でisNextがfalseになる", async () => {
    const task = makeTask({ isNext: true });
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({
        id: task.id,
        status: "done",
        isNext: false,
      }),
    );

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.toggleComplete(task.id);
    });

    await waitFor(() => expect(result.current.tasks[0].status).toBe("done"));
    expect(result.current.tasks[0].isNext).toBe(false);
  });

  it("setNextTaskで「次やる」を設定すると他のタスクのisNextが解除される", async () => {
    const tasks = [makeTask({ id: "task-1" }), makeTask({ id: "task-2" })];
    vi.mocked(api.updateTask).mockImplementation(async (id, input) => {
      const task = tasks.find((candidate) => candidate.id === id)!;
      return makeTask({
        ...task,
        ...input,
        id,
        categoryId: (input.categoryId ?? "") as string,
      });
    });

    const { result } = renderUseTasks(tasks);

    await act(async () => {
      await result.current.setNextTask("task-1");
    });

    await waitFor(() => expect(result.current.tasks[0].isNext).toBe(true));
    expect(result.current.tasks[1].isNext).toBe(false);

    await act(async () => {
      await result.current.setNextTask("task-2");
    });

    await waitFor(() => expect(result.current.tasks[0].isNext).toBe(false));
    expect(result.current.tasks[1].isNext).toBe(true);
  });

  it("unsetNextTaskで「次やる」を解除できる", async () => {
    const task = makeTask({ isNext: true });
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({
        id: task.id,
        isNext: false,
      }),
    );

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.unsetNextTask(task.id);
    });

    await waitFor(() => expect(result.current.tasks[0].isNext).toBe(false));
  });

  it("startWorkでステータスがin_progressになる", async () => {
    const task = makeTask();
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({
        id: task.id,
        status: "in_progress",
      }),
    );

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.startWork(task.id);
    });

    await waitFor(() =>
      expect(result.current.tasks[0].status).toBe("in_progress"),
    );
  });

  it("completeTaskでステータスがdoneになりisNextがfalseになる", async () => {
    const task = makeTask({ isNext: true, status: "in_progress" });
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({
        id: task.id,
        status: "done",
        isNext: false,
      }),
    );

    const { result } = renderUseTasks([task]);

    await act(async () => {
      await result.current.completeTask(task.id);
    });

    await waitFor(() => expect(result.current.tasks[0].status).toBe("done"));
    expect(result.current.tasks[0].isNext).toBe(false);
  });

  it("categoryIdがあるタスクにcategory情報を解決する", () => {
    const category = makeCategory();
    const task = makeTask({ categoryId: category.id });

    const { result } = renderUseTasks([task], [category]);

    expect(result.current.tasks[0].category.name).toBe(category.name);
    expect(result.current.tasks[0].category.color).toBe(category.color);
  });
});
