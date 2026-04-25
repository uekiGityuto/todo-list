import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prismaLogger = logger.child({ component: "prisma" });

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const logDefinitions: Array<{
    level: "warn" | "error" | "query";
    emit: "event";
  }> = [
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ];

  if (process.env.LOG_SQL === "true") {
    logDefinitions.push({ level: "query", emit: "event" });
  }

  const client = new PrismaClient({ adapter, log: logDefinitions });

  client.$on("warn", (e) => {
    prismaLogger.warn({ target: e.target }, e.message);
  });

  client.$on("error", (e) => {
    prismaLogger.error({ target: e.target }, e.message);
  });

  if (process.env.LOG_SQL === "true") {
    client.$on("query", (e) => {
      prismaLogger.debug({ durationMs: e.duration }, e.query);
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
