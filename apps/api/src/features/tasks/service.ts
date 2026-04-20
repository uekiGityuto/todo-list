import { Prisma } from "@prisma/client";
import type { CreateTaskInput, UpdateTaskInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list(userId: string) {
  return prisma.task.findMany({ where: { userId } });
}

type CreateTaskResult =
  | { type: "success"; task: Awaited<ReturnType<typeof prisma.task.create>> }
  | { type: "category_not_found" };

export async function create(userId: string, input: CreateTaskInput) {
  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId, userId },
      select: { id: true },
    });
    if (!category)
      return { type: "category_not_found" } satisfies CreateTaskResult;
  }

  try {
    const task = await prisma.task.create({
      data: {
        userId,
        name: input.name,
        categoryId: input.categoryId,
        estimatedMinutes: input.estimatedMinutes,
        scheduledDate: input.scheduledDate,
      },
    });
    return { type: "success", task } satisfies CreateTaskResult;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { type: "category_not_found" } satisfies CreateTaskResult;
    }
    throw error;
  }
}

type UpdateTaskResult =
  | { type: "success"; task: Awaited<ReturnType<typeof prisma.task.update>> }
  | { type: "not_found" }
  | { type: "category_not_found" };

export async function update(
  userId: string,
  id: string,
  input: UpdateTaskInput,
) {
  const existing = await prisma.task.findUnique({ where: { id, userId } });
  if (!existing) return { type: "not_found" } satisfies UpdateTaskResult;

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId, userId },
      select: { id: true },
    });
    if (!category)
      return { type: "category_not_found" } satisfies UpdateTaskResult;
  }

  try {
    const task = await prisma.task.update({
      where: { id, userId },
      data: {
        name: input.name,
        categoryId: input.categoryId,
        status: input.status,
        isNext: input.isNext,
        estimatedMinutes: input.estimatedMinutes,
        scheduledDate: input.scheduledDate,
      },
    });
    return { type: "success", task } satisfies UpdateTaskResult;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { type: "category_not_found" } satisfies UpdateTaskResult;
    }
    throw error;
  }
}

export async function remove(userId: string, id: string) {
  const existing = await prisma.task.findUnique({ where: { id, userId } });
  if (!existing) return false;

  await prisma.task.delete({ where: { id, userId } });
  return true;
}
