import type { WorkResult } from "@/shared/enums/work-results";

export type WorkRecord = {
  id: string;
  taskId: string;
  date: string;
  durationMinutes: number;
  result: WorkResult;
};
