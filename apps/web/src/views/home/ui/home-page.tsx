"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { useLogout } from "@/shared/hooks/use-logout";
import { useTaskPageActions } from "@/shared/hooks/use-task-page-actions";
import { type TasksInitialData, useTasks } from "@/shared/hooks/use-tasks";
import {
  useWorkRecords,
  type WorkRecordsInitialData,
} from "@/shared/hooks/use-work-records";
import type { Category, Task } from "@/shared/types/task";
import type { WorkRecord } from "@/shared/types/work-record";
import { AddTaskModal } from "@/shared/ui/add-task-modal";
import { DeleteConfirmDialog } from "@/shared/ui/delete-confirm-dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { Sidebar } from "@/shared/ui/sidebar";
import { TabBar } from "@/shared/ui/tab-bar";
import { RecentWorkColumn } from "./recent-work-column";
import { TaskContent } from "./task-content";
import { TopRow } from "./top-row";

type HomePageProps = {
  initialTasks: Task[];
  initialCategories: Category[];
  initialWorkRecords: WorkRecord[];
};

export function HomePage({
  initialTasks,
  initialCategories,
  initialWorkRecords,
}: HomePageProps) {
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    setNextTask,
    unsetNextTask,
    addCategory,
    isAddingTask,
    isUpdatingTask,
    isDeletingTask,
  } = useTasks({
    tasks: initialTasks,
    categories: initialCategories,
  } satisfies TasksInitialData);

  const { recentWorkByDay } = useWorkRecords(tasks, {
    workRecords: initialWorkRecords,
  } satisfies WorkRecordsInitialData);

  const {
    expandedTaskId,
    editingTask,
    deleteTarget,
    handleToggleExpand,
    handleNavChange,
    handleStartWork,
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const nextTask = useMemo(() => tasks.find((t) => t.isNext), [tasks]);

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.scheduledDate === todayStr &&
          (t.status === "todo" || t.status === "in_progress") &&
          !t.isNext,
      ),
    [tasks, todayStr],
  );

  const hasContent = !!nextTask || todayTasks.length > 0;
  const handleLogout = useLogout();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar
          activeItem="home"
          onItemChange={handleNavChange}
          onLogout={handleLogout}
        />

        <main className="flex flex-1 flex-col gap-7 p-5 pb-0 md:p-8 md:pt-8">
          <TopRow onAddTask={() => setIsAddModalOpen(true)} />

          <div className="flex flex-1 gap-7">
            <div className="flex flex-1 flex-col gap-6">
              {hasContent ? (
                <TaskContent
                  nextTask={nextTask}
                  todayTasks={todayTasks}
                  expandedTaskId={expandedTaskId}
                  onToggleExpand={handleToggleExpand}
                  tasksHref="/tasks"
                  onStartWork={handleStartWork}
                  renderActions={renderActions}
                />
              ) : (
                <EmptyState
                  onAddTask={() => setIsAddModalOpen(true)}
                  description="タスクを追加して、今日の作業を始めよう"
                  className="flex-1"
                />
              )}
            </div>

            <RecentWorkColumn recentWorkByDay={recentWorkByDay} />
          </div>
        </main>
      </div>

      <TabBar activeTab="home" onTabChange={handleNavChange} />

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
        loading={editingTask ? isUpdatingTask : isAddingTask}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          taskName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeletingTask}
        />
      )}
    </div>
  );
}
