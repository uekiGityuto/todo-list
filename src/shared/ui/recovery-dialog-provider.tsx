"use client";

import { format } from "date-fns";
import { useCallback } from "react";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { useTasks } from "@/shared/hooks/use-tasks";
import {
  TIMER_SESSION_KEY,
  calcDurationMinutes,
} from "@/shared/hooks/use-timer";
import { useWorkRecords } from "@/shared/hooks/use-work-records";
import { RecoveryDialog } from "@/shared/ui/recovery-dialog";

import type { TimerSession } from "@/shared/types/timer";

export function RecoveryDialogProvider() {
  const { tasks, completeTask } = useTasks();
  const { addWorkRecord } = useWorkRecords(tasks);
  const { setValue: setSession } = useLocalStorage<TimerSession | null>(
    TIMER_SESSION_KEY,
    null,
  );

  const handleComplete = useCallback(
    (session: TimerSession) => {
      completeTask(session.taskId);
      addWorkRecord({
        taskId: session.taskId,
        date: format(new Date(session.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(1, calcDurationMinutes(session.startedAt)),
        result: "completed",
      });
      setSession(null);
    },
    [completeTask, addWorkRecord, setSession],
  );

  const handleInterrupt = useCallback(
    (session: TimerSession) => {
      addWorkRecord({
        taskId: session.taskId,
        date: format(new Date(session.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(1, calcDurationMinutes(session.startedAt)),
        result: "interrupted",
      });
      setSession(null);
    },
    [addWorkRecord, setSession],
  );

  return (
    <RecoveryDialog onComplete={handleComplete} onInterrupt={handleInterrupt} />
  );
}
