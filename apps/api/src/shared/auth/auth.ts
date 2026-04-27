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
// - account enumeration を避けるため、ロック中も外向きのレスポンスは通常の認証失敗と同一にする
const LOCK_THRESHOLD = 5;
const WINDOW_SECONDS = 3600;
const COOLDOWN_SECONDS = 900;
const SIGN_IN_PATH = "/sign-in/email";
// Better Auth が通常のパスワード不一致時に返すコード/メッセージと一致させる
const INVALID_CREDENTIALS_CODE = "INVALID_EMAIL_OR_PASSWORD";
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

function getEmailFromBody(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const email = (body as { email?: unknown }).email;
  return typeof email === "string" ? email.toLowerCase() : undefined;
}

interface FailureRow {
  id: string;
  failed_login_attempts: number;
  last_failed_login_at: Date | null;
  locked_until: Date | null;
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
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== SIGN_IN_PATH) return;
      const email = getEmailFromBody(ctx.body);
      if (!email) return;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, lockedUntil: true },
      });
      if (!user?.lockedUntil) return;

      if (user.lockedUntil.getTime() > Date.now()) {
        // ロック中。account enumeration を避けるため、未登録メールや
        // パスワード不一致と外向きには区別がつかない 401 を返す
        throw new APIError("UNAUTHORIZED", {
          message: INVALID_CREDENTIALS_MESSAGE,
          code: INVALID_CREDENTIALS_CODE,
        });
      }

      // cooldown 経過。次の試行を「初回」として扱うためカウンタとロックを完全リセットしてから通す
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          lockedUntil: null,
        },
      });
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== SIGN_IN_PATH) return;
      const email = getEmailFromBody(ctx.body);
      if (!email) return;

      const returned = ctx.context.returned;
      const isCredentialFailure =
        returned instanceof APIError &&
        returned.body?.code === INVALID_CREDENTIALS_CODE;

      // 認証以外のエラー (Origin/CSRF: 403、rate limit: 429、バリデーション: 400 等) は
      // 資格情報の真偽と無関係なので、ロックカウンタの加算もリセットも行わない。
      // 攻撃者が CSRF 違反等を 5 回踏ませて被害者アカウントをロックさせる経路を塞ぐため。
      if (returned instanceof APIError && !isCredentialFailure) return;

      if (!isCredentialFailure) {
        // 成功。残っているカウンタとロックを atomic にリセット
        // (updateMany + where 条件で no-op のときは書き込みしない)
        await prisma.user.updateMany({
          where: {
            email,
            OR: [
              { failedLoginAttempts: { gt: 0 } },
              { lastFailedLoginAt: { not: null } },
              { lockedUntil: { not: null } },
            ],
          },
          data: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
            lockedUntil: null,
          },
        });
        return;
      }

      // 資格情報不一致時の更新は並行リクエストの increment が消えないように
      // 行ロック (SELECT ... FOR UPDATE) で直列化する
      await prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<FailureRow[]>`
          SELECT id, failed_login_attempts, last_failed_login_at, locked_until
          FROM "user"
          WHERE email = ${email}
          FOR UPDATE
        `;
        const row = rows[0];
        // 存在しないユーザーは account enumeration を避けるため記録しない
        if (!row) return;
        // 既にロック中のリクエストはカウントしない (DoS 抑制)
        if (row.locked_until && row.locked_until.getTime() > Date.now()) return;

        const now = new Date();
        const withinWindow =
          row.last_failed_login_at !== null &&
          now.getTime() - row.last_failed_login_at.getTime() <
            WINDOW_SECONDS * 1000;
        const nextAttempts = withinWindow ? row.failed_login_attempts + 1 : 1;
        const shouldLock = nextAttempts >= LOCK_THRESHOLD;

        await tx.user.update({
          where: { id: row.id },
          data: {
            failedLoginAttempts: nextAttempts,
            lastFailedLoginAt: now,
            lockedUntil: shouldLock
              ? new Date(now.getTime() + COOLDOWN_SECONDS * 1000)
              : null,
          },
        });
      });
    }),
  },
});
