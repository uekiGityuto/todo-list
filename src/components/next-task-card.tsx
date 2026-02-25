import { ChevronDown, ChevronUp, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface NextTaskCardProps {
  title: string;
  duration?: string;
  category?: string;
  expanded?: boolean;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function NextTaskCard({
  title,
  duration,
  category,
  expanded = false,
  onAction,
  children,
  className,
}: NextTaskCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] bg-primary-soft transition-all duration-200 ease-out",
        className,
      )}
    >
      <button
        type="button"
        onClick={onAction}
        className="flex w-full items-center text-left"
      >
        <div className="h-full w-1 self-stretch bg-primary" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              次にやるタスク
            </span>
          </div>
          <span className="truncate text-base font-bold text-foreground">
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
        <span className="shrink-0 pr-5 text-primary transition-all duration-200 ease-out">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>
      {expanded && children && (
        <div className="border-t border-primary/20 px-5 py-2">{children}</div>
      )}
    </div>
  );
}
