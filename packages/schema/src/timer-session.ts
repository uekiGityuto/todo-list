import { z } from "zod";
import { MAX_ESTIMATED_MINUTES, taskNameSchema } from "./primitives";

// 注: categoryName は未分類タスクのため空文字を許容する仕様。
// `categoryNameSchema` は trim + min(1) を要求するため再利用しない。
// 過剰長だけは categoryNameSchema と同じ 50 文字でガードする。
const CATEGORY_NAME_MAX = 50;

export const createTimerSessionSchema = z.object({
  taskId: z.uuid(),
  taskName: taskNameSchema,
  categoryName: z.string().max(CATEGORY_NAME_MAX),
  estimatedMinutes: z
    .number()
    .int()
    .positive()
    .max(MAX_ESTIMATED_MINUTES, "見積もり時間を正しく選択してください"),
});

export const timerSessionResponseSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  taskName: z.string(),
  categoryName: z.string(),
  estimatedMinutes: z.number().int(),
  startedAt: z.string(),
});

export type CreateTimerSessionInput = z.infer<typeof createTimerSessionSchema>;
export type TimerSessionResponse = z.infer<typeof timerSessionResponseSchema>;
