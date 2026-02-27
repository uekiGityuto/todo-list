"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { CategoryDeleteDialog } from "@/app/settings/category-delete-dialog";
import { CategoryForm } from "@/app/settings/category-form";
import { CategoryList } from "@/app/settings/category-list";
import { SectionHeader } from "@/components/section-header";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTasks } from "@/hooks/use-tasks";

import type { Category } from "@/types/task";

type FormState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; category: Category };

export default function SettingsPage() {
  const router = useRouter();
  const { tasks, categories, addCategory, updateCategory, deleteCategory } =
    useTasks();

  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleNavChange = useCallback(
    (key: string) => {
      const routes: Record<string, string> = {
        home: "/",
        tasks: "/tasks",
        calendar: "/calendar",
        settings: "/settings",
      };
      const route = routes[key];
      if (route) router.push(route);
    },
    [router],
  );

  const handleAdd = useCallback(() => {
    setFormState({ mode: "add" });
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setFormState({ mode: "edit", category });
  }, []);

  const handleDelete = useCallback(
    (category: Category) => {
      const hasLinkedTasks = tasks.some(
        (task) => task.categoryId === category.id,
      );
      if (hasLinkedTasks) {
        setDeleteTarget(category);
      } else {
        deleteCategory(category.id);
      }
    },
    [tasks, deleteCategory],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    setFormState({ mode: "closed" });
  }, [deleteTarget, deleteCategory]);

  const handleFormSubmit = useCallback(
    (name: string, color: string) => {
      if (formState.mode === "add") {
        addCategory(name, color);
      } else if (formState.mode === "edit") {
        updateCategory(formState.category.id, name, color);
      }
      setFormState({ mode: "closed" });
    },
    [formState, addCategory, updateCategory],
  );

  const handleFormCancel = useCallback(() => {
    setFormState({ mode: "closed" });
  }, []);

  const isMobile = !useMediaQuery("(min-width: 768px)");

  const editingCategory = formState.mode === "edit" ? formState.category : null;
  const isFormOpen = formState.mode !== "closed";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar activeItem="settings" onItemChange={handleNavChange} />

        <main className="flex flex-1 flex-col gap-5 p-5 pb-0 md:gap-6 md:p-8">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            設定
          </h1>

          <div className="flex items-start gap-8">
            <div className="w-full max-w-[480px]">
              <SectionHeader title="カテゴリ" />
              <div className="mt-3">
                <CategoryList
                  categories={categories}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>

            {isFormOpen && (
              <div className="hidden w-[400px] shrink-0 md:block">
                <CategoryForm
                  key={
                    formState.mode === "edit" ? formState.category.id : "add"
                  }
                  editingCategory={editingCategory}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            )}
          </div>

          {isFormOpen && isMobile && (
            <Dialog open onOpenChange={(open) => !open && handleFormCancel()}>
              <DialogContent
                showCloseButton={false}
                className="block border-none bg-transparent p-0 shadow-none"
              >
                <CategoryForm
                  key={
                    formState.mode === "edit"
                      ? `mobile-${formState.category.id}`
                      : "mobile-add"
                  }
                  editingCategory={editingCategory}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>

      <TabBar activeTab="settings" onTabChange={handleNavChange} />

      {deleteTarget && (
        <CategoryDeleteDialog
          open={!!deleteTarget}
          categoryName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
