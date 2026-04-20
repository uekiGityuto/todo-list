"use client";

import { format } from "date-fns";
import { Check, Pause } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useLogout } from "@/shared/hooks/use-logout";
import { type TasksInitialData, useTasks } from "@/shared/hooks/use-tasks";
import type { TimerResult } from "@/shared/hooks/use-timer";
import { useTimer } from "@/shared/hooks/use-timer";
import {
  useWorkRecords,
  type WorkRecordsInitialData,
} from "@/shared/hooks/use-work-records";
import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Sidebar } from "@/shared/ui/sidebar";
import { TabBar } from "@/shared/ui/tab-bar";
import { TimerEndDialog } from "./timer-end-dialog";
import { TimerRing } from "./timer-ring";

const DEFAULT_MINUTES = 60;

type TimerPageContentProps = {
  initialTasks: Task[];
  initialCategories: Category[];
  initialWorkRecords?: WorkRecord[];
  initialTimerSession: TimerSession | null;
};

export function TimerPageContent({
  initialTasks,
  initialCategories,
  initialWorkRecords,
  initialTimerSession,
}: TimerPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const startedTaskIdRef = useRef<string | null>(null);

  const { tasks, startWork, completeTask } = useTasks({
    tasks: initialTasks,
    categories: initialCategories,
  } satisfies TasksInitialData);
  const { addWorkRecord } = useWorkRecords(tasks, {
    workRecords: initialWorkRecords ?? [],
  } satisfies WorkRecordsInitialData);

  const task = useMemo(
    () => tasks.find((t) => t.id === taskId),
    [tasks, taskId],
  );

  const estimatedMinutes = task?.estimatedMinutes ?? DEFAULT_MINUTES;

  const timer = useTimer(
    {
      taskId: taskId ?? "",
      taskName: task?.name ?? "",
      categoryName: task?.category.name ?? "",
      estimatedMinutes,
    },
    initialTimerSession,
  );

  useEffect(() => {
    if (
      !taskId ||
      !task ||
      timer.isRunning ||
      timer.isFinished ||
      startedTaskIdRef.current === taskId
    ) {
      return;
    }

    startedTaskIdRef.current = taskId;

    void (async () => {
      try {
        await startWork(taskId);
        await timer.start();
      } catch {
        if (startedTaskIdRef.current === taskId) {
          startedTaskIdRef.current = null;
        }
      }
    })();
  }, [startWork, task, taskId, timer]);

  const handleLogout = useLogout();
  const handleNavChange = useCallback(
    (key: string) => {
      const routes: Record<string, string> = {
        home: "/",
        tasks: "/tasks",
        calendar: "/calendar",
        settings: "/settings",
      };
      const route = routes[key];
      if (route) router.push(route);
    },
    [router],
  );

  const recordWork = useCallback(
    async (result: TimerResult, workResult: "completed" | "interrupted") => {
      await addWorkRecord({
        taskId: result.taskId,
        date: format(new Date(result.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(1, result.durationMinutes),
        result: workResult,
      });
    },
    [addWorkRecord],
  );

  const handleComplete = useCallback(async () => {
    const result = await timer.complete();
    if (taskId) {
      await completeTask(taskId);
    }
    await recordWork(result, "completed");
    router.push("/");
  }, [timer, taskId, completeTask, recordWork, router]);

  const handleInterrupt = useCallback(async () => {
    const result = await timer.interrupt();
    await recordWork(result, "interrupted");
    router.push("/");
  }, [timer, recordWork, router]);

  const handleContinue = useCallback(async () => {
    await timer.restart();
  }, [timer]);

  if (!taskId) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">タスクが指定されていません</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar
          activeItem="home"
          onItemChange={handleNavChange}
          onLogout={handleLogout}
        />

        <main className="flex flex-1 flex-col items-center justify-center gap-8 p-5 md:p-8">
          <h1 className="text-center text-base font-semibold text-foreground">
            {task?.name ?? ""}
          </h1>

          {task?.category.name && <Badge>{task.category.name}</Badge>}

          <TimerRing
            remainingSeconds={timer.remainingSeconds}
            totalSeconds={estimatedMinutes * 60}
          />

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleInterrupt}
              className="h-12 rounded-3xl px-6 text-base font-semibold"
            >
              <Pause className="size-4" />
              中断
            </Button>
            <Button
              onClick={handleComplete}
              className="h-12 rounded-3xl px-6 text-base font-semibold"
            >
              <Check className="size-4" />
              完了
            </Button>
          </div>
        </main>
      </div>

      <TabBar activeTab="home" onTabChange={handleNavChange} />

      <TimerEndDialog
        open={timer.isFinished}
        taskName={task?.name ?? ""}
        onComplete={handleComplete}
        onContinue={handleContinue}
        onInterrupt={handleInterrupt}
      />
    </div>
  );
}
