import { Prisma } from "@prisma/client";
import type { CreateWorkRecordInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list(userId: string) {
  return prisma.workRecord.findMany({ where: { userId } });
}

type CreateWorkRecordResult =
  | {
      type: "success";
      workRecord: Awaited<ReturnType<typeof prisma.workRecord.create>>;
    }
  | { type: "task_not_found" };

export async function create(userId: string, input: CreateWorkRecordInput) {
  const task = await prisma.task.findUnique({
    where: { id: input.taskId, userId },
    select: { id: true },
  });
  if (!task) return { type: "task_not_found" } satisfies CreateWorkRecordResult;

  try {
    const workRecord = await prisma.workRecord.create({
      data: {
        userId,
        taskId: input.taskId,
        date: input.date,
        durationMinutes: input.durationMinutes,
        result: input.result,
      },
    });
    return { type: "success", workRecord } satisfies CreateWorkRecordResult;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { type: "task_not_found" } satisfies CreateWorkRecordResult;
    }
    throw error;
  }
}
