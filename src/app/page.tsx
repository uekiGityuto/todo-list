"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AddTaskModal } from "@/components/add-task-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { NextTaskHero } from "@/components/next-task-hero";
import { RecentWorkColumn } from "@/components/recent-work-column";
import { SectionHeader } from "@/components/section-header";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { useTaskPageActions } from "@/hooks/use-task-page-actions";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkRecords } from "@/hooks/use-work-records";
import { formatDuration } from "@/lib/format-duration";

import type { TaskWithCategory } from "@/types/task";

export default function HomePage() {
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

  const { recentWorkByDay } = useWorkRecords(tasks);

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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar activeItem="home" onItemChange={handleNavChange} />

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
                  onNavigateToTasks={() => router.push("/tasks")}
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

function TopRow({ onAddTask }: { onAddTask: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          おかえり！
        </span>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          今日もがんばろう 💪
        </h1>
      </div>
      <Button size="sm" onClick={onAddTask} className="hidden md:inline-flex">
        <Plus className="size-4" />
        タスク追加
      </Button>
    </div>
  );
}

function TaskContent({
  nextTask,
  todayTasks,
  expandedTaskId,
  onToggleExpand,
  onNavigateToTasks,
  onStartWork,
  renderActions,
}: {
  nextTask: TaskWithCategory | undefined;
  todayTasks: TaskWithCategory[];
  expandedTaskId: string | null;
  onToggleExpand: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onStartWork: (taskId: string) => void;
  renderActions: (task: TaskWithCategory) => React.ReactNode;
}) {
  return (
    <>
      {nextTask && (
        <NextTaskHero
          title={nextTask.name}
          category={nextTask.category.name || undefined}
          duration={
            nextTask.estimatedMinutes
              ? formatDuration(nextTask.estimatedMinutes)
              : undefined
          }
          onStart={() => onStartWork(nextTask.id)}
        />
      )}

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="今日のタスク"
          action="すべて見る →"
          onAction={onNavigateToTasks}
        />

        {todayTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {todayTasks.map((task) => (
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
                onAction={() => onToggleExpand(task.id)}
              >
                {renderActions(task)}
              </TaskCard>
            ))}
          </div>
        ) : (
          !nextTask && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              今日のタスクはありません
            </p>
          )
        )}
      </div>
    </>
  );
}
