"use client";

import { useCallback } from "react";
import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "@/shared/lib/api/errors";
import { applyApiFieldErrors } from "@/shared/lib/forms/apply-api-field-errors";
import type { Category } from "@/shared/types/task";
import type { CategoryFormValues } from "./category-form-schema";

interface UseCategoryFormSubmitParams {
  editingCategory: Category | null;
  addCategory: (name: string, color: string) => Promise<string>;
  updateCategory: (id: string, name: string, color: string) => Promise<void>;
  onSuccess: () => void;
  setError: UseFormSetError<CategoryFormValues>;
}

export function useCategoryFormSubmit({
  editingCategory,
  addCategory,
  updateCategory,
  onSuccess,
  setError,
}: UseCategoryFormSubmitParams) {
  return useCallback(
    async (values: CategoryFormValues) => {
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, values.name, values.color);
        } else {
          await addCategory(values.name, values.color);
        }

        onSuccess();
      } catch (error) {
        if (error instanceof ApiError) {
          const handled = applyApiFieldErrors(error.fieldErrors, setError, {
            name: "name",
            color: "color",
          });

          if (!handled) {
            setError("root.serverError", {
              type: "server",
              message: error.errorMessage,
            });
          }
          return;
        }

        throw error;
      }
    },
    [addCategory, editingCategory, onSuccess, setError, updateCategory],
  );
}
