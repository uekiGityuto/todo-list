import type { CreateTaskInput, UpdateTaskInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list() {
  return prisma.task.findMany();
}

export async function create(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      name: input.name,
      categoryId: input.categoryId,
      estimatedMinutes: input.estimatedMinutes,
      scheduledDate: input.scheduledDate,
    },
  });
}

export async function update(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.task.update({
    where: { id },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      status: input.status,
      isNext: input.isNext,
      estimatedMinutes: input.estimatedMinutes,
      scheduledDate: input.scheduledDate,
    },
  });
}

export async function remove(id: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return false;

  await prisma.task.delete({ where: { id } });
  return true;
}
