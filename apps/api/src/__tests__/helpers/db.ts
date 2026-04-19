import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase(): Promise<void> {
  try {
    await prisma.workRecord.deleteMany();
    await prisma.timerSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
  } catch (error) {
    throw new Error(
      "Database is not ready. Run `pnpm db:setup` from the repository root before running API tests.",
      { cause: error },
    );
  }
}

export { prisma };
