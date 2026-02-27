import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  duration?: string;
  category?: string;
  expanded?: boolean;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function TaskCard({
  title,
  duration,
  category,
  expanded = false,
  onAction,
  children,
  className,
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "rounded-4xl bg-card transition-all duration-200 ease-out",
        className,
      )}
    >
      <button
        type="button"
        onClick={onAction}
        className="flex w-full items-center gap-3 rounded-4xl px-5 py-3.5 text-left transition-colors duration-200 ease-out hover:bg-card-hover"
      >
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
        <span className="shrink-0 text-muted-foreground transition-all duration-200 ease-out">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>
      {expanded && children && (
        <div className="border-t border-border px-5 py-2">{children}</div>
      )}
    </div>
  );
}
