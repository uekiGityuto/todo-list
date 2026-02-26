"use client";

import { useCallback, useMemo } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

import type { WorkResult } from "@/enums/work-results";
import type { TaskWithCategory } from "@/types/task";
import type { WorkRecord } from "@/types/work-record";

export type WorkRecordWithTask = WorkRecord & {
  taskName: string;
  categoryName: string;
};

export type DayGroup = {
  date: string;
  records: WorkRecordWithTask[];
};

type AddWorkRecordInput = {
  taskId: string;
  date: string;
  durationMinutes: number;
  result: WorkResult;
};

type UseWorkRecordsReturn = {
  recentWorkByDay: DayGroup[];
  addWorkRecord: (input: AddWorkRecordInput) => void;
};

const RECENT_DAYS_COUNT = 3;

export function useWorkRecords(
  tasks: TaskWithCategory[],
): UseWorkRecordsReturn {
  const { value: workRecords, setValue: setWorkRecords } = useLocalStorage<
    WorkRecord[]
  >("work-records", []);

  const recentWorkByDay = useMemo(
    () => buildRecentWorkByDay(workRecords, tasks),
    [workRecords, tasks],
  );

  const addWorkRecord = useCallback(
    (input: AddWorkRecordInput) => {
      const newRecord: WorkRecord = {
        id: crypto.randomUUID(),
        taskId: input.taskId,
        date: input.date,
        durationMinutes: input.durationMinutes,
        result: input.result,
      };
      setWorkRecords((prev) => [...prev, newRecord]);
    },
    [setWorkRecords],
  );

  return { recentWorkByDay, addWorkRecord };
}

function resolveTaskInfo(
  taskId: string,
  tasks: TaskWithCategory[],
): { taskName: string; categoryName: string } {
  const task = tasks.find((t) => t.id === taskId);
  return {
    taskName: task?.name ?? "",
    categoryName: task?.category.name ?? "",
  };
}

export function buildRecentWorkByDay(
  workRecords: WorkRecord[],
  tasks: TaskWithCategory[],
): DayGroup[] {
  const byDate = new Map<string, WorkRecord[]>();
  for (const record of workRecords) {
    const dateKey = record.date;
    const existing = byDate.get(dateKey);
    if (existing) {
      existing.push(record);
    } else {
      byDate.set(dateKey, [record]);
    }
  }

  const sortedDates = [...byDate.keys()].sort().reverse();
  const recentDates = sortedDates.slice(0, RECENT_DAYS_COUNT);

  const seenTaskIds = new Set<string>();
  const result: DayGroup[] = [];

  for (const date of recentDates) {
    const dayRecords = byDate.get(date)!;
    const uniqueRecords: WorkRecordWithTask[] = [];

    for (const record of [...dayRecords].reverse()) {
      if (seenTaskIds.has(record.taskId)) continue;
      seenTaskIds.add(record.taskId);
      uniqueRecords.push({
        ...record,
        ...resolveTaskInfo(record.taskId, tasks),
      });
    }

    if (uniqueRecords.length > 0) {
      result.push({ date, records: uniqueRecords });
    }
  }

  return result;
}
