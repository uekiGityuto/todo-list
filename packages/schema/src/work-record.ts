import { z } from "zod";

const workResultEnum = z.enum(["completed", "interrupted"]);

export const createWorkRecordSchema = z.object({
  taskId: z.uuid(),
  date: z.iso.date(),
  durationMinutes: z.number().int().min(0),
  result: workResultEnum,
});

export const workRecordResponseSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  date: z.iso.date(),
  durationMinutes: z.number().int(),
  result: workResultEnum,
});

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type WorkRecordResponse = z.infer<typeof workRecordResponseSchema>;
