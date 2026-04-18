import { formatDuration } from "@/shared/lib/format-duration";
import type { TaskWithCategory } from "@/shared/types/task";
import { SectionHeader } from "@/shared/ui/section-header";
import { TaskCard } from "@/shared/ui/task-card";
import { NextTaskHero } from "./next-task-hero";

interface TaskContentProps {
  nextTask: TaskWithCategory | undefined;
  todayTasks: TaskWithCategory[];
  expandedTaskId: string | null;
  onToggleExpand: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onStartWork: (taskId: string) => void;
  renderActions: (task: TaskWithCategory) => React.ReactNode;
}

export function TaskContent({
  nextTask,
  todayTasks,
  expandedTaskId,
  onToggleExpand,
  onNavigateToTasks,
  onStartWork,
  renderActions,
}: TaskContentProps) {
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
