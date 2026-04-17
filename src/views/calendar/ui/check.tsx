import { Check as CheckIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface CheckProps {
  checked?: boolean;
  className?: string;
  onToggle?: () => void;
}

export function Check({ checked = false, className, onToggle }: CheckProps) {
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
