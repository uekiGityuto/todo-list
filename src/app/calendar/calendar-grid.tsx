import { CalendarCell } from "@/components/calendar-cell";

import type { CalendarTask } from "@/components/calendar-cell";

type CalendarGridProps = {
  weekdayLabels: string[];
  calendarDays: (number | null)[];
  year: number;
  month: number;
  todayStr: string;
  selectedDay: number | null;
  tasksByDate: Map<string, CalendarTask[]>;
  onDayClick: (day: number) => void;
};

export function CalendarGrid({
  weekdayLabels,
  calendarDays,
  year,
  month,
  todayStr,
  selectedDay,
  tasksByDate,
  onDayClick,
}: CalendarGridProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="grid grid-cols-7 border-b border-border">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center py-2 text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-16 md:h-20" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const tasks = tasksByDate.get(dateStr) ?? [];

          return (
            <CalendarCell
              key={dateStr}
              day={day}
              tasks={tasks}
              isToday={dateStr === todayStr}
              isSelected={day === selectedDay}
              className="border-b border-r border-border last:border-r-0 [&:nth-child(7n)]:border-r-0"
              onClick={() => onDayClick(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
