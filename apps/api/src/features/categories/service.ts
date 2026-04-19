import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list() {
  return prisma.category.findMany();
}

export async function create(input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: input.name,
      color: input.color,
    },
  });
}

export async function update(id: string, input: UpdateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      color: input.color,
    },
  });
}

export async function remove(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return false;

  await prisma.category.delete({ where: { id } });
  return true;
}
