import { cn } from "@/lib/utils";

interface CalendarCellProps {
  day: number;
  tasks?: string[];
  isToday?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CalendarCell({
  day,
  tasks = [],
  isToday = false,
  className,
  onClick,
}: CalendarCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-12.5 flex-col gap-0.5 overflow-hidden bg-background p-1 px-0.5 transition-all duration-200 ease-out",
        "h-16 md:h-20 md:px-1 md:py-1.5",
        className
      )}
    >
      <span
        className={cn(
          "text-xs font-medium md:text-sm",
          isToday ? "font-bold text-primary" : "text-foreground"
        )}
      >
        {day}
      </span>
      {/* Mobile: dots */}
      <div className="flex gap-0.75 md:hidden">
        {tasks.slice(0, 3).map((_, i) => (
          <div
            key={i}
            className="size-1.5 rounded-full bg-primary"
          />
        ))}
      </div>
      {/* PC: task names */}
      <div className="hidden flex-col gap-0.5 md:flex">
        {tasks.slice(0, 2).map((task, i) => (
          <span
            key={i}
            className="truncate text-xs font-medium text-primary"
          >
            {task}
          </span>
        ))}
      </div>
    </button>
  );
}
