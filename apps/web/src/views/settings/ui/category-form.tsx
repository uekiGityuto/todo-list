"use client";

import { useState } from "react";

import { CATEGORY_COLORS } from "@/shared/constants/category-colors";
import { cn } from "@/shared/lib/utils";
import type { Category } from "@/shared/types/task";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Button } from "@/shared/ui/shadcn/button";
import { Input } from "@/shared/ui/shadcn/input";

interface CategoryFormProps {
  editingCategory: Category | null;
  onSubmit: (name: string, color: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CategoryForm({
  editingCategory,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const [name, setName] = useState(editingCategory?.name ?? "");
  const [color, setColor] = useState(
    editingCategory?.color ?? CATEGORY_COLORS[0],
  );

  const isEditing = editingCategory !== null;
  const title = isEditing ? "カテゴリ編集" : "カテゴリ追加";
  const submitLabel = isEditing ? "保存" : "追加";

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit(trimmed, color);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl bg-card p-6"
    >
      <h3 className="text-base font-bold">{title}</h3>

      <div className="flex flex-col gap-2">
        <label htmlFor="category-name" className="text-xs font-semibold">
          カテゴリ名 *
        </label>
        <Input
          id="category-name"
          className="h-11 rounded-xl bg-background"
          placeholder="カテゴリ名を入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold">カラー</span>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "size-8 rounded-full transition-all duration-200 ease-out",
                color === c && "ring-2 ring-primary ring-offset-2",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <LoadingButton type="submit" loading={loading}>
          {submitLabel}
        </LoadingButton>
      </div>
    </form>
  );
}
