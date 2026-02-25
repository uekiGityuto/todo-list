"use client";

import { Pencil, Play, Trash2, Zap, ZapOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskActionListProps {
  isNext: boolean;
  onSetNext?: () => void;
  onUnsetNext?: () => void;
  onStartWork?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function TaskActionList({
  isNext,
  onSetNext,
  onUnsetNext,
  onStartWork,
  onEdit,
  onDelete,
  className,
}: TaskActionListProps) {
  const hoverBg = isNext ? "hover:bg-primary-soft" : "hover:bg-[#e4e4e7]";

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {isNext ? (
        <>
          <ActionItem
            icon={<Play className="size-4" />}
            label="作業を始める"
            onClick={onStartWork}
            hoverBg={hoverBg}
          />
          <ActionItem
            icon={<ZapOff className="size-4" />}
            label="次やるを解除"
            onClick={onUnsetNext}
            hoverBg={hoverBg}
          />
        </>
      ) : (
        <>
          <ActionItem
            icon={<Zap className="size-4" />}
            label="次やるに設定"
            onClick={onSetNext}
            hoverBg={hoverBg}
          />
          <ActionItem
            icon={<Play className="size-4" />}
            label="作業を始める"
            onClick={onStartWork}
            hoverBg={hoverBg}
          />
        </>
      )}
      <ActionItem
        icon={<Pencil className="size-4" />}
        label="編集"
        onClick={onEdit}
        hoverBg={hoverBg}
      />
      <ActionItem
        icon={<Trash2 className="size-4" />}
        label="削除"
        onClick={onDelete}
        variant="destructive"
        hoverBg={hoverBg}
      />
    </div>
  );
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  hoverBg?: string;
}

function ActionItem({
  icon,
  label,
  onClick,
  variant = "default",
  hoverBg = "hover:bg-card",
}: ActionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-all duration-200 ease-out",
        hoverBg,
        variant === "destructive" ? "text-destructive" : "text-foreground",
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
