import type { CreateWorkRecordInput } from "@todo-list/schema";
import { prisma } from "../../shared/lib/prisma";

export async function list() {
  return prisma.workRecord.findMany();
}

export async function create(input: CreateWorkRecordInput) {
  return prisma.workRecord.create({
    data: {
      taskId: input.taskId,
      date: input.date,
      durationMinutes: input.durationMinutes,
      result: input.result,
    },
  });
}
