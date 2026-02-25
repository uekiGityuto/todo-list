import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
  dotColor?: string;
  className?: string;
  onClick?: () => void;
}

export function FilterChip({
  label,
  active = false,
  dotColor,
  className,
  onClick,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-4xl px-4 py-2 text-xs transition-all duration-200 ease-out",
        active
          ? "bg-primary font-semibold text-white"
          : "bg-card font-medium text-muted-foreground",
        className,
      )}
    >
      {dotColor && (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {label}
    </button>
  );
}
