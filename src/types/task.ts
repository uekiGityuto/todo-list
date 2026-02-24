import type { TaskStatus } from "@/enums/task-statuses";

export type Category = {
  id: string;
  name: string;
  color: string;
};

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
