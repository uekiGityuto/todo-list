"use client";

import { format, parse } from "date-fns";
import { useState } from "react";

import type { Category } from "@/shared/types/task";
import { CategorySelect } from "@/shared/ui/category-select";
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
import type { TaskFormData } from "./add-task-modal";

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
}

export function AddTaskForm({
  onClose,
  onSubmit,
  onCreateCategory,
  categories,
  editingTask,
}: AddTaskFormProps) {
  const [name, setName] = useState(editingTask?.name ?? "");
  const [categoryId, setCategoryId] = useState(editingTask?.categoryId ?? "");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    editingTask?.scheduledDate
      ? parse(editingTask.scheduledDate, "yyyy-MM-dd", new Date())
      : undefined,
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(
    editingTask?.estimatedMinutes ?? null,
  );
  const [nameError, setNameError] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    await onSubmit({
      name: name.trim(),
      categoryId,
      scheduledDate: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null,
      estimatedMinutes,
    });
    onClose();
  };

  const isEditing = !!editingTask;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "タスク編集" : "タスク追加"}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            タスク名<span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="タスク名を入力"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError(false);
            }}
            aria-invalid={nameError}
          />
          {nameError && (
            <span className="text-xs text-destructive">
              タスク名を入力してください
            </span>
          )}
        </div>

        <CategorySelect
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
          onCreateCategory={onCreateCategory}
        />

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">予定日</Label>
          <DatePickerField value={scheduledDate} onChange={setScheduledDate} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">見積もり時間</Label>
          <SelectField
            value={estimatedMinutes}
            onChange={(v) => setEstimatedMinutes(v ? Number(v) : null)}
            options={ESTIMATED_MINUTES_OPTIONS}
          />
        </div>
      </div>
      <DialogFooter className="flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button type="submit" className="flex-1">
          {isEditing ? "更新" : "追加"}
        </Button>
      </DialogFooter>
    </form>
  );
}
