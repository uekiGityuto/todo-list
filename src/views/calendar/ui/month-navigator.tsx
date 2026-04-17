import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  year,
  month,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
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
