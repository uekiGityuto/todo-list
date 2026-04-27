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
  advanced: {
    // Better Auth はデフォルトで NODE_ENV=test の場合に Origin チェックを
    // スキップするが、攻撃テストや production と同じ挙動を保ちたいため
    // 明示的に false を指定して常に有効化する。
    disableOriginCheck: false,
  },
});
