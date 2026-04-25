import { z } from "zod";
import { categoryColorSchema, categoryNameSchema } from "./primitives";

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  color: categoryColorSchema,
});

export const updateCategorySchema = z.object({
  name: categoryNameSchema,
  color: categoryColorSchema,
});

export const categoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: categoryColorSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
