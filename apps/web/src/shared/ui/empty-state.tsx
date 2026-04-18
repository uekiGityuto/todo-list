import { ClipboardList, Plus } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/shadcn/button";

interface EmptyStateProps {
  onAddTask: () => void;
  description?: string;
  className?: string;
}

export function EmptyState({
  onAddTask,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16",
        className,
      )}
    >
      <ClipboardList className="size-12 text-muted-foreground" />
      <span className="text-base font-semibold text-foreground">
        タスクがありません
      </span>
      <span className="text-sm text-muted-foreground">
        {description ?? "新しいタスクを追加しよう"}
      </span>
      <Button onClick={onAddTask} className="mt-2">
        <Plus className="size-4" />
        タスクを追加する
      </Button>
    </div>
  );
}
