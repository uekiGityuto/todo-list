import { Prisma } from "@prisma/client";
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

  const deleteWithNullify = () =>
    prisma.$transaction([
      prisma.task.updateMany({
        where: { categoryId: id, userId },
        data: { categoryId: null },
      }),
      prisma.category.delete({ where: { id, userId } }),
    ]);

  try {
    await deleteWithNullify();
  } catch (error) {
    // 同時にタスクがこのカテゴリに紐付けられた場合、リトライ
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      await deleteWithNullify();
    } else {
      throw error;
    }
  }
  return true;
}
