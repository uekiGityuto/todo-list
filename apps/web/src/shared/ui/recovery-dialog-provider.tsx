"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useRef } from "react";

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

  // 各ステップ独立のキー（部分失敗時にリトライ可能にする）
  // updateTask は PUT で自然に冪等なので、リトライ時は新しいキーで再実行可能
  const completeUpdateKeyRef = useRef(crypto.randomUUID());
  const completeRecordKeyRef = useRef(crypto.randomUUID());
  const interruptRecordKeyRef = useRef(crypto.randomUUID());

  const handleComplete = useCallback(
    async (activeSession: TimerSession) => {
      const tasks = await fetchTasks();
      const currentTask = tasks.find(
        (task) => task.id === activeSession.taskId,
      );
      if (!currentTask) {
        throw new Error("Task not found for recovery session");
      }

      const completedTask = await updateTask(
        activeSession.taskId,
        {
          name: currentTask.name,
          categoryId:
            currentTask.categoryId === "" ? null : currentTask.categoryId,
          status: "done",
          isNext: false,
          estimatedMinutes: currentTask.estimatedMinutes,
          scheduledDate: currentTask.scheduledDate,
        },
        completeUpdateKeyRef.current,
      );
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = tasks) =>
        prev.map((task) =>
          task.id === completedTask.id ? completedTask : task,
        ),
      );

      const createdRecord = await createWorkRecord(
        {
          taskId: activeSession.taskId,
          date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
          durationMinutes: Math.max(
            1,
            calcDurationMinutes(activeSession.startedAt),
          ),
          result: "completed",
        },
        completeRecordKeyRef.current,
      );
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => [...prev, createdRecord],
      );
      await clearSession();
      // 全ステップ成功後にキーを再生成
      completeUpdateKeyRef.current = crypto.randomUUID();
      completeRecordKeyRef.current = crypto.randomUUID();
    },
    [clearSession, queryClient],
  );

  const handleInterrupt = useCallback(
    async (activeSession: TimerSession) => {
      const createdRecord = await createWorkRecord(
        {
          taskId: activeSession.taskId,
          date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
          durationMinutes: Math.max(
            1,
            calcDurationMinutes(activeSession.startedAt),
          ),
          result: "interrupted",
        },
        interruptRecordKeyRef.current,
      );
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => [...prev, createdRecord],
      );
      await clearSession();
      interruptRecordKeyRef.current = crypto.randomUUID();
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
