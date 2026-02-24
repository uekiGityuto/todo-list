import type { TaskStatus } from "@/enums/task-statuses";

export type Category = {
  id: string;
  name: string;
  color: string;
};

/** localStorage に保存する形 */
export type Task = {
  id: string;
  name: string;
  categoryId: string;
  status: TaskStatus;
  isNext: boolean;
  estimatedMinutes: number | null;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
};

/** hooks が返す形（コンポーネントはこちらを使う） */
export type TaskWithCategory = Task & {
  category: Category;
};
