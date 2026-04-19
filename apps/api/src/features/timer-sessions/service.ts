import type { CreateTimerSessionInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function getCurrent() {
  return prisma.timerSession.findFirst();
}

export async function create(input: CreateTimerSessionInput) {
  const existing = await prisma.timerSession.findFirst();
  if (existing) return null;

  return prisma.timerSession.create({
    data: {
      taskId: input.taskId,
      taskName: input.taskName,
      categoryName: input.categoryName,
      estimatedMinutes: input.estimatedMinutes,
    },
  });
}

export async function removeAll() {
  await prisma.timerSession.deleteMany();
}
