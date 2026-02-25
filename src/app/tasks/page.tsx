"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { AddTaskModal, type TaskFormData } from "@/components/add-task-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FilterChip } from "@/components/filter-chip";
import { NextTaskCard } from "@/components/next-task-card";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { TaskActionList } from "@/components/task-action-list";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { formatDuration } from "@/lib/format-duration";

import type { TaskWithCategory } from "@/types/task";

type StatusFilter = "all" | "active" | "done";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "active", label: "未完了" },
  { key: "done", label: "完了済み" },
];

export default function TasksPage() {
  const router = useRouter();
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    setNextTask,
    unsetNextTask,
    addCategory,
  } = useTasks();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<
    (TaskFormData & { id: string }) | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<TaskWithCategory | null>(
    null,
  );

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

  const handleToggleExpand = useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleAddTask = useCallback(
    (data: TaskFormData) => {
      addTask(data);
    },
    [addTask],
  );

  const handleUpdateTask = useCallback(
    (data: TaskFormData) => {
      if (!editingTask) return;
      updateTask(editingTask.id, data);
      setEditingTask(undefined);
    },
    [editingTask, updateTask],
  );

  const handleOpenEdit = useCallback((task: TaskWithCategory) => {
    setEditingTask({
      id: task.id,
      name: task.name,
      categoryId: task.categoryId,
      scheduledDate: task.scheduledDate,
      estimatedMinutes: task.estimatedMinutes,
    });
    setExpandedTaskId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    setExpandedTaskId(null);
  }, [deleteTarget, deleteTask]);

  const handleStartWork = useCallback(
    (taskId: string) => {
      router.push(`/timer?taskId=${taskId}`);
    },
    [router],
  );

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

  const handleCategoryFilterToggle = useCallback((categoryId: string) => {
    setCategoryFilter((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const renderActions = (task: TaskWithCategory) => (
    <TaskActionList
      isNext={task.isNext}
      onSetNext={() => {
        setNextTask(task.id);
        setExpandedTaskId(null);
      }}
      onUnsetNext={() => {
        unsetNextTask(task.id);
        setExpandedTaskId(null);
      }}
      onStartWork={() => handleStartWork(task.id)}
      onEdit={() => handleOpenEdit(task)}
      onDelete={() => {
        setDeleteTarget(task);
        setExpandedTaskId(null);
      }}
    />
  );

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
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pr-8 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
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
