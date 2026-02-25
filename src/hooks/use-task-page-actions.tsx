"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { TaskActionList } from "@/components/task-action-list";

import type { TaskFormData } from "@/components/add-task-modal";
import type { TaskWithCategory } from "@/types/task";

type UseTaskPageActionsParams = {
  addTask: (input: TaskFormData) => void;
  updateTask: (id: string, input: TaskFormData) => void;
  deleteTask: (id: string) => void;
  setNextTask: (id: string) => void;
  unsetNextTask: (id: string) => void;
};

type UseTaskPageActionsReturn = {
  expandedTaskId: string | null;
  editingTask: (TaskFormData & { id: string }) | undefined;
  deleteTarget: TaskWithCategory | null;
  handleToggleExpand: (taskId: string) => void;
  handleNavChange: (key: string) => void;
  handleStartWork: (taskId: string) => void;
  handleAddTask: (data: TaskFormData) => void;
  handleUpdateTask: (data: TaskFormData) => void;
  handleOpenEdit: (task: TaskWithCategory) => void;
  handleConfirmDelete: () => void;
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

  const handleStartWork = useCallback(
    (taskId: string) => {
      router.push(`/timer?taskId=${taskId}`);
    },
    [router],
  );

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
