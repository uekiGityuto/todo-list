import { describe, expect, it } from "vitest";

import { buildRecentWorkByDay } from "@/hooks/use-work-records";

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

describe("buildRecentWorkByDay", () => {
  it("空の作業記録では空配列を返す", () => {
    const result = buildRecentWorkByDay([], []);
    expect(result).toEqual([]);
  });

  it("直近3日分の作業記録をグルーピングする", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
      {
        id: "t2",
        name: "タスクB",
        category: { id: "c2", name: "カテB", color: "#0f0" },
      },
      {
        id: "t3",
        name: "タスクC",
        category: { id: "c3", name: "カテC", color: "#00f" },
      },
    ]);

    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-23",
        durationMinutes: 45,
      }),
      makeRecord({
        id: "r2",
        taskId: "t2",
        date: "2026-02-22",
        durationMinutes: 30,
      }),
      makeRecord({
        id: "r3",
        taskId: "t3",
        date: "2026-02-21",
        durationMinutes: 15,
      }),
      makeRecord({
        id: "r4",
        taskId: "t1",
        date: "2026-02-20",
        durationMinutes: 60,
      }),
    ];

    const result = buildRecentWorkByDay(records, tasks);

    expect(result).toHaveLength(3);
    expect(result[0].date).toBe("2026-02-23");
    expect(result[1].date).toBe("2026-02-22");
    expect(result[2].date).toBe("2026-02-21");
  });

  it("同じタスクが複数日にまたがる場合は最新日のみ表示する", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#f00" },
      },
    ]);

    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-25",
        durationMinutes: 30,
      }),
      makeRecord({
        id: "r2",
        taskId: "t1",
        date: "2026-02-24",
        durationMinutes: 45,
      }),
    ];

    const result = buildRecentWorkByDay(records, tasks);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-02-25");
    expect(result[0].records).toHaveLength(1);
    expect(result[0].records[0].taskName).toBe("タスクA");
  });

  it("各日のレコードは降順（最新が先）で返る", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "", color: "" },
      },
      {
        id: "t2",
        name: "タスクB",
        category: { id: "c2", name: "", color: "" },
      },
    ]);

    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-25",
        durationMinutes: 30,
      }),
      makeRecord({
        id: "r2",
        taskId: "t2",
        date: "2026-02-25",
        durationMinutes: 45,
      }),
    ];

    const result = buildRecentWorkByDay(records, tasks);

    expect(result[0].records[0].taskName).toBe("タスクB");
    expect(result[0].records[1].taskName).toBe("タスクA");
  });

  it("タスク情報が見つからない場合は空文字を返す", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "unknown",
        date: "2026-02-25",
        durationMinutes: 30,
      }),
    ];

    const result = buildRecentWorkByDay(records, []);

    expect(result[0].records[0].taskName).toBe("");
    expect(result[0].records[0].categoryName).toBe("");
    expect(result[0].records[0].categoryColor).toBe("");
  });

  it("categoryColorがレコードに含まれる", () => {
    const tasks = makeTasks([
      {
        id: "t1",
        name: "タスクA",
        category: { id: "c1", name: "カテA", color: "#ff0000" },
      },
    ]);

    const records: WorkRecord[] = [
      makeRecord({
        id: "r1",
        taskId: "t1",
        date: "2026-02-25",
        durationMinutes: 30,
      }),
    ];

    const result = buildRecentWorkByDay(records, tasks);

    expect(result[0].records[0].categoryColor).toBe("#ff0000");
  });
});
