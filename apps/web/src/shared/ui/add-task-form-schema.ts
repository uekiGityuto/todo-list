import { estimatedMinutesSchema, taskNameSchema } from "@todo-list/schema";
import { z } from "zod";

export const addTaskFormSchema = z.object({
  name: z.string().trim().pipe(taskNameSchema),
  categoryId: z.string(),
  scheduledDate: z.date().optional(),
  estimatedMinutes: estimatedMinutesSchema,
});

export type AddTaskFormValues = z.infer<typeof addTaskFormSchema>;
