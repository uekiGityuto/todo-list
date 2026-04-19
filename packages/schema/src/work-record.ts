import { z } from "zod";

const workResultEnum = z.enum(["completed", "interrupted"]);

export const createWorkRecordSchema = z.object({
  taskId: z.string().uuid(),
  date: z.string().min(1),
  durationMinutes: z.number().int().min(0),
  result: workResultEnum,
});

export const workRecordResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  date: z.string(),
  durationMinutes: z.number().int(),
  result: workResultEnum,
});

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type WorkRecordResponse = z.infer<typeof workRecordResponseSchema>;
