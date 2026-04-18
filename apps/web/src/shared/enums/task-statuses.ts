export const TASK_STATUSES = {
  todo: { label: "未着手" },
  in_progress: { label: "作業中" },
  done: { label: "完了" },
} as const;

export type TaskStatus = keyof typeof TASK_STATUSES;
