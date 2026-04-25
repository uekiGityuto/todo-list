import { z } from "zod";
import { estimatedMinutesSchema, taskNameSchema } from "./primitives";

const taskStatusEnum = z.enum(["todo", "in_progress", "done"]);
const nullableUuidSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.uuid().nullable(),
);

export const createTaskSchema = z.object({
  name: taskNameSchema,
  categoryId: nullableUuidSchema,
  estimatedMinutes: estimatedMinutesSchema,
  scheduledDate: z.iso.date().nullable(),
});

export const updateTaskSchema = z.object({
  name: taskNameSchema,
  categoryId: nullableUuidSchema,
  status: taskStatusEnum,
  isNext: z.boolean(),
  estimatedMinutes: estimatedMinutesSchema,
  scheduledDate: z.iso.date().nullable(),
});

export const taskResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  categoryId: z.uuid().nullable(),
  status: taskStatusEnum,
  isNext: z.boolean(),
  estimatedMinutes: z.number().int().nullable(),
  scheduledDate: z.iso.date().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
