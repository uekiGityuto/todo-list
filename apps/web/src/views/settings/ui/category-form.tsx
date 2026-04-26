"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";

import { CATEGORY_COLORS } from "@/shared/constants/category-colors";
import { cn } from "@/shared/lib/utils";
import type { Category } from "@/shared/types/task";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Button } from "@/shared/ui/shadcn/button";
import { Input } from "@/shared/ui/shadcn/input";
import {
  type CategoryFormValues,
  categoryFormSchema,
} from "./category-form-schema";
import { useCategoryFormSubmit } from "./use-category-form-submit";

interface CategoryFormProps {
  editingCategory: Category | null;
  addCategory: (name: string, color: string) => Promise<string>;
  updateCategory: (id: string, name: string, color: string) => Promise<void>;
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CategoryForm({
  editingCategory,
  addCategory,
  updateCategory,
  onSuccess,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: editingCategory?.name ?? "",
      color: editingCategory?.color ?? CATEGORY_COLORS[0],
    },
  });
  const { field: colorField } = useController({
    control,
    name: "color",
  });
  const submitCategoryForm = useCategoryFormSubmit({
    editingCategory,
    addCategory,
    updateCategory,
    onSuccess,
    setError,
  });

  const isEditing = editingCategory !== null;
  const title = isEditing ? "カテゴリ編集" : "カテゴリ追加";
  const submitLabel = isEditing ? "保存" : "追加";
  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await submitCategoryForm(values);
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-testid="category-form"
      className="flex flex-col gap-6 rounded-3xl bg-card p-6"
    >
      <h3 className="text-base font-bold">{title}</h3>

      <div className="flex flex-col gap-2">
        <label htmlFor="category-name" className="text-xs font-semibold">
          カテゴリ名 *
        </label>
        <Input
          id="category-name"
          data-testid="category-name-input"
          className="h-11 rounded-xl bg-background"
          placeholder="カテゴリ名を入力"
          aria-invalid={!!errors.name}
          disabled={loading}
          {...register("name")}
        />
        {errors.name?.message && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold">カラー</span>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={colorField.value === c}
              disabled={loading}
              onClick={() => colorField.onChange(c)}
              className={cn(
                "size-8 rounded-full transition-all duration-200 ease-out",
                colorField.value === c && "ring-2 ring-primary ring-offset-2",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        {errors.color?.message && (
          <p className="text-xs text-destructive">{errors.color.message}</p>
        )}
      </div>

      {errors.root?.serverError?.message && (
        <p className="text-sm text-destructive">
          {errors.root.serverError.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          data-testid="category-cancel-button"
        >
          キャンセル
        </Button>
        <LoadingButton
          type="submit"
          loading={loading}
          data-testid="category-submit-button"
        >
          {submitLabel}
        </LoadingButton>
      </div>
    </form>
  );
}
