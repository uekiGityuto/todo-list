import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function FilterChip({
  label,
  active = false,
  className,
  onClick,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-[20px] px-4 py-2 text-xs transition-all duration-200 ease-out",
        active
          ? "bg-primary font-semibold text-white"
          : "bg-card font-medium text-muted-foreground",
        className
      )}
    >
      {label}
    </button>
  );
}
