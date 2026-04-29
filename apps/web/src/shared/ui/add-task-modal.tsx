"use client";

import type { Category } from "@/shared/types/task";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/shared/ui/primitives/dialog";
import { AddTaskForm } from "./add-task-form";
import type { TaskFormData } from "./add-task-form-types";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCreateCategory: (name: string, color: string) => Promise<string>;
  categories: Category[];
  editingTask?: TaskFormData & { id: string };
  loading?: boolean;
}

export function AddTaskModal({
  open,
  onClose,
  onSubmit,
  onCreateCategory,
  categories,
  editingTask,
  loading,
}: AddTaskModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        data-testid="add-task-dialog"
      >
        <DialogDescription className="sr-only">
          タスク名、カテゴリ、予定日、見積もり時間を入力するダイアログです。
        </DialogDescription>
        <AddTaskForm
          key={editingTask?.id ?? "new"}
          onClose={onClose}
          onSubmit={onSubmit}
          onCreateCategory={onCreateCategory}
          categories={categories}
          editingTask={editingTask}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
