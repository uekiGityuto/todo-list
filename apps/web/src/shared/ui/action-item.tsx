import { cn } from "@/shared/lib/utils";

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  hoverBg?: string;
  testId?: string;
}

export function ActionItem({
  icon,
  label,
  onClick,
  variant = "default",
  hoverBg = "hover:bg-card",
  testId,
}: ActionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-all duration-200 ease-out",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive-soft"
          : cn("text-foreground", hoverBg),
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
