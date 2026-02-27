"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryDeleteDialogProps {
  open: boolean;
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CategoryDeleteDialog({
  open,
  categoryName,
  onConfirm,
  onCancel,
}: CategoryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>カテゴリを削除</DialogTitle>
          <DialogDescription>
            「{categoryName}
            」に紐づいているタスクがあります。カテゴリを削除すると該当タスクのカテゴリは未分類になります。よろしいですか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
