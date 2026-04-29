import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";

interface TopRowProps {
  onAddTask: () => void;
}

export function TopRow({ onAddTask }: TopRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          おかえり！
        </span>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          今日もがんばろう 💪
        </h1>
      </div>
      <Button size="sm" onClick={onAddTask} className="hidden md:inline-flex">
        <Plus className="size-4" />
        タスク追加
      </Button>
    </div>
  );
}
