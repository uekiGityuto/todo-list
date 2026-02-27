import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  action,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {action &&
        (onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-medium text-primary transition-all duration-200 ease-out hover:text-primary/80"
          >
            {action}
          </button>
        ) : (
          <span className="text-xs font-medium text-primary">{action}</span>
        ))}
    </div>
  );
}
