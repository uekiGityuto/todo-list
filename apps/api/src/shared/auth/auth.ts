import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "../lib/prisma";

function getAuthBaseUrl() {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3001/api/auth";
}

function getAuthSecret() {
  return (
    process.env.BETTER_AUTH_SECRET ??
    "dev-only-secret-change-me-dev-only-secret"
  );
}

function getTrustedOrigins() {
  return [
    process.env.APP_URL ?? "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3100",
    "http://localhost:3100",
  ];
}

export const auth = betterAuth({
  appName: "todo-list",
  baseURL: getAuthBaseUrl(),
  secret: getAuthSecret(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
});
