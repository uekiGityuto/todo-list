import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list(userId: string) {
  return prisma.category.findMany({ where: { userId } });
}

export async function create(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      userId,
      name: input.name,
      color: input.color,
    },
  });
}

export async function update(
  userId: string,
  id: string,
  input: UpdateCategoryInput,
) {
  const existing = await prisma.category.findUnique({ where: { id, userId } });
  if (!existing) return null;

  return prisma.category.update({
    where: { id, userId },
    data: {
      name: input.name,
      color: input.color,
    },
  });
}

export async function remove(userId: string, id: string) {
  const existing = await prisma.category.findUnique({ where: { id, userId } });
  if (!existing) return false;

  await prisma.category.delete({ where: { id, userId } });
  return true;
}
