import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkRecords } from "@/shared/hooks/use-work-records";
import * as api from "@/shared/lib/api";

import type { TaskWithCategory } from "@/shared/types/task";
import type { WorkRecord } from "@/shared/types/work-record";

import { createQueryClientWrapper } from "./query-client-wrapper";

vi.mock("@/shared/lib/api", () => ({
  createWorkRecord: vi.fn(),
  fetchWorkRecords: vi.fn(),
}));

const makeTasks = (
  overrides: Partial<TaskWithCategory>[] = [],
): TaskWithCategory[] =>
  overrides.map((override, index) => ({
    id: `task-${index + 1}`,
    name: `タスク${index + 1}`,
    categoryId: `cat-${index + 1}`,
    status: "todo",
    isNext: false,
    estimatedMinutes: null,
    scheduledDate: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    category: {
      id: `cat-${index + 1}`,
      name: `カテゴリ${index + 1}`,
      color: "#000",
    },
    ...override,
  }));

const makeRecord = (
  overrides: Partial<WorkRecord> & { taskId: string; date: string },
): WorkRecord => ({
  id: "record-1",
  durationMinutes: 30,
  result: "completed",
  ...overrides,
});

function renderUseWorkRecords(
  tasks: TaskWithCategory[],
  workRecords: WorkRecord[] = [],
) {
  vi.mocked(api.fetchWorkRecords).mockResolvedValue(workRecords);

  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useWorkRecords(tasks, { workRecords }), { wrapper });
}

describe("useWorkRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では空のデータを返す", () => {
    const { result } = renderUseWorkRecords([]);

    expect(result.current.recentWorkByDay).toEqual([]);
    expect(result.current.getWorkRecordsByMonth(2026, 2)).toEqual([]);
  });

  it("addWorkRecordで作業記録を追加できる", async () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);
    vi.mocked(api.createWorkRecord).mockResolvedValue(
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-26",
        durationMinutes: 25,
      }),
    );

    const { result } = renderUseWorkRecords(tasks);

    await act(async () => {
      await result.current.addWorkRecord({
        taskId: "t1",
        date: "2026-02-26",
        durationMinutes: 25,
        result: "completed",
      });
    });

    await waitFor(() => expect(result.current.recentWorkByDay).toHaveLength(1));
    expect(result.current.recentWorkByDay[0].records[0].taskId).toBe("t1");
    expect(result.current.recentWorkByDay[0].records[0].durationMinutes).toBe(
      25,
    );
  });

  it("getWorkRecordsByMonthで指定月のレコードを返す", () => {
    const records = [
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
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);

    const { result } = renderUseWorkRecords(tasks, records);
    const febRecords = result.current.getWorkRecordsByMonth(2026, 2);

    expect(febRecords).toHaveLength(2);
    expect(febRecords[0].taskName).toBe("タスクA");
    expect(febRecords[0].categoryColor).toBe("#f00");
  });

  it("getWorkRecordsByMonthで該当レコードがなければ空配列を返す", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);
    const records = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-10",
      }),
    ];

    const { result } = renderUseWorkRecords(tasks, records);

    expect(result.current.getWorkRecordsByMonth(2026, 1)).toEqual([]);
  });
});
