"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useTaskPageActions } from "@/shared/hooks/use-task-page-actions";
import { type TasksInitialData, useTasks } from "@/shared/hooks/use-tasks";
import { formatDuration } from "@/shared/lib/format-duration";
import type { Category, Task } from "@/shared/types/task";
import { AddTaskModal } from "@/shared/ui/add-task-modal";
import { DeleteConfirmDialog } from "@/shared/ui/delete-confirm-dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/shadcn/button";
import { Sidebar } from "@/shared/ui/sidebar";
import { TabBar } from "@/shared/ui/tab-bar";
import { TaskCard } from "@/shared/ui/task-card";

import { FilterChip } from "./filter-chip";
import { NextTaskCard } from "./next-task-card";

type StatusFilter = "all" | "active" | "done";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "active", label: "未完了" },
  { key: "done", label: "完了済み" },
];

type TasksPageProps = {
  initialTasks: Task[];
  initialCategories: Category[];
};

export function TasksPage({ initialTasks, initialCategories }: TasksPageProps) {
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    setNextTask,
    unsetNextTask,
    addCategory,
  } = useTasks({
    tasks: initialTasks,
    categories: initialCategories,
  } satisfies TasksInitialData);

  const {
    expandedTaskId,
    editingTask,
    deleteTarget,
    handleToggleExpand,
    handleNavChange,
    handleAddTask,
    handleUpdateTask,
    handleConfirmDelete,
    setDeleteTarget,
    setEditingTask,
    renderActions,
  } = useTaskPageActions({
    addTask,
    updateTask,
    deleteTask,
    setNextTask,
    unsetNextTask,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === "active" && task.status === "done") return false;
      if (statusFilter === "done" && task.status !== "done") return false;
      if (categoryFilter && task.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, categoryFilter]);

  const nextTask = useMemo(
    () => filteredTasks.find((t) => t.isNext),
    [filteredTasks],
  );
  const regularTasks = useMemo(
    () => filteredTasks.filter((t) => !t.isNext),
    [filteredTasks],
  );

  const handleCategoryFilterToggle = (categoryId: string) => {
    setCategoryFilter((prev) => (prev === categoryId ? null : categoryId));
  };

  const taskContent = (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">タスク</h1>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-3.5" />
          追加
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active={statusFilter === filter.key}
            onClick={() => setStatusFilter(filter.key)}
          />
        ))}
      </div>

      {categories.length > 0 && (
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pr-8 mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
          <FilterChip
            label="すべて"
            active={categoryFilter === null}
            onClick={() => setCategoryFilter(null)}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              dotColor={category.color}
              active={categoryFilter === category.id}
              onClick={() => handleCategoryFilterToggle(category.id)}
            />
          ))}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <EmptyState onAddTask={() => setIsAddModalOpen(true)} />
      ) : (
        <div className="flex flex-col gap-2">
          {nextTask && (
            <NextTaskCard
              title={nextTask.name}
              duration={
                nextTask.estimatedMinutes
                  ? formatDuration(nextTask.estimatedMinutes)
                  : undefined
              }
              category={nextTask.category.name || undefined}
              expanded={expandedTaskId === nextTask.id}
              onAction={() => handleToggleExpand(nextTask.id)}
            >
              {renderActions(nextTask)}
            </NextTaskCard>
          )}

          {regularTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.name}
              duration={
                task.estimatedMinutes
                  ? formatDuration(task.estimatedMinutes)
                  : undefined
              }
              category={task.category.name || undefined}
              expanded={expandedTaskId === task.id}
              onAction={() => handleToggleExpand(task.id)}
            >
              {renderActions(task)}
            </TaskCard>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar activeItem="tasks" onItemChange={handleNavChange} />

        <main className="flex flex-1 flex-col gap-4 p-5 pb-0 md:p-8">
          {taskContent}
        </main>
      </div>

      <TabBar activeTab="tasks" onTabChange={handleNavChange} />

      <AddTaskModal
        open={isAddModalOpen || !!editingTask}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        onCreateCategory={addCategory}
        categories={categories}
        editingTask={editingTask}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          taskName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
