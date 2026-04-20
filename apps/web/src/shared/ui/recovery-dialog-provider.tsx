"use client";

import { format } from "date-fns";
import { useCallback } from "react";

import { useCurrentTimerSession } from "@/shared/hooks/use-current-timer-session";
import { useTasks } from "@/shared/hooks/use-tasks";
import { calcDurationMinutes } from "@/shared/hooks/use-timer";
import { useWorkRecords } from "@/shared/hooks/use-work-records";
import type { TimerSession } from "@/shared/types/timer";
import { RecoveryDialog } from "@/shared/ui/recovery-dialog";

export function RecoveryDialogProvider({
  initialSession,
}: {
  initialSession: TimerSession | null;
}) {
  const { session, clearSession } = useCurrentTimerSession(initialSession);
  const { tasks, completeTask } = useTasks();
  const { addWorkRecord } = useWorkRecords(tasks);

  const handleComplete = useCallback(
    async (activeSession: TimerSession) => {
      await completeTask(activeSession.taskId);
      await addWorkRecord({
        taskId: activeSession.taskId,
        date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(
          1,
          calcDurationMinutes(activeSession.startedAt),
        ),
        result: "completed",
      });
      await clearSession();
    },
    [addWorkRecord, clearSession, completeTask],
  );

  const handleInterrupt = useCallback(
    async (activeSession: TimerSession) => {
      await addWorkRecord({
        taskId: activeSession.taskId,
        date: format(new Date(activeSession.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(
          1,
          calcDurationMinutes(activeSession.startedAt),
        ),
        result: "interrupted",
      });
      await clearSession();
    },
    [addWorkRecord, clearSession],
  );

  return (
    <RecoveryDialog
      session={session}
      onComplete={handleComplete}
      onInterrupt={handleInterrupt}
    />
  );
}
