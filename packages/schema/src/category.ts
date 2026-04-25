import { z } from "zod";

const hexColorSchema = z
  .string()
  .min(1, "カラーは必須です")
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    "HEXカラーコード形式（例: #FF0000）で入力してください",
  );

export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: hexColorSchema,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1),
  color: hexColorSchema,
});

export const categoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: hexColorSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
