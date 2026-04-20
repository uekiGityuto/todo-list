"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback } from "react";

import { useCurrentTimerSession } from "@/shared/hooks/use-current-timer-session";
import { calcDurationMinutes } from "@/shared/hooks/use-timer";
import { createWorkRecord, fetchTasks, updateTask } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/api/query-keys";
import type { Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";
import { RecoveryDialog } from "@/shared/ui/recovery-dialog";

export function RecoveryDialogProvider({
  initialSession,
}: {
  initialSession: TimerSession | null;
}) {
  const queryClient = useQueryClient();
  const { session, clearSession } = useCurrentTimerSession(initialSession);

  const handleComplete = useCallback(
    async (activeSession: TimerSession) => {
      const tasks = await fetchTasks();
      const currentTask = tasks.find(
        (task) => task.id === activeSession.taskId,
      );
      if (!currentTask) {
        throw new Error("Task not found for recovery session");
      }

      const completedTask = await updateTask(activeSession.taskId, {
        name: currentTask.name,
        categoryId:
          currentTask.categoryId === "" ? null : currentTask.categoryId,
        status: "done",
        isNext: false,
        estimatedMinutes: currentTask.estimatedMinutes,
        scheduledDate: currentTask.scheduledDate,
      });
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = tasks) =>
        prev.map((task) =>
          task.id === completedTask.id ? completedTask : task,
        ),
      );

      const createdRecord = await createWorkRecord({
        taskId: activeSession.taskId,
        date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(
          1,
          calcDurationMinutes(activeSession.startedAt),
        ),
        result: "completed",
      });
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => [...prev, createdRecord],
      );
      await clearSession();
    },
    [clearSession, queryClient],
  );

  const handleInterrupt = useCallback(
    async (activeSession: TimerSession) => {
      const createdRecord = await createWorkRecord({
        taskId: activeSession.taskId,
        date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(
          1,
          calcDurationMinutes(activeSession.startedAt),
        ),
        result: "interrupted",
      });
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => [...prev, createdRecord],
      );
      await clearSession();
    },
    [clearSession, queryClient],
  );

  return (
    <RecoveryDialog
      session={session}
      onComplete={handleComplete}
      onInterrupt={handleInterrupt}
    />
  );
}
