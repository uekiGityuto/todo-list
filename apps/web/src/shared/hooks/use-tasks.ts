"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { TaskStatus } from "@/shared/enums/task-statuses";
import {
  createCategory,
  createTask,
  deleteCategory,
  deleteTask,
  fetchCategories,
  fetchTasks,
  updateCategory,
  updateTask,
} from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/api/query-keys";
import type { Category, Task, TaskWithCategory } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";

const UNCATEGORIZED: Category = {
  id: "",
  name: "",
  color: "",
};

type AddTaskInput = {
  name: string;
  categoryId: string;
  scheduledDate: string | null;
  estimatedMinutes: number | null;
};

type UpdateTaskInput = {
  name: string;
  categoryId: string;
  scheduledDate: string | null;
  estimatedMinutes: number | null;
};

export type TasksInitialData = {
  categories: Category[];
  tasks: Task[];
};

type UseTasksReturn = {
  tasks: TaskWithCategory[];
  categories: Category[];
  addTask: (input: AddTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setNextTask: (id: string) => Promise<void>;
  unsetNextTask: (id: string) => Promise<void>;
  startWork: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<string>;
  updateCategory: (id: string, name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

function normalizeCategoryId(categoryId: string) {
  return categoryId === "" ? null : categoryId;
}

function toTaskMutationInput(
  task: Task,
  overrides: Partial<
    Pick<
      Task,
      | "categoryId"
      | "estimatedMinutes"
      | "isNext"
      | "name"
      | "scheduledDate"
      | "status"
    >
  >,
) {
  return {
    name: overrides.name ?? task.name,
    categoryId: normalizeCategoryId(overrides.categoryId ?? task.categoryId),
    status: overrides.status ?? task.status,
    isNext: overrides.isNext ?? task.isNext,
    estimatedMinutes: overrides.estimatedMinutes ?? task.estimatedMinutes,
    scheduledDate: overrides.scheduledDate ?? task.scheduledDate,
  };
}

export function useTasks(initialData?: TasksInitialData): UseTasksReturn {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
    initialData: initialData?.tasks,
  });
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    initialData: initialData?.categories,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = []) => [
        ...prev,
        createdTask,
      ]);
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ReturnType<typeof toTaskMutationInput>;
    }) => updateTask(id, input),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = []) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    },
  });
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, deletedTaskId) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = []) =>
        prev.filter((task) => task.id !== deletedTaskId),
      );
      queryClient.setQueryData<WorkRecord[]>(
        queryKeys.workRecords,
        (prev = []) => prev.filter((record) => record.taskId !== deletedTaskId),
      );
      queryClient.setQueryData<TimerSession | null>(
        queryKeys.timerSession,
        (prev) => (prev?.taskId === deletedTaskId ? null : (prev ?? null)),
      );
    },
  });
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (createdCategory) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories,
        (prev = []) => [...prev, createdCategory],
      );
    },
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      color,
      name,
    }: {
      id: string;
      color: string;
      name: string;
    }) => updateCategory(id, { name, color }),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(queryKeys.categories, (prev = []) =>
        prev.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category,
        ),
      );
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedCategoryId) => {
      queryClient.setQueryData<Category[]>(queryKeys.categories, (prev = []) =>
        prev.filter((category) => category.id !== deletedCategoryId),
      );
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = []) =>
        prev.map((task) =>
          task.categoryId === deletedCategoryId
            ? { ...task, categoryId: "" }
            : task,
        ),
      );
    },
  });

  const resolveCategory = useCallback(
    (categoryId: string): Category => {
      return (
        categories.find((category) => category.id === categoryId) ??
        UNCATEGORIZED
      );
    },
    [categories],
  );

  const tasksWithCategory = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      category: resolveCategory(task.categoryId),
    }));
  }, [tasks, resolveCategory]);

  const mutateTask = useCallback(
    async (
      id: string,
      recipe: (task: Task) => ReturnType<typeof toTaskMutationInput>,
    ) => {
      const currentTask = tasks.find((task) => task.id === id);
      if (!currentTask) return;
      await updateTaskMutation.mutateAsync({
        id,
        input: recipe(currentTask),
      });
    },
    [tasks, updateTaskMutation],
  );

  const addTaskAction = useCallback(
    async (input: AddTaskInput) => {
      await createTaskMutation.mutateAsync({
        name: input.name,
        categoryId: normalizeCategoryId(input.categoryId),
        scheduledDate: input.scheduledDate,
        estimatedMinutes: input.estimatedMinutes,
      });
    },
    [createTaskMutation],
  );

  const updateTaskAction = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      await mutateTask(id, (task) =>
        toTaskMutationInput(task, {
          name: input.name,
          categoryId: input.categoryId,
          scheduledDate: input.scheduledDate,
          estimatedMinutes: input.estimatedMinutes,
        }),
      );
    },
    [mutateTask],
  );

  const deleteTaskAction = useCallback(
    async (id: string) => {
      await deleteTaskMutation.mutateAsync(id);
    },
    [deleteTaskMutation],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      await mutateTask(id, (task) => {
        const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
        return toTaskMutationInput(task, {
          status: nextStatus,
          isNext: nextStatus === "done" ? false : task.isNext,
        });
      });
    },
    [mutateTask],
  );

  const setNextTask = useCallback(
    async (id: string) => {
      const currentTasks = tasks;
      await Promise.all(
        currentTasks
          .filter((task) => task.id === id || task.isNext)
          .map((task) =>
            updateTaskMutation.mutateAsync({
              id: task.id,
              input: toTaskMutationInput(task, {
                isNext: task.id === id,
              }),
            }),
          ),
      );
    },
    [tasks, updateTaskMutation],
  );

  const unsetNextTask = useCallback(
    async (id: string) => {
      await mutateTask(id, (task) =>
        toTaskMutationInput(task, {
          isNext: false,
        }),
      );
    },
    [mutateTask],
  );

  const startWork = useCallback(
    async (id: string) => {
      await mutateTask(id, (task) =>
        toTaskMutationInput(task, {
          status: "in_progress",
        }),
      );
    },
    [mutateTask],
  );

  const completeTask = useCallback(
    async (id: string) => {
      await mutateTask(id, (task) =>
        toTaskMutationInput(task, {
          status: "done",
          isNext: false,
        }),
      );
    },
    [mutateTask],
  );

  const addCategoryAction = useCallback(
    async (name: string, color: string) => {
      const category = await createCategoryMutation.mutateAsync({
        name,
        color,
      });
      return category.id;
    },
    [createCategoryMutation],
  );

  const updateCategoryAction = useCallback(
    async (id: string, name: string, color: string) => {
      await updateCategoryMutation.mutateAsync({ id, name, color });
    },
    [updateCategoryMutation],
  );

  const deleteCategoryAction = useCallback(
    async (id: string) => {
      await deleteCategoryMutation.mutateAsync(id);
    },
    [deleteCategoryMutation],
  );

  return {
    tasks: tasksWithCategory,
    categories,
    addTask: addTaskAction,
    updateTask: updateTaskAction,
    deleteTask: deleteTaskAction,
    toggleComplete,
    setNextTask,
    unsetNextTask,
    startWork,
    completeTask,
    addCategory: addCategoryAction,
    updateCategory: updateCategoryAction,
    deleteCategory: deleteCategoryAction,
  };
}
