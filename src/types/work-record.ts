import type { WorkResult } from "@/enums/work-results";

export type WorkRecord = {
  id: string;
  taskId: string;
  date: string;
  durationMinutes: number;
  result: WorkResult;
};
