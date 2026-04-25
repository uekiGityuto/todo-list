import type { ApiFieldError } from "@todo-list/schema";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  errors: readonly ApiFieldError[],
  setError: UseFormSetError<TFieldValues>,
  fieldMap: Partial<Record<string, FieldPath<TFieldValues>>> = {},
) {
  let handled = false;

  for (const error of errors) {
    const field = fieldMap[error.field];
    if (!field) continue;

    setError(field, {
      type: "server",
      message: error.message,
    });
    handled = true;
  }

  return handled;
}
