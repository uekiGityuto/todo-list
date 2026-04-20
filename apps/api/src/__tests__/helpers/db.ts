import { prisma } from "../../shared/lib/prisma";

export async function cleanDatabase(): Promise<void> {
  try {
    await prisma.workRecord.deleteMany();
    await prisma.timerSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
  } catch (error) {
    throw new Error(
      "Database is not ready. Run `pnpm supabase:setup` from the repository root before running API tests.",
      { cause: error },
    );
  }
}
export { prisma };
