import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
