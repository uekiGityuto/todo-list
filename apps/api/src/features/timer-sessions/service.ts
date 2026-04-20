import { Prisma } from "@prisma/client";
import type { CreateTimerSessionInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function getCurrent() {
  return prisma.timerSession.findFirst();
}

type CreateTimerSessionResult =
  | {
      type: "success";
      session: Awaited<ReturnType<typeof prisma.timerSession.create>>;
    }
  | { type: "active_session_exists" }
  | { type: "task_not_found" };

export async function create(input: CreateTimerSessionInput) {
  const existing = await prisma.timerSession.findFirst();
  if (existing) {
    return { type: "active_session_exists" } satisfies CreateTimerSessionResult;
  }

  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    select: { id: true },
  });
  if (!task)
    return { type: "task_not_found" } satisfies CreateTimerSessionResult;

  try {
    const session = await prisma.timerSession.create({
      data: {
        taskId: input.taskId,
        taskName: input.taskName,
        categoryName: input.categoryName,
        estimatedMinutes: input.estimatedMinutes,
      },
    });
    return { type: "success", session } satisfies CreateTimerSessionResult;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          type: "active_session_exists",
        } satisfies CreateTimerSessionResult;
      }
      if (error.code === "P2003") {
        return { type: "task_not_found" } satisfies CreateTimerSessionResult;
      }
    }
    throw error;
  }
}

export async function removeAll() {
  await prisma.timerSession.deleteMany();
}
