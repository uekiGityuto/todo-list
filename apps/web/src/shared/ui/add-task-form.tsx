"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parse } from "date-fns";
import { Controller, useForm } from "react-hook-form";

import type { Category } from "@/shared/types/task";
import { CategorySelect } from "@/shared/ui/category-select";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Button } from "@/shared/ui/shadcn/button";
import { DatePickerField } from "@/shared/ui/shadcn/date-picker-field";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";
import { SelectField } from "@/shared/ui/shadcn/select-field";
import {
  type AddTaskFormValues,
  addTaskFormSchema,
} from "./add-task-form-schema";
import type { TaskFormData } from "./add-task-form-types";
import { useAddTaskFormSubmit } from "./use-add-task-form-submit";

const ESTIMATED_MINUTES_OPTIONS = [
  { label: "15分", value: 15 },
  { label: "30分", value: 30 },
  { label: "45分", value: 45 },
  { label: "1時間", value: 60 },
  { label: "1.5時間", value: 90 },
  { label: "2時間", value: 120 },
  { label: "3時間", value: 180 },
] as const;

interface AddTaskFormProps {
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCreateCategory: (name: string, color: string) => Promise<string>;
  categories: Category[];
  editingTask?: TaskFormData & { id: string };
  loading?: boolean;
}

export function AddTaskForm({
  onClose,
  onSubmit,
  onCreateCategory,
  categories,
  editingTask,
  loading = false,
}: AddTaskFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: editingTask?.name ?? "",
      categoryId: editingTask?.categoryId ?? "",
      scheduledDate: editingTask?.scheduledDate
        ? parse(editingTask.scheduledDate, "yyyy-MM-dd", new Date())
        : undefined,
      estimatedMinutes: editingTask?.estimatedMinutes ?? null,
    },
  });
  const submitTaskForm = useAddTaskFormSubmit({
    onSubmit,
    onSuccess: onClose,
    setError,
  });

  const isEditing = !!editingTask;
  const onFormSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await submitTaskForm(values);
  });

  return (
    <form onSubmit={onFormSubmit} noValidate data-testid="add-task-form">
      <DialogHeader>
        <DialogTitle>{isEditing ? "タスク編集" : "タスク追加"}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-name" className="text-sm font-medium">
            タスク名<span className="text-destructive">*</span>
          </Label>
          <Input
            id="task-name"
            data-testid="task-name-input"
            placeholder="タスク名を入力"
            aria-invalid={!!errors.name}
            disabled={loading}
            {...register("name")}
          />
          {errors.name?.message && (
            <span className="text-xs text-destructive">
              {errors.name.message}
            </span>
          )}
        </div>

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              categories={categories}
              selectedCategoryId={field.value}
              onSelect={field.onChange}
              onCreateCategory={onCreateCategory}
            />
          )}
        />
        {errors.categoryId?.message && (
          <span className="text-xs text-destructive">
            {errors.categoryId.message}
          </span>
        )}

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">予定日</Label>
          <Controller
            control={control}
            name="scheduledDate"
            render={({ field }) => (
              <DatePickerField value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.scheduledDate?.message && (
            <span className="text-xs text-destructive">
              {errors.scheduledDate.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">見積もり時間</Label>
          <Controller
            control={control}
            name="estimatedMinutes"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={(v) => field.onChange(v ? Number(v) : null)}
                options={ESTIMATED_MINUTES_OPTIONS}
                testId="estimated-minutes-select"
              />
            )}
          />
          {errors.estimatedMinutes?.message && (
            <span className="text-xs text-destructive">
              {errors.estimatedMinutes.message}
            </span>
          )}
        </div>
      </div>
      {errors.root?.serverError?.message && (
        <p className="text-sm text-destructive">
          {errors.root.serverError.message}
        </p>
      )}
      <DialogFooter className="flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={loading}
          data-testid="task-form-cancel-button"
        >
          キャンセル
        </Button>
        <LoadingButton
          type="submit"
          className="flex-1"
          loading={loading}
          data-testid="task-form-submit-button"
        >
          {isEditing ? "更新" : "追加"}
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}
