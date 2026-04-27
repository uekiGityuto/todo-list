import { format, subDays, subMinutes } from "date-fns";
import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";

const now = new Date();
now.setHours(9, 0, 0, 0);

function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toIsoString(date: Date) {
  return date.toISOString();
}

const today = toDateString(now);
const yesterday = toDateString(subDays(now, 1));
const twoDaysAgo = toDateString(subDays(now, 2));
const threeDaysAgo = toDateString(subDays(now, 3));

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
    scheduledDate: today,
    createdAt: toIsoString(subMinutes(now, 30)),
    updatedAt: toIsoString(subMinutes(now, 10)),
  },
  {
    id: "task-home-1",
    name: "Storybook の初期セットアップを入れる",
    categoryId: "cat-product",
    status: "todo",
    isNext: false,
    estimatedMinutes: 60,
    scheduledDate: today,
    createdAt: toIsoString(subMinutes(now, 90)),
    updatedAt: toIsoString(subMinutes(now, 60)),
  },
  {
    id: "task-home-2",
    name: "Playwright スモークのシナリオを洗い出す",
    categoryId: "cat-client",
    status: "todo",
    isNext: false,
    estimatedMinutes: 30,
    scheduledDate: today,
    createdAt: toIsoString(subMinutes(now, 75)),
    updatedAt: toIsoString(subMinutes(now, 40)),
  },
  {
    id: "task-done",
    name: "ローカル DB 環境を立ち上げる",
    categoryId: "cat-admin",
    status: "done",
    isNext: false,
    estimatedMinutes: 20,
    scheduledDate: yesterday,
    createdAt: toIsoString(subDays(subMinutes(now, 60), 1)),
    updatedAt: toIsoString(subDays(subMinutes(now, 30), 1)),
  },
];

export const storyWorkRecords: WorkRecord[] = [
  {
    id: "record-1",
    taskId: "task-done",
    date: yesterday,
    durationMinutes: 22,
    result: "completed",
  },
  {
    id: "record-2",
    taskId: "task-home-2",
    date: twoDaysAgo,
    durationMinutes: 18,
    result: "interrupted",
  },
  {
    id: "record-3",
    taskId: "task-next",
    date: threeDaysAgo,
    durationMinutes: 35,
    result: "completed",
  },
];

export const storyTimerSession: TimerSession = {
  taskId: "task-next",
  taskName: "Issue #47 の方針を整理してコメントを書く",
  categoryName: "プロダクト",
  estimatedMinutes: 45,
  startedAt: toIsoString(subMinutes(now, 5)),
};
