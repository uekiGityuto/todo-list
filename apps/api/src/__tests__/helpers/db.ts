import { prisma } from "../../shared/lib/prisma";

export async function cleanDatabase(): Promise<void> {
  try {
    await prisma.verification.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.workRecord.deleteMany();
    await prisma.timerSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
  } catch (error) {
    throw new Error(
      "Database is not ready. Run the local Postgres setup and apply Prisma migrations before running API tests.",
      { cause: error },
    );
  }
}
export { prisma };
