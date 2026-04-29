"use client";

import { format } from "date-fns";
import { useCallback } from "react";
import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "@/shared/lib/api/errors";
import { applyApiFieldErrors } from "@/shared/lib/forms/apply-api-field-errors";
import type { AddTaskFormValues } from "./add-task-form-schema";
import type { TaskFormData } from "./add-task-form-types";

interface UseAddTaskFormSubmitParams {
  onSubmit: (data: TaskFormData) => Promise<void>;
  onSuccess: () => void;
  setError: UseFormSetError<AddTaskFormValues>;
}

function toTaskFormData(values: AddTaskFormValues): TaskFormData {
  return {
    name: values.name,
    categoryId: values.categoryId,
    scheduledDate: values.scheduledDate
      ? format(values.scheduledDate, "yyyy-MM-dd")
      : null,
    estimatedMinutes: values.estimatedMinutes,
  };
}

export function useAddTaskFormSubmit({
  onSubmit,
  onSuccess,
  setError,
}: UseAddTaskFormSubmitParams) {
  return useCallback(
    async (values: AddTaskFormValues) => {
      try {
        await onSubmit(toTaskFormData(values));
        onSuccess();
      } catch (error) {
        if (error instanceof ApiError) {
          const handled = applyApiFieldErrors(error.fieldErrors, setError, {
            name: "name",
            categoryId: "categoryId",
            scheduledDate: "scheduledDate",
            estimatedMinutes: "estimatedMinutes",
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
    [onSubmit, onSuccess, setError],
  );
}
