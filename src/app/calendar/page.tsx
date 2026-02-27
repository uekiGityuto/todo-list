"use client";

import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { CalendarGrid } from "@/app/calendar/calendar-grid";
import { CalendarTaskItem } from "@/app/calendar/calendar-task-item";
import { SectionHeader } from "@/components/section-header";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkRecords } from "@/hooks/use-work-records";

import type { CalendarTask } from "@/components/calendar-cell";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const router = useRouter();
  const { tasks } = useTasks();
  const { getWorkRecordsByMonth } = useWorkRecords(tasks);

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const monthRecords = useMemo(
    () => getWorkRecordsByMonth(year, month),
    [getWorkRecordsByMonth, year, month],
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const record of monthRecords) {
      const existing = map.get(record.date);
      const task: CalendarTask = {
        id: record.id,
        name: record.taskName,
        color: record.categoryColor,
      };
      if (existing) {
        existing.push(task);
      } else {
        map.set(record.date, [task]);
      }
    }
    return map;
  }, [monthRecords]);

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDow = getDay(firstDay);
    const totalDays = lastDay.getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }
    return cells;
  }, [currentMonth]);

  const selectedRecords = useMemo(
    () => monthRecords.filter((r) => r.date === selectedDate),
    [monthRecords, selectedDate],
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate("");
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate("");
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      setSelectedDate(dateStr);
    },
    [year, month],
  );

  const handleNavChange = useCallback(
    (key: string) => {
      const routes: Record<string, string> = {
        home: "/",
        tasks: "/tasks",
        calendar: "/calendar",
        settings: "/settings",
      };
      const route = routes[key];
      if (route) router.push(route);
    },
    [router],
  );

  const selectedDay = selectedDate ? Number(selectedDate.split("-")[2]) : null;

  const selectedDateLabel = selectedDate
    ? `${Number(selectedDate.split("-")[1])}月${Number(selectedDate.split("-")[2])}日の作業`
    : "";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar activeItem="calendar" onItemChange={handleNavChange} />

        <main className="flex flex-1 flex-col gap-5 p-5 pb-0 md:gap-6 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              作業記録
            </h1>
          </div>

          <MonthNavigator
            year={year}
            month={month}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />

          <CalendarGrid
            weekdayLabels={WEEKDAY_LABELS}
            calendarDays={calendarDays}
            year={year}
            month={month}
            todayStr={todayStr}
            selectedDay={selectedDay}
            tasksByDate={tasksByDate}
            onDayClick={handleDayClick}
          />

          {selectedDate && (
            <div className="flex flex-col gap-3 pb-5">
              <SectionHeader
                title={selectedDateLabel}
                action={`${selectedRecords.length}件の作業`}
              />

              {selectedRecords.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedRecords.map((record) => (
                    <CalendarTaskItem
                      key={record.id}
                      taskName={record.taskName}
                      categoryName={record.categoryName}
                      durationMinutes={record.durationMinutes}
                      result={record.result}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  実施したタスクはありません
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      <TabBar activeTab="calendar" onTabChange={handleNavChange} />
    </div>
  );
}

function MonthNavigator({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label="前の月"
        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-card-hover"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="min-w-28 text-center text-sm font-semibold text-foreground">
        {month}月 {year}
      </span>
      <button
        type="button"
        onClick={onNext}
        aria-label="次の月"
        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-card-hover"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
