import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTasks } from "@/hooks/use-tasks";

vi.stubGlobal(
  "crypto",
  Object.assign({}, crypto, {
    randomUUID: () => {
      let counter = 0;
      return () => `uuid-${++counter}`;
    },
  }),
);

describe("useTasks", () => {
  let uuidCounter: number;

  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      uuidCounter++;
      return `uuid-${uuidCounter}`;
    });
  });

  it("初期状態では空のタスクとカテゴリを返す", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
    expect(result.current.categories).toEqual([]);
  });

  it("addTaskでタスクを追加できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "テストタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: 30,
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].name).toBe("テストタスク");
    expect(result.current.tasks[0].status).toBe("todo");
    expect(result.current.tasks[0].isNext).toBe(false);
    expect(result.current.tasks[0].estimatedMinutes).toBe(30);
  });

  it("updateTaskでタスクを更新できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "元のタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.updateTask(taskId, {
        name: "更新後のタスク",
        categoryId: "",
        scheduledDate: "2026-03-01",
        estimatedMinutes: 60,
      });
    });

    expect(result.current.tasks[0].name).toBe("更新後のタスク");
    expect(result.current.tasks[0].scheduledDate).toBe("2026-03-01");
    expect(result.current.tasks[0].estimatedMinutes).toBe(60);
  });

  it("deleteTaskでタスクを削除できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "削除するタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it("toggleCompleteでタスクの完了を切り替えられる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "完了テスト",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleComplete(taskId);
    });

    expect(result.current.tasks[0].status).toBe("done");

    act(() => {
      result.current.toggleComplete(taskId);
    });

    expect(result.current.tasks[0].status).toBe("todo");
  });

  it("完了時にisNextがtrueのタスクは自動でisNextがfalseになる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "次やるタスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.setNextTask(taskId);
    });

    expect(result.current.tasks[0].isNext).toBe(true);

    act(() => {
      result.current.toggleComplete(taskId);
    });

    expect(result.current.tasks[0].status).toBe("done");
    expect(result.current.tasks[0].isNext).toBe(false);
  });

  it("setNextTaskで「次やる」を設定すると他のタスクのisNextが解除される", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "タスク1",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
      result.current.addTask({
        name: "タスク2",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const task1Id = result.current.tasks[0].id;
    const task2Id = result.current.tasks[1].id;

    act(() => {
      result.current.setNextTask(task1Id);
    });

    expect(result.current.tasks[0].isNext).toBe(true);
    expect(result.current.tasks[1].isNext).toBe(false);

    act(() => {
      result.current.setNextTask(task2Id);
    });

    expect(result.current.tasks[0].isNext).toBe(false);
    expect(result.current.tasks[1].isNext).toBe(true);
  });

  it("unsetNextTaskで「次やる」を解除できる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "タスク",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.setNextTask(taskId);
    });

    expect(result.current.tasks[0].isNext).toBe(true);

    act(() => {
      result.current.unsetNextTask(taskId);
    });

    expect(result.current.tasks[0].isNext).toBe(false);
  });

  it("startWorkでステータスがin_progressになる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "作業開始テスト",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.startWork(taskId);
    });

    expect(result.current.tasks[0].status).toBe("in_progress");
  });

  it("completeTaskでステータスがdoneになりisNextがfalseになる", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        name: "完了テスト",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: null,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.setNextTask(taskId);
    });

    expect(result.current.tasks[0].isNext).toBe(true);

    act(() => {
      result.current.completeTask(taskId);
    });

    expect(result.current.tasks[0].status).toBe("done");
    expect(result.current.tasks[0].isNext).toBe(false);
  });
});
