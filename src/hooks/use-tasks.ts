"use client";

import { useCallback, useMemo } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

import type { TaskStatus } from "@/enums/task-statuses";
import type { Category, Task, TaskWithCategory } from "@/types/task";

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

type UseTasksReturn = {
  tasks: TaskWithCategory[];
  categories: Category[];
  addTask: (input: AddTaskInput) => void;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setNextTask: (id: string) => void;
  unsetNextTask: (id: string) => void;
  startWork: (id: string) => void;
  completeTask: (id: string) => void;
  addCategory: (name: string, color: string) => string;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
};

export function useTasks(): UseTasksReturn {
  const { value: tasks, setValue: setTasks } = useLocalStorage<Task[]>(
    "tasks",
    [],
  );
  const { value: categories, setValue: setCategories } = useLocalStorage<
    Category[]
  >("categories", []);

  const resolveCategory = useCallback(
    (categoryId: string): Category => {
      return categories.find((c) => c.id === categoryId) ?? UNCATEGORIZED;
    },
    [categories],
  );

  const tasksWithCategory: TaskWithCategory[] = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      category: resolveCategory(task.categoryId),
    }));
  }, [tasks, resolveCategory]);

  const addTask = useCallback(
    (input: AddTaskInput) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: crypto.randomUUID(),
        name: input.name,
        categoryId: input.categoryId,
        status: "todo" as TaskStatus,
        isNext: false,
        estimatedMinutes: input.estimatedMinutes,
        scheduledDate: input.scheduledDate,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [...prev, newTask]);
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                name: input.name,
                categoryId: input.categoryId,
                scheduledDate: input.scheduledDate,
                estimatedMinutes: input.estimatedMinutes,
                updatedAt: now,
              }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const newStatus: TaskStatus =
            task.status === "done" ? "todo" : "done";
          return {
            ...task,
            status: newStatus,
            isNext: newStatus === "done" ? false : task.isNext,
            updatedAt: now,
          };
        }),
      );
    },
    [setTasks],
  );

  const setNextTask = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          isNext: task.id === id,
          updatedAt: task.id === id || task.isNext ? now : task.updatedAt,
        })),
      );
    },
    [setTasks],
  );

  const unsetNextTask = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, isNext: false, updatedAt: now } : task,
        ),
      );
    },
    [setTasks],
  );

  const startWork = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, status: "in_progress" as TaskStatus, updatedAt: now }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const completeTask = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: "done" as TaskStatus,
                isNext: false,
                updatedAt: now,
              }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const addCategory = useCallback(
    (name: string, color: string): string => {
      const id = crypto.randomUUID();
      const newCategory: Category = {
        id,
        name,
        color,
      };
      setCategories((prev) => [...prev, newCategory]);
      return id;
    },
    [setCategories],
  );

  const updateCategory = useCallback(
    (id: string, name: string, color: string) => {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, name, color } : cat)),
      );
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.categoryId === id ? { ...task, categoryId: "" } : task,
        ),
      );
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    },
    [setTasks, setCategories],
  );

  return {
    tasks: tasksWithCategory,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setNextTask,
    unsetNextTask,
    startWork,
    completeTask,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
