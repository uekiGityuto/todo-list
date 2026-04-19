import { z } from "zod";

export const createTimerSessionSchema = z.object({
  taskId: z.string().uuid(),
  taskName: z.string().min(1),
  categoryName: z.string(),
  estimatedMinutes: z.number().int().positive(),
});

export const timerSessionResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  taskName: z.string(),
  categoryName: z.string(),
  estimatedMinutes: z.number().int(),
  startedAt: z.string(),
});

export type CreateTimerSessionInput = z.infer<typeof createTimerSessionSchema>;
export type TimerSessionResponse = z.infer<typeof timerSessionResponseSchema>;
