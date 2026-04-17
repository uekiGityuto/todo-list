"use client";

import { Suspense } from "react";

import { TimerPageContent } from "./timer-page-content";

export function TimerPage() {
  return (
    <Suspense>
      <TimerPageContent />
    </Suspense>
  );
}
