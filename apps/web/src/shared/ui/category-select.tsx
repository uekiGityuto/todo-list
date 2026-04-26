"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CATEGORY_COLORS } from "@/shared/constants/category-colors";
import { cn } from "@/shared/lib/utils";
import type { Category } from "@/shared/types/task";
import { Button } from "@/shared/ui/shadcn/button";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";
import { SelectFieldTrigger } from "@/shared/ui/shadcn/select-field";

interface CategorySelectProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  onCreateCategory: (name: string, color: string) => Promise<string>;
  className?: string;
}

export function CategorySelect({
  categories,
  selectedCategoryId,
  onSelect,
  onCreateCategory,
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    setIsOpen(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const newId = await onCreateCategory(newCategoryName.trim(), selectedColor);
    onSelect(newId);
    setNewCategoryName("");
    setSelectedColor(CATEGORY_COLORS[0]);
    setIsCreating(false);
  };

  const handleCancelCreate = () => {
    setNewCategoryName("");
    setSelectedColor(CATEGORY_COLORS[0]);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Label className="text-sm font-medium">カテゴリ（新規作成）</Label>
        <Input
          data-testid="create-category-name-input"
          placeholder="カテゴリ名"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleCreateCategory();
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "size-8 rounded-full transition-all duration-200 ease-out",
                selectedColor === color &&
                  "ring-2 ring-foreground ring-offset-2",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancelCreate}
            data-testid="create-category-cancel-button"
          >
            <Plus className="size-3.5 rotate-45" />
            キャンセル
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreateCategory}
            data-testid="create-category-submit-button"
          >
            <Plus className="size-3.5" />
            作成
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">カテゴリ</Label>
      <SelectFieldTrigger
        onClick={() => setIsOpen(!isOpen)}
        hasValue={!!selectedCategory}
        testId="category-select-trigger"
      >
        {selectedCategory ? selectedCategory.name : "選択してください"}
      </SelectFieldTrigger>
      {isOpen && (
        <div
          className="rounded-xl border border-border bg-background p-1 shadow-sm"
          data-testid="category-select-menu"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category.id)}
              data-testid={`category-select-option-${category.name}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ease-out hover:bg-card",
                selectedCategoryId === category.id && "bg-card font-semibold",
              )}
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsCreating(true);
            }}
            data-testid="create-category-option"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-primary transition-all duration-200 ease-out hover:bg-card"
          >
            <Plus className="size-3.5" />
            新規作成
          </button>
        </div>
      )}
    </div>
  );
}
