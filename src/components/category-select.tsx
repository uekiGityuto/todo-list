"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectFieldTrigger } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";

import type { Category } from "@/types/task";

const CATEGORY_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
  "#6366F1",
  "#FACC15",
];

interface CategorySelectProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  onCreateCategory: (name: string, color: string) => string;
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

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = onCreateCategory(newCategoryName.trim(), selectedColor);
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
          placeholder="カテゴリ名"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
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
          >
            <Plus className="size-3.5 rotate-45" />
            キャンセル
          </Button>
          <Button type="button" size="sm" onClick={handleCreateCategory}>
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
      >
        {selectedCategory ? selectedCategory.name : "選択してください"}
      </SelectFieldTrigger>
      {isOpen && (
        <div className="rounded-xl border border-border bg-background p-1 shadow-sm">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category.id)}
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
