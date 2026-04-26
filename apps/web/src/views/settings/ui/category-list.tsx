"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/shared/types/task";
import { Button } from "@/shared/ui/shadcn/button";

interface CategoryListProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoryListProps) {
  return (
    <div className="flex flex-col gap-3" data-testid="category-list">
      {categories.length > 0 && (
        <div className="rounded-3xl bg-card">
          {categories.map((category, index) => (
            <div
              key={category.id}
              data-testid={`category-row-${category.name}`}
              className={
                index < categories.length - 1
                  ? "border-b border-border"
                  : undefined
              }
            >
              <div className="flex items-center px-4 py-[14px]">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="ml-3 flex-1 text-sm">{category.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="編集"
                    data-testid="category-edit-button"
                    onClick={() => onEdit(category)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="削除"
                    data-testid="category-delete-button"
                    onClick={() => onDelete(category)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        className="w-fit"
        onClick={onAdd}
        data-testid="add-category-button"
      >
        <Plus className="size-4" />
        カテゴリを追加
      </Button>
    </div>
  );
}
