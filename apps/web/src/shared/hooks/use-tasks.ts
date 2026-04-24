"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
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
  isAddingTask: boolean;
  isUpdatingTask: boolean;
  isDeletingTask: boolean;
  isAddingCategory: boolean;
  isUpdatingCategory: boolean;
  isDeletingCategory: boolean;
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

  // --- mutations ---

  const createTaskMutation = useMutation({
    mutationFn: (args: {
      input: Parameters<typeof createTask>[0];
      key: string;
    }) => createTask(args.input, args.key),
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
      key,
    }: {
      id: string;
      input: ReturnType<typeof toTaskMutationInput>;
      key: string;
    }) => updateTask(id, input, key),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (prev = []) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    },
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (args: { id: string; key: string }) =>
      deleteTask(args.id, args.key),
    onSuccess: (_, { id: deletedTaskId }) => {
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
    mutationFn: (args: {
      input: Parameters<typeof createCategory>[0];
      key: string;
    }) => createCategory(args.input, args.key),
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
      key,
    }: {
      id: string;
      color: string;
      name: string;
      key: string;
    }) => updateCategory(id, { name, color }, key),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(queryKeys.categories, (prev = []) =>
        prev.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category,
        ),
      );
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: (args: { id: string; key: string }) =>
      deleteCategory(args.id, args.key),
    onSuccess: (_, { id: deletedCategoryId }) => {
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

  // --- helpers ---

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
      key: string,
    ) => {
      const currentTask = tasks.find((task) => task.id === id);
      if (!currentTask) return;
      await updateTaskMutation.mutateAsync({
        id,
        input: recipe(currentTask),
        key,
      });
    },
    [tasks, updateTaskMutation],
  );

  // --- idempotency keys (アクション単位で管理) ---

  const addTaskKeyRef = useRef(crypto.randomUUID());
  const updateTaskKeyRef = useRef(crypto.randomUUID());
  const deleteTaskKeyRef = useRef(crypto.randomUUID());
  const toggleCompleteKeyRef = useRef(crypto.randomUUID());
  const setNextKeyRef = useRef(crypto.randomUUID());
  const unsetNextKeyRef = useRef(crypto.randomUUID());
  const startWorkKeyRef = useRef(crypto.randomUUID());
  const completeTaskKeyRef = useRef(crypto.randomUUID());
  const addCategoryKeyRef = useRef(crypto.randomUUID());
  const updateCategoryKeyRef = useRef(crypto.randomUUID());
  const deleteCategoryKeyRef = useRef(crypto.randomUUID());

  // --- actions ---

  const addTaskAction = useCallback(
    async (input: AddTaskInput) => {
      await createTaskMutation.mutateAsync({
        input: {
          name: input.name,
          categoryId: normalizeCategoryId(input.categoryId),
          scheduledDate: input.scheduledDate,
          estimatedMinutes: input.estimatedMinutes,
        },
        key: addTaskKeyRef.current,
      });
      addTaskKeyRef.current = crypto.randomUUID();
    },
    [createTaskMutation],
  );

  const updateTaskAction = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      await mutateTask(
        id,
        (task) =>
          toTaskMutationInput(task, {
            name: input.name,
            categoryId: input.categoryId,
            scheduledDate: input.scheduledDate,
            estimatedMinutes: input.estimatedMinutes,
          }),
        updateTaskKeyRef.current,
      );
      updateTaskKeyRef.current = crypto.randomUUID();
    },
    [mutateTask],
  );

  const deleteTaskAction = useCallback(
    async (id: string) => {
      await deleteTaskMutation.mutateAsync({
        id,
        key: deleteTaskKeyRef.current,
      });
      deleteTaskKeyRef.current = crypto.randomUUID();
    },
    [deleteTaskMutation],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      await mutateTask(
        id,
        (task) => {
          const nextStatus: TaskStatus =
            task.status === "done" ? "todo" : "done";
          return toTaskMutationInput(task, {
            status: nextStatus,
            isNext: nextStatus === "done" ? false : task.isNext,
          });
        },
        toggleCompleteKeyRef.current,
      );
      toggleCompleteKeyRef.current = crypto.randomUUID();
    },
    [mutateTask],
  );

  const setNextTask = useCallback(
    async (id: string) => {
      const baseKey = setNextKeyRef.current;
      const currentTasks = tasks;
      await Promise.all(
        currentTasks
          .filter((task) => task.id === id || task.isNext)
          .map((task, i) =>
            updateTaskMutation.mutateAsync({
              id: task.id,
              input: toTaskMutationInput(task, {
                isNext: task.id === id,
              }),
              key: `${baseKey}:${i}`,
            }),
          ),
      );
      setNextKeyRef.current = crypto.randomUUID();
    },
    [tasks, updateTaskMutation],
  );

  const unsetNextTask = useCallback(
    async (id: string) => {
      await mutateTask(
        id,
        (task) =>
          toTaskMutationInput(task, {
            isNext: false,
          }),
        unsetNextKeyRef.current,
      );
      unsetNextKeyRef.current = crypto.randomUUID();
    },
    [mutateTask],
  );

  const startWork = useCallback(
    async (id: string) => {
      await mutateTask(
        id,
        (task) =>
          toTaskMutationInput(task, {
            status: "in_progress",
          }),
        startWorkKeyRef.current,
      );
      startWorkKeyRef.current = crypto.randomUUID();
    },
    [mutateTask],
  );

  const completeTask = useCallback(
    async (id: string) => {
      await mutateTask(
        id,
        (task) =>
          toTaskMutationInput(task, {
            status: "done",
            isNext: false,
          }),
        completeTaskKeyRef.current,
      );
      completeTaskKeyRef.current = crypto.randomUUID();
    },
    [mutateTask],
  );

  const addCategoryAction = useCallback(
    async (name: string, color: string) => {
      const category = await createCategoryMutation.mutateAsync({
        input: { name, color },
        key: addCategoryKeyRef.current,
      });
      addCategoryKeyRef.current = crypto.randomUUID();
      return category.id;
    },
    [createCategoryMutation],
  );

  const updateCategoryAction = useCallback(
    async (id: string, name: string, color: string) => {
      await updateCategoryMutation.mutateAsync({
        id,
        name,
        color,
        key: updateCategoryKeyRef.current,
      });
      updateCategoryKeyRef.current = crypto.randomUUID();
    },
    [updateCategoryMutation],
  );

  const deleteCategoryAction = useCallback(
    async (id: string) => {
      await deleteCategoryMutation.mutateAsync({
        id,
        key: deleteCategoryKeyRef.current,
      });
      deleteCategoryKeyRef.current = crypto.randomUUID();
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
    isAddingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isAddingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
}
