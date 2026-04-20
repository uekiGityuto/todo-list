"use client";

import { Suspense } from "react";
import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import { TimerPageContent } from "./timer-page-content";

type TimerPageProps = {
  initialTasks: Task[];
  initialCategories: Category[];
  initialTimerSession: TimerSession | null;
};

export function TimerPage({
  initialTasks,
  initialCategories,
  initialTimerSession,
}: TimerPageProps) {
  return (
    <Suspense>
      <TimerPageContent
        initialTasks={initialTasks}
        initialCategories={initialCategories}
        initialTimerSession={initialTimerSession}
      />
    </Suspense>
  );
}
