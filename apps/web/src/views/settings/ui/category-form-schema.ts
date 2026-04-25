import { categoryColorSchema, categoryNameSchema } from "@todo-list/schema";
import { z } from "zod";
import { CATEGORY_COLORS } from "@/shared/constants/category-colors";

export const categoryFormSchema = z.object({
  name: z.string().trim().pipe(categoryNameSchema),
  // UI では候補色に限定しつつ、共有 schema の HEX 制約も維持する
  color: z
    .string()
    .refine((value) => CATEGORY_COLORS.includes(value), {
      message: "カラーを選択してください",
    })
    .pipe(categoryColorSchema),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
