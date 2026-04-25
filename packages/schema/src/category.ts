import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "HEXカラーコード形式（例: #FF0000）で入力してください",
    ),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "HEXカラーコード形式（例: #FF0000）で入力してください",
    ),
});

export const categoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "HEXカラーコード形式（例: #FF0000）で入力してください",
    ),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
