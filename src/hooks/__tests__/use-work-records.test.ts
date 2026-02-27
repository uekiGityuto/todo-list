import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkRecords } from "@/hooks/use-work-records";

import type { TaskWithCategory } from "@/types/task";
import type { WorkRecord } from "@/types/work-record";

const makeTasks = (
  overrides: Partial<TaskWithCategory>[] = [],
): TaskWithCategory[] =>
  overrides.map((o, i) => ({
    id: `task-${i + 1}`,
    name: `タスク${i + 1}`,
    categoryId: `cat-${i + 1}`,
    status: "todo" as const,
    isNext: false,
    estimatedMinutes: null,
    scheduledDate: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    category: { id: `cat-${i + 1}`, name: `カテゴリ${i + 1}`, color: "#000" },
    ...o,
  }));

const makeRecord = (
  overrides: Partial<WorkRecord> & { taskId: string; date: string },
): WorkRecord => ({
  id: `record-${Math.random()}`,
  durationMinutes: 30,
  result: "completed" as const,
  ...overrides,
});

describe("useWorkRecords", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-uuid");
  });

  it("初期状態では空のデータを返す", () => {
    const { result } = renderHook(() => useWorkRecords([]));
    expect(result.current.recentWorkByDay).toEqual([]);
    expect(result.current.getWorkRecordsByMonth(2026, 2)).toEqual([]);
  });

  it("localStorageに作業記録がある場合はそれを返す", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-25",
        durationMinutes: 30,
      }),
    ];
    localStorage.setItem("work-records", JSON.stringify(records));

    const tasks = makeTasks([
      {
        id: "t1",
        name: "テスト",
        category: { id: "c1", name: "Cat", color: "#000" },
      },
    ]);

    const { result } = renderHook(() => useWorkRecords(tasks));
    expect(result.current.recentWorkByDay).toHaveLength(1);
  });

  it("addWorkRecordで作業記録を追加できる", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);

    const { result } = renderHook(() => useWorkRecords(tasks));

    act(() => {
      result.current.addWorkRecord({
        taskId: "t1",
        date: "2026-02-26",
        durationMinutes: 25,
        result: "completed",
      });
    });

    expect(result.current.recentWorkByDay).toHaveLength(1);
    expect(result.current.recentWorkByDay[0].records[0].taskId).toBe("t1");
    expect(result.current.recentWorkByDay[0].records[0].durationMinutes).toBe(
      25,
    );
  });

  it("getWorkRecordsByMonthで指定月のレコードを返す", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-10",
        durationMinutes: 30,
      }),
      makeRecord({
        id: "r2",
        taskId: "t1",
        date: "2026-02-20",
        durationMinutes: 45,
      }),
      makeRecord({
        id: "r3",
        taskId: "t1",
        date: "2026-03-01",
        durationMinutes: 60,
      }),
    ];
    localStorage.setItem("work-records", JSON.stringify(records));

    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);

    const { result } = renderHook(() => useWorkRecords(tasks));
    const febRecords = result.current.getWorkRecordsByMonth(2026, 2);

    expect(febRecords).toHaveLength(2);
    expect(febRecords[0].taskName).toBe("タスクA");
    expect(febRecords[0].categoryColor).toBe("#f00");
  });

  it("getWorkRecordsByMonthで該当レコードがなければ空配列を返す", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-10",
        durationMinutes: 30,
      }),
    ];
    localStorage.setItem("work-records", JSON.stringify(records));

    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);

    const { result } = renderHook(() => useWorkRecords(tasks));
    const janRecords = result.current.getWorkRecordsByMonth(2026, 1);

    expect(janRecords).toEqual([]);
  });
});
