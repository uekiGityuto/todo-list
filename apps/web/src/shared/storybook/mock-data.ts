import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";

export const storyCategories: Category[] = [
  { id: "cat-client", name: "クライアント", color: "#2563EB" },
  { id: "cat-product", name: "プロダクト", color: "#059669" },
  { id: "cat-admin", name: "運用", color: "#D97706" },
];

export const storyTasks: Task[] = [
  {
    id: "task-next",
    name: "Issue #47 の方針を整理してコメントを書く",
    categoryId: "cat-product",
    status: "in_progress",
    isNext: true,
    estimatedMinutes: 45,
    scheduledDate: "2026-04-26",
    createdAt: "2026-04-26T08:30:00.000Z",
    updatedAt: "2026-04-26T09:10:00.000Z",
  },
  {
    id: "task-home-1",
    name: "Storybook の初期セットアップを入れる",
    categoryId: "cat-product",
    status: "todo",
    isNext: false,
    estimatedMinutes: 60,
    scheduledDate: "2026-04-26",
    createdAt: "2026-04-26T07:30:00.000Z",
    updatedAt: "2026-04-26T08:00:00.000Z",
  },
  {
    id: "task-home-2",
    name: "Playwright スモークのシナリオを洗い出す",
    categoryId: "cat-client",
    status: "todo",
    isNext: false,
    estimatedMinutes: 30,
    scheduledDate: "2026-04-26",
    createdAt: "2026-04-26T07:45:00.000Z",
    updatedAt: "2026-04-26T08:20:00.000Z",
  },
  {
    id: "task-done",
    name: "Supabase ローカル環境を立ち上げる",
    categoryId: "cat-admin",
    status: "done",
    isNext: false,
    estimatedMinutes: 20,
    scheduledDate: "2026-04-25",
    createdAt: "2026-04-25T04:00:00.000Z",
    updatedAt: "2026-04-25T04:30:00.000Z",
  },
];

export const storyWorkRecords: WorkRecord[] = [
  {
    id: "record-1",
    taskId: "task-done",
    date: "2026-04-25",
    durationMinutes: 22,
    result: "completed",
  },
  {
    id: "record-2",
    taskId: "task-home-2",
    date: "2026-04-24",
    durationMinutes: 18,
    result: "interrupted",
  },
  {
    id: "record-3",
    taskId: "task-next",
    date: "2026-04-23",
    durationMinutes: 35,
    result: "completed",
  },
];

export const storyTimerSession: TimerSession = {
  taskId: "task-next",
  taskName: "Issue #47 の方針を整理してコメントを書く",
  categoryName: "プロダクト",
  estimatedMinutes: 45,
  startedAt: "2026-04-26T09:15:00.000Z",
};
