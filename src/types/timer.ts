import type { TaskWithCategory } from "./task";

/** localStorage に保存する形 */
export type TimerSession = {
  taskId: string;
  startedAt: string;
  estimatedMinutes: number;
};

/** hooks が返す形（コンポーネントはこちらを使う） */
export type TimerSessionWithTask = TimerSession & {
  task: TaskWithCategory;
};
