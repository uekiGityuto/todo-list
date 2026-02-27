import { cn } from "@/lib/utils";

export type CalendarTask = {
  id: string;
  name: string;
  color: string;
};

interface CalendarCellProps {
  day: number;
  tasks?: CalendarTask[];
  isToday?: boolean;
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CalendarCell({
  day,
  tasks = [],
  isToday = false,
  isSelected = false,
  className,
  onClick,
}: CalendarCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-0.5 overflow-hidden p-1 px-0.5 transition-all duration-200 ease-out",
        "h-16 md:h-20 md:px-1 md:py-1.5",
        isSelected ? "bg-primary-soft" : "bg-background",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs font-medium md:text-sm",
          isToday ? "font-bold text-primary" : "text-foreground",
        )}
      >
        {day}
      </span>
      {/* Mobile: dots */}
      <div className="flex gap-0.75 md:hidden">
        {tasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className="size-1.5 rounded-full bg-primary"
            style={task.color ? { backgroundColor: task.color } : undefined}
          />
        ))}
      </div>
      {/* PC: task names */}
      <div className="hidden flex-col gap-0.5 md:flex">
        {tasks.slice(0, 2).map((task) => (
          <span
            key={task.id}
            className="truncate text-xs font-medium text-primary"
            style={task.color ? { color: task.color } : undefined}
          >
            {task.name}
          </span>
        ))}
      </div>
    </button>
  );
}
