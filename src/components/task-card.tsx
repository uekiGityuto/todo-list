import { ChevronDown } from "lucide-react";

import { Check } from "@/components/check";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  duration?: string;
  category?: string;
  checked?: boolean;
  onToggle?: () => void;
  onAction?: () => void;
  className?: string;
}

export function TaskCard({
  title,
  duration,
  category,
  checked = false,
  onToggle,
  onAction,
  className,
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[20px] bg-card px-5 py-3.5 pl-4",
        className,
      )}
    >
      <Check checked={checked} onToggle={onToggle} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {duration && (
            <span className="text-xs text-muted-foreground">{duration}</span>
          )}
          {category && (
            <span className="text-xs text-muted-foreground">{category}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-text-muted transition-all duration-200 ease-out hover:text-foreground"
      >
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}
