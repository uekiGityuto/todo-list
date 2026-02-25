import { SectionHeader } from "@/components/section-header";
import { TaskCard } from "@/components/task-card";
import { type DayGroup } from "@/hooks/use-work-records";
import { formatDateLabel } from "@/lib/format-date-label";
import { formatDuration } from "@/lib/format-duration";

interface RecentWorkColumnProps {
  recentWorkByDay: DayGroup[];
}

export function RecentWorkColumn({ recentWorkByDay }: RecentWorkColumnProps) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-5 md:flex">
      <SectionHeader title="最近の作業" />

      {recentWorkByDay.length === 0 ? (
        <p className="text-sm text-muted-foreground">作業記録はありません</p>
      ) : (
        <div className="flex flex-col gap-5 overflow-y-auto">
          {recentWorkByDay.map((dayGroup) => (
            <div key={dayGroup.date} className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {formatDateLabel(dayGroup.date)}
              </span>
              {dayGroup.records.map((record) => (
                <TaskCard
                  key={record.id}
                  title={record.taskName}
                  duration={formatDuration(record.durationMinutes)}
                  category={record.categoryName || undefined}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
