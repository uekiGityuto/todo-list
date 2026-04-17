"use client";

import type { Category } from "@/shared/types/task";
import { Dialog, DialogContent } from "@/shared/ui/shadcn/dialog";
import { AddTaskForm } from "./add-task-form";

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
