"use client";

import { LoadingButton } from "@/shared/ui/loading-button";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  taskName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  taskName,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>タスクを削除</DialogTitle>
          <DialogDescription>
            「{taskName}」を削除しますか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
          >
            削除
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
