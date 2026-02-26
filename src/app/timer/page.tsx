"use client";

import { format } from "date-fns";
import { Check, Pause } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo } from "react";

import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { TimerEndDialog } from "@/components/timer-end-dialog";
import { TimerRing } from "@/components/timer-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { useTimer } from "@/hooks/use-timer";
import { useWorkRecords } from "@/hooks/use-work-records";

import type { TimerResult } from "@/hooks/use-timer";

const DEFAULT_MINUTES = 60;

function TimerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");

  const { tasks, startWork, completeTask } = useTasks();
  const { addWorkRecord } = useWorkRecords(tasks);

  const task = useMemo(
    () => tasks.find((t) => t.id === taskId),
    [tasks, taskId],
  );

  const estimatedMinutes = task?.estimatedMinutes ?? DEFAULT_MINUTES;

  const timer = useTimer({
    taskId: taskId ?? "",
    taskName: task?.name ?? "",
    categoryName: task?.category.name ?? "",
    estimatedMinutes,
  });

  useEffect(() => {
    if (!taskId) return;
    if (!timer.isRunning && !timer.isFinished) {
      if (task) {
        startWork(taskId);
      }
      timer.start();
    }
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps -- taskId 変更時のみ実行（timer/task/startWork は初回起動の制御に使うため除外）

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
    (result: TimerResult, workResult: "completed" | "interrupted") => {
      addWorkRecord({
        taskId: result.taskId,
        date: format(new Date(result.startedAt), "yyyy-MM-dd"),
        durationMinutes: Math.max(1, result.durationMinutes),
        result: workResult,
      });
    },
    [addWorkRecord],
  );

  const handleComplete = useCallback(() => {
    const result = timer.complete();
    if (taskId) completeTask(taskId);
    recordWork(result, "completed");
    router.push("/");
  }, [timer, taskId, completeTask, recordWork, router]);

  const handleInterrupt = useCallback(() => {
    const result = timer.interrupt();
    recordWork(result, "interrupted");
    router.push("/");
  }, [timer, recordWork, router]);

  const handleContinue = useCallback(() => {
    timer.restart();
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
        <Sidebar activeItem="home" onItemChange={handleNavChange} />

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

export default function TimerPage() {
  return (
    <Suspense>
      <TimerPageContent />
    </Suspense>
  );
}
