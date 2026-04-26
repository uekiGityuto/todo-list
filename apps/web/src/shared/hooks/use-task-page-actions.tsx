"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { NAV_ROUTES } from "@/shared/constants/routes";
import type { TaskWithCategory } from "@/shared/types/task";
import type { TaskFormData } from "@/shared/ui/add-task-modal";
import { TaskActionList } from "@/shared/ui/task-action-list";

type UseTaskPageActionsParams = {
  addTask: (input: TaskFormData) => Promise<void>;
  updateTask: (id: string, input: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setNextTask: (id: string) => Promise<void>;
  unsetNextTask: (id: string) => Promise<void>;
};

type UseTaskPageActionsReturn = {
  expandedTaskId: string | null;
  editingTask: (TaskFormData & { id: string }) | undefined;
  deleteTarget: TaskWithCategory | null;
  handleToggleExpand: (taskId: string) => void;
  handleNavChange: (key: string) => void;
  handleStartWork: (taskId: string) => void;
  handleAddTask: (data: TaskFormData) => Promise<void>;
  handleUpdateTask: (data: TaskFormData) => Promise<void>;
  handleOpenEdit: (task: TaskWithCategory) => void;
  handleConfirmDelete: () => Promise<void>;
  setDeleteTarget: (target: TaskWithCategory | null) => void;
  setEditingTask: (task: (TaskFormData & { id: string }) | undefined) => void;
  renderActions: (task: TaskWithCategory) => React.ReactNode;
};

export function useTaskPageActions({
  addTask,
  updateTask,
  deleteTask,
  setNextTask,
  unsetNextTask,
}: UseTaskPageActionsParams): UseTaskPageActionsReturn {
  const router = useRouter();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<
    (TaskFormData & { id: string }) | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<TaskWithCategory | null>(
    null,
  );

  const handleToggleExpand = useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleNavChange = useCallback(
    (key: string) => {
      const route = NAV_ROUTES[key];
      if (route) router.push(route);
    },
    [router],
  );

  const handleStartWork = useCallback(
    (taskId: string) => {
      router.push(`/timer?taskId=${taskId}`);
    },
    [router],
  );

  const handleAddTask = useCallback(
    async (data: TaskFormData) => {
      await addTask(data);
    },
    [addTask],
  );

  const handleUpdateTask = useCallback(
    async (data: TaskFormData) => {
      if (!editingTask) return;
      await updateTask(editingTask.id, data);
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

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    setExpandedTaskId(null);
  }, [deleteTarget, deleteTask]);

  const renderActions = (task: TaskWithCategory) => (
    <TaskActionList
      isNext={task.isNext}
      testIdPrefix={`task-${task.name}`}
      onSetNext={() => {
        void setNextTask(task.id);
        setExpandedTaskId(null);
      }}
      onUnsetNext={() => {
        void unsetNextTask(task.id);
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

  return {
    expandedTaskId,
    editingTask,
    deleteTarget,
    handleToggleExpand,
    handleNavChange,
    handleStartWork,
    handleAddTask,
    handleUpdateTask,
    handleOpenEdit,
    handleConfirmDelete,
    setDeleteTarget,
    setEditingTask,
    renderActions,
  };
}
