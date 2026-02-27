import { Check } from "@/components/check";
import { formatDuration } from "@/lib/format-duration";

import type { WorkResult } from "@/enums/work-results";

type CalendarTaskItemProps = {
  taskName: string;
  categoryName: string;
  durationMinutes: number;
  result: WorkResult;
};

export function CalendarTaskItem({
  taskName,
  categoryName,
  durationMinutes,
  result,
}: CalendarTaskItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-4xl bg-card px-5 py-3.5">
      <Check checked={result === "completed"} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold text-foreground">
          {taskName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDuration(durationMinutes)}
          </span>
          {categoryName && (
            <span className="text-xs text-muted-foreground">
              {categoryName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
