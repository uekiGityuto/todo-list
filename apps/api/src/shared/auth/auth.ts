import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
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

// アカウントロック設定
// - WINDOW_SECONDS 内に LOCK_THRESHOLD 回失敗したら COOLDOWN_SECONDS 間ロック
// - WINDOW_SECONDS を超える間隔で散発的に失敗するケースは攻撃と見なさずカウンタをリセット
const LOCK_THRESHOLD = 5;
const WINDOW_SECONDS = 3600;
const COOLDOWN_SECONDS = 900;
const SIGN_IN_PATH = "/sign-in/email";
const ACCOUNT_LOCKED_CODE = "ACCOUNT_LOCKED";
const ACCOUNT_LOCKED_MESSAGE =
  "ログイン失敗が続いたためアカウントを一時的にロックしました。しばらくしてから再度お試しください。";

function getEmailFromBody(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const email = (body as { email?: unknown }).email;
  return typeof email === "string" ? email.toLowerCase() : undefined;
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
    minPasswordLength: 8,
  },
  advanced: {
    // Better Auth はデフォルトで NODE_ENV=test の場合に Origin チェックを
    // スキップするが、攻撃テストや production と同じ挙動を保ちたいため
    // 明示的に false を指定して常に有効化する。
    disableOriginCheck: false,
  },
  hooks: {
    // ロック中のユーザーは Better Auth のパスワード検証に到達する前にブロックする
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== SIGN_IN_PATH) return;
      const email = getEmailFromBody(ctx.body);
      if (!email) return;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { lockedUntil: true },
      });
      if (!user?.lockedUntil) return;
      if (user.lockedUntil.getTime() > Date.now()) {
        throw new APIError("FORBIDDEN", {
          message: ACCOUNT_LOCKED_MESSAGE,
          code: ACCOUNT_LOCKED_CODE,
        });
      }
    }),
    // sign-in の結果に応じて失敗カウンタを更新する
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== SIGN_IN_PATH) return;
      const email = getEmailFromBody(ctx.body);
      if (!email) return;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          failedLoginAttempts: true,
          lastFailedLoginAt: true,
        },
      });
      // 存在しないユーザーは account enumeration を避けるため記録しない
      if (!user) return;

      const returned = ctx.context.returned;
      const failed = returned instanceof APIError;

      if (!failed) {
        if (user.failedLoginAttempts === 0 && user.lastFailedLoginAt === null) {
          return;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
            lockedUntil: null,
          },
        });
        return;
      }

      // ACCOUNT_LOCKED は before hook で出した自前エラー。二重カウントしない
      if (returned.body?.code === ACCOUNT_LOCKED_CODE) return;

      const now = new Date();
      const withinWindow =
        user.lastFailedLoginAt !== null &&
        now.getTime() - user.lastFailedLoginAt.getTime() <
          WINDOW_SECONDS * 1000;
      const nextAttempts = withinWindow ? user.failedLoginAttempts + 1 : 1;
      const shouldLock = nextAttempts >= LOCK_THRESHOLD;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextAttempts,
          lastFailedLoginAt: now,
          lockedUntil: shouldLock
            ? new Date(now.getTime() + COOLDOWN_SECONDS * 1000)
            : null,
        },
      });
    }),
  },
});
