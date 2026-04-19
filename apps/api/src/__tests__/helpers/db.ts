import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase(): Promise<void> {
  await prisma.workRecord.deleteMany();
  await prisma.timerSession.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
}

export { prisma };
