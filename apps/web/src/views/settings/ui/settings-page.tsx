"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { NAV_ROUTES } from "@/shared/constants/routes";
import { useLogout } from "@/shared/hooks/use-logout";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { type TasksInitialData, useTasks } from "@/shared/hooks/use-tasks";
import type { Category, Task } from "@/shared/types/task";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { SectionHeader } from "@/shared/ui/section-header";
import { Sidebar } from "@/shared/ui/sidebar";
import { TabBar } from "@/shared/ui/tab-bar";
import { CategoryDeleteDialog } from "./category-delete-dialog";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

type FormState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; category: Category };

type SettingsPageProps = {
  initialTasks: Task[];
  initialCategories: Category[];
};

export function SettingsPage({
  initialTasks,
  initialCategories,
}: SettingsPageProps) {
  const router = useRouter();
  const {
    tasks,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isAddingCategory,
    isUpdatingCategory,
    isDeletingCategory,
  } = useTasks({
    tasks: initialTasks,
    categories: initialCategories,
  } satisfies TasksInitialData);

  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const handleLogout = useLogout();

  const handleNavChange = useCallback(
    (key: string) => {
      const route = NAV_ROUTES[key];
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
    async (category: Category) => {
      const hasLinkedTasks = tasks.some(
        (task) => task.categoryId === category.id,
      );
      if (hasLinkedTasks) {
        setDeleteTarget(category);
      } else {
        await deleteCategory(category.id);
      }
    },
    [tasks, deleteCategory],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    setFormState({ mode: "closed" });
  }, [deleteTarget, deleteCategory]);

  const handleFormCancel = useCallback(() => {
    setFormState({ mode: "closed" });
  }, []);

  const isMobile = !useMediaQuery("(min-width: 768px)");

  const editingCategory = formState.mode === "edit" ? formState.category : null;
  const isFormOpen = formState.mode !== "closed";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar
          activeItem="settings"
          onItemChange={handleNavChange}
          onLogout={handleLogout}
        />

        <main
          className="flex flex-1 flex-col gap-5 p-5 pb-0 md:gap-6 md:p-8"
          data-testid="settings-page"
        >
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
                  addCategory={addCategory}
                  updateCategory={updateCategory}
                  onSuccess={handleFormCancel}
                  onCancel={handleFormCancel}
                  loading={
                    formState.mode === "edit"
                      ? isUpdatingCategory
                      : isAddingCategory
                  }
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
                <DialogTitle className="sr-only">
                  {editingCategory ? "カテゴリ編集" : "カテゴリ追加"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  カテゴリ名とカラーを入力して保存するダイアログです。
                </DialogDescription>
                <CategoryForm
                  key={
                    formState.mode === "edit"
                      ? `mobile-${formState.category.id}`
                      : "mobile-add"
                  }
                  editingCategory={editingCategory}
                  addCategory={addCategory}
                  updateCategory={updateCategory}
                  onSuccess={handleFormCancel}
                  onCancel={handleFormCancel}
                  loading={
                    formState.mode === "edit"
                      ? isUpdatingCategory
                      : isAddingCategory
                  }
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
          loading={isDeletingCategory}
        />
      )}
    </div>
  );
}
