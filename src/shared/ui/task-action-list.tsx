"use client";

import { Pencil, Play, Trash2, Zap, ZapOff } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ActionItem } from "./action-item";

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
  const hoverBg = isNext ? "hover:bg-primary-soft" : "hover:bg-card-hover";

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
