import { z } from "zod";

const taskStatusEnum = z.enum(["todo", "in_progress", "done"]);

export const createTaskSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  estimatedMinutes: z.number().int().positive().nullable(),
  scheduledDate: z.string().nullable(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().nullable(),
  status: taskStatusEnum,
  isNext: z.boolean(),
  estimatedMinutes: z.number().int().positive().nullable(),
  scheduledDate: z.string().nullable(),
});

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  categoryId: z.string().uuid().nullable(),
  status: taskStatusEnum,
  isNext: z.boolean(),
  estimatedMinutes: z.number().int().nullable(),
  scheduledDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
