"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { WorkResult } from "@/shared/enums/work-results";
import { createWorkRecord, fetchWorkRecords } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/api/query-keys";
import type { TaskWithCategory } from "@/shared/types/task";
import type { WorkRecord } from "@/shared/types/work-record";

export type WorkRecordWithTask = WorkRecord & {
  taskName: string;
  categoryName: string;
  categoryColor: string;
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

export type WorkRecordsInitialData = {
  workRecords: WorkRecord[];
};

type UseWorkRecordsReturn = {
  recentWorkByDay: DayGroup[];
  addWorkRecord: (input: AddWorkRecordInput) => Promise<void>;
  getWorkRecordsByMonth: (year: number, month: number) => WorkRecordWithTask[];
};

const RECENT_DAYS_COUNT = 3;

export function useWorkRecords(
  tasks: TaskWithCategory[],
  initialData?: WorkRecordsInitialData,
): UseWorkRecordsReturn {
  const queryClient = useQueryClient();
  const { data: workRecords = [] } = useQuery({
    queryKey: queryKeys.workRecords,
    queryFn: fetchWorkRecords,
    initialData: initialData?.workRecords,
  });

  const createWorkRecordMutation = useMutation({
    mutationFn: createWorkRecord,
    onSuccess: (createdRecord) => {
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => [...prev, createdRecord],
      );
    },
  });

  const recentWorkByDay = useMemo(
    () => buildRecentWorkByDay(workRecords, tasks),
    [workRecords, tasks],
  );

  const addWorkRecord = useCallback(
    async (input: AddWorkRecordInput) => {
      await createWorkRecordMutation.mutateAsync(input);
    },
    [createWorkRecordMutation],
  );

  const getWorkRecordsByMonth = useCallback(
    (year: number, month: number): WorkRecordWithTask[] => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return workRecords
        .filter((record) => record.date.startsWith(prefix))
        .map((record) => ({
          ...record,
          ...resolveTaskInfo(record.taskId, tasks),
        }));
    },
    [workRecords, tasks],
  );

  return { recentWorkByDay, addWorkRecord, getWorkRecordsByMonth };
}

function resolveTaskInfo(
  taskId: string,
  tasks: TaskWithCategory[],
): { taskName: string; categoryName: string; categoryColor: string } {
  const task = tasks.find((candidate) => candidate.id === taskId);
  return {
    taskName: task?.name ?? "",
    categoryName: task?.category.name ?? "",
    categoryColor: task?.category.color ?? "",
  };
}

export function buildRecentWorkByDay(
  workRecords: WorkRecord[],
  tasks: TaskWithCategory[],
): DayGroup[] {
  const byDate = new Map<string, WorkRecord[]>();
  for (const record of workRecords) {
    const existing = byDate.get(record.date);
    if (existing) {
      existing.push(record);
    } else {
      byDate.set(record.date, [record]);
    }
  }

  const sortedDates = [...byDate.keys()].sort().reverse();
  const recentDates = sortedDates.slice(0, RECENT_DAYS_COUNT);
  const seenTaskIds = new Set<string>();
  const result: DayGroup[] = [];

  for (const date of recentDates) {
    const dayRecords = byDate.get(date) ?? [];
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
