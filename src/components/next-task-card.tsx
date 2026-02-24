import { Zap, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface NextTaskCardProps {
  title: string;
  duration?: string;
  category?: string;
  onAction?: () => void;
  className?: string;
}

export function NextTaskCard({
  title,
  duration,
  category,
  onAction,
  className,
}: NextTaskCardProps) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[20px] bg-primary-soft",
        className,
      )}
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
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 pr-5 text-primary transition-all duration-200 ease-out hover:text-primary/80"
      >
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}
