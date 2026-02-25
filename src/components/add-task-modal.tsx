"use client";

import { format, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { CategorySelect } from "@/components/category-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";

import type { Category } from "@/types/task";

const ESTIMATED_MINUTES_OPTIONS = [
  { label: "15分", value: 15 },
  { label: "30分", value: 30 },
  { label: "45分", value: 45 },
  { label: "1時間", value: 60 },
  { label: "1.5時間", value: 90 },
  { label: "2時間", value: 120 },
  { label: "3時間", value: 180 },
] as const;

export interface TaskFormData {
  name: string;
  categoryId: string;
  scheduledDate: string | null;
  estimatedMinutes: number | null;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  onCreateCategory: (name: string, color: string) => string;
  categories: Category[];
  editingTask?: TaskFormData & { id: string };
}

export function AddTaskModal({
  open,
  onClose,
  onSubmit,
  onCreateCategory,
  categories,
  editingTask,
}: AddTaskModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <AddTaskForm
          key={editingTask?.id ?? "new"}
          onClose={onClose}
          onSubmit={onSubmit}
          onCreateCategory={onCreateCategory}
          categories={categories}
          editingTask={editingTask}
        />
      </DialogContent>
    </Dialog>
  );
}

interface AddTaskFormProps {
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  onCreateCategory: (name: string, color: string) => string;
  categories: Category[];
  editingTask?: TaskFormData & { id: string };
}

function AddTaskForm({
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
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    onSubmit({
      name: name.trim(),
      categoryId,
      scheduledDate: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null,
      estimatedMinutes,
    });
    onClose();
  };

  const isEditing = !!editingTask;

  return (
    <>
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
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-4xl border border-input bg-transparent px-4 text-sm text-left transition-all duration-200 ease-out"
              >
                <span
                  className={
                    scheduledDate ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {scheduledDate
                    ? format(scheduledDate, "yyyy/MM/dd", { locale: ja })
                    : "日付を選択"}
                </span>
                <CalendarIcon className="size-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={(date) => {
                  setScheduledDate(date);
                  setCalendarOpen(false);
                }}
                locale={ja}
              />
            </PopoverContent>
          </Popover>
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
        <Button variant="outline" onClick={onClose} className="flex-1">
          キャンセル
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          {isEditing ? "更新" : "追加"}
        </Button>
      </DialogFooter>
    </>
  );
}
