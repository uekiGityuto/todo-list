import { Check as CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckProps {
  checked?: boolean;
  className?: string;
  onToggle?: () => void;
}

export function Check({ checked = false, className, onToggle }: CheckProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ease-out",
        checked ? "bg-primary" : "border-2 border-border bg-transparent",
        className,
      )}
    >
      {checked && <CheckIcon className="size-3.5 text-white" />}
    </button>
  );
}
