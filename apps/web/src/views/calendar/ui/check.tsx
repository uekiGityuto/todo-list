import { Check as CheckIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface CheckProps {
  checked?: boolean;
  className?: string;
  onToggle?: () => void;
}

export function Check({ checked = false, className, onToggle }: CheckProps) {
  const interactive = !!onToggle;

  if (!interactive) {
    return (
      <span
        role="img"
        aria-label={checked ? "完了" : "未完了"}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-2xl",
          checked ? "bg-primary" : "border-2 border-border bg-transparent",
          className,
        )}
      >
        {checked && <CheckIcon className="size-3.5 text-white" />}
      </span>
    );
  }

  return (
    <label
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 ease-out",
        checked ? "bg-primary" : "border-2 border-border bg-transparent",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      {checked && <CheckIcon className="size-3.5 text-white" />}
    </label>
  );
}
