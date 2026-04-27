import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { cleanDatabase, prisma } from "./helpers/db";

// Better Auth 自体への攻撃シナリオ。
// 通常の attack-vectors.test.ts は getSession を mock するが、
// このファイルは mock を使わず実際の Better Auth handler を直接叩く。

const VALID_PASSWORD = "password123";
const VALID_EMAIL = "user@example.com";
const VALID_NAME = "User";
const TRUSTED_ORIGIN = "http://localhost:3000";

async function signUp({
  email = VALID_EMAIL,
  password = VALID_PASSWORD,
  name = VALID_NAME,
  origin = TRUSTED_ORIGIN,
}: {
  email?: string;
  password?: string;
  name?: string;
  origin?: string;
} = {}) {
  return app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ email, password, name }),
  });
}

async function signIn({
  email = VALID_EMAIL,
  password = VALID_PASSWORD,
  origin = TRUSTED_ORIGIN,
}: {
  email?: string;
  password?: string;
  origin?: string;
} = {}) {
  return app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ email, password }),
  });
}

function extractSessionCookie(res: Response): string {
  const cookies = res.headers.getSetCookie?.() ?? [];
  const sessionCookie = cookies.find((c) =>
    c.startsWith("better-auth.session_token="),
  );
  if (!sessionCookie) {
    throw new Error(
      `No session cookie in response. cookies=${JSON.stringify(cookies)}`,
    );
  }
  // Cookie 名=値 部分のみを取り出す
  return sessionCookie.split(";")[0]!;
}

describe("Better Auth - 攻撃シナリオ", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("サインアップ", () => {
    it("有効な入力でアカウント作成できる (200)", async () => {
      const res = await signUp();
      expect(res.status).toBe(200);
    });

    it("パスワードが minPasswordLength (8) 未満は拒否される", async () => {
      const res = await signUp({ password: "1234567" });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("パスワード境界値 (8 文字ちょうど) は受理される", async () => {
      const res = await signUp({ password: "abc12345" });
      expect(res.status).toBe(200);
    });

    it("空のパスワードは拒否される", async () => {
      const res = await signUp({ password: "" });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("不正な email フォーマットは拒否される", async () => {
      const res = await signUp({ email: "not-an-email" });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("既存メールアドレスでの重複登録は失敗する", async () => {
      const first = await signUp();
      expect(first.status).toBe(200);

      const second = await signUp();
      expect(second.status).toBeGreaterThanOrEqual(400);
      expect(second.status).toBeLessThan(500);

      const count = await prisma.user.count();
      expect(count).toBe(1);
    });

    it("email に SQL インジェクションペイロードを入れても DB は壊れない", async () => {
      // 不正フォーマットなので 400 になる想定だが、いずれにせよ user テーブルは健全
      await signUp({ email: 'user@example.com\'; DROP TABLE "user"; --' });

      // テーブル自体が存在し続けることを確認
      await expect(prisma.user.count()).resolves.toBeGreaterThanOrEqual(0);
    });

    it("極端に長い name (10000 文字) でも 5xx で落ちない", async () => {
      const res = await signUp({ name: "a".repeat(10000) });
      // accept (200) でも reject (4xx) でも構わないが、500 系で落ちるのは NG
      expect(res.status).toBeLessThan(500);
    });
  });

  describe("サインイン (account enumeration / brute force 関連)", () => {
    beforeEach(async () => {
      await signUp();
    });

    it("正しい資格情報でサインイン成功", async () => {
      const res = await signIn();
      expect(res.status).toBe(200);
    });

    it("間違ったパスワードは 401", async () => {
      const res = await signIn({ password: "wrongpassword" });
      expect(res.status).toBe(401);
    });

    it("存在しないユーザーは 401", async () => {
      const res = await signIn({
        email: "nobody@example.com",
        password: VALID_PASSWORD,
      });
      expect(res.status).toBe(401);
    });

    it("account enumeration 対策: 存在しないユーザーと間違ったパスワードのレスポンスが同一", async () => {
      const wrongPassword = await signIn({ password: "wrongpassword" });
      const noUser = await signIn({
        email: "nobody@example.com",
        password: VALID_PASSWORD,
      });

      // status / body / code いずれもユーザー存在を漏らしてはならない
      expect(wrongPassword.status).toBe(noUser.status);

      const wrongBody = (await wrongPassword.json()) as {
        message?: string;
        code?: string;
      };
      const noUserBody = (await noUser.json()) as {
        message?: string;
        code?: string;
      };
      expect(wrongBody.message).toBe(noUserBody.message);
      expect(wrongBody.code).toBe(noUserBody.code);
    });

    it("空のパスワードでサインインは失敗する", async () => {
      const res = await signIn({ password: "" });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("email に SQL インジェクションを入れてもログイン成功しない", async () => {
      const res = await signIn({
        email: "' OR '1'='1",
        password: VALID_PASSWORD,
      });
      // 不正 email として 4xx になる前提。少なくとも 200 では決して通さない
      expect(res.status).not.toBe(200);
    });
  });

  describe("セッション cookie の属性", () => {
    it("sign-up 時の Set-Cookie が HttpOnly / SameSite=Lax / Path=/ を含む", async () => {
      const res = await signUp();
      const cookies = res.headers.getSetCookie?.() ?? [];
      const sessionCookie = cookies.find((c) =>
        c.startsWith("better-auth.session_token="),
      );
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/HttpOnly/i);
      expect(sessionCookie).toMatch(/SameSite=Lax/i);
      expect(sessionCookie).toMatch(/Path=\//);
      // 注: Secure 属性は本番（HTTPS）でのみ付くため test では検証しない
    });

    it("sign-in 時の Set-Cookie も HttpOnly を含む", async () => {
      await signUp();
      const res = await signIn();
      const cookies = res.headers.getSetCookie?.() ?? [];
      const sessionCookie = cookies.find((c) =>
        c.startsWith("better-auth.session_token="),
      );
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/HttpOnly/i);
    });
  });

  describe("セッション検証 / 無効化", () => {
    it("sign-up で得た cookie で /tasks にアクセスできる (200)", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      const res = await app.request("/tasks", { headers: { Cookie: cookie } });
      expect(res.status).toBe(200);
    });

    it("改ざんしたセッショントークンは 401", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);
      // 末尾を 1 文字書き換える
      const tamperedCookie = `${cookie.slice(0, -1)}X`;

      const res = await app.request("/tasks", {
        headers: { Cookie: tamperedCookie },
      });
      expect(res.status).toBe(401);
    });

    it("sign-out 後の cookie は無効化される (再利用で 401)", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      const signOutRes = await app.request("/api/auth/sign-out", {
        method: "POST",
        headers: { Cookie: cookie, Origin: TRUSTED_ORIGIN },
      });
      expect(signOutRes.status).toBe(200);

      // 同じ cookie で再アクセス
      const res = await app.request("/tasks", { headers: { Cookie: cookie } });
      expect(res.status).toBe(401);
    });

    it("Origin ヘッダなしの sign-out は 403 (Better Auth の origin check)", async () => {
      // 注: Web 側の `signOutServerSession` はこの挙動を踏まえ Origin を補完する。
      // ここでは Better Auth 側の生挙動を明文化する。
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      const res = await app.request("/api/auth/sign-out", {
        method: "POST",
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(403);
    });

    it("DB から session を直接削除すると、その cookie は無効化される", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      // DB から全 session を削除
      await prisma.session.deleteMany();

      const res = await app.request("/tasks", { headers: { Cookie: cookie } });
      expect(res.status).toBe(401);
    });
  });

  describe("get-session", () => {
    it("cookie なしの get-session は空 body (null) を返す", async () => {
      const res = await app.request("/api/auth/get-session");
      expect(res.status).toBe(200);
      const body = await res.text();
      // null または空文字
      expect(body === "" || body === "null").toBe(true);
    });

    it("不正 cookie の get-session は空 body (null) を返す", async () => {
      const res = await app.request("/api/auth/get-session", {
        headers: { Cookie: "better-auth.session_token=invalid.signature" },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body === "" || body === "null").toBe(true);
    });

    it("正しい cookie の get-session は user 情報を返す", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      const res = await app.request("/api/auth/get-session", {
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        user?: { email?: string };
      } | null;
      expect(body?.user?.email).toBe(VALID_EMAIL);
    });
  });

  describe("CSRF / trustedOrigins", () => {
    // Better Auth の Origin 検証は cookie が付いている or Sec-Fetch-* ヘッダが
    // ある場合に限って走る（攻撃成立条件を満たすブラウザ起点の場合のみ）。
    // 単純な server-to-server POST（cookie/Sec-Fetch なし）は通すが、その場合
    // 認証 cookie が無いため攻撃にはならない。

    it("trusted な Origin (http://localhost:3000) からの sign-in は受理される", async () => {
      await signUp();
      const res = await signIn({ origin: "http://localhost:3000" });
      expect(res.status).toBe(200);
    });

    it("クロスサイトフォーム送信 (Sec-Fetch-Site=cross-site, Mode=navigate) は 403", async () => {
      await signUp();
      const res = await app.request("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example.com",
          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-Mode": "navigate",
        },
        body: JSON.stringify({
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        }),
      });
      expect(res.status).toBe(403);
    });

    it("認証 cookie 付き + 信頼されていない Origin からのリクエストは 403 (CSRF)", async () => {
      const signUpRes = await signUp();
      const cookie = extractSessionCookie(signUpRes);

      // 既存セッションを持つ被害者ブラウザを攻撃者サイトが踏ませた想定
      const res = await app.request("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example.com",
          Cookie: cookie,
        },
        body: JSON.stringify({
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("アカウントロック (失敗5回)", () => {
    beforeEach(async () => {
      await signUp();
    });

    it("失敗5回まではロックされず、6回目以降は 403 ACCOUNT_LOCKED が返る", async () => {
      // 5回目までは 401 (失敗カウントは積まれるがロックは発動しない)
      for (let i = 0; i < 5; i++) {
        const res = await signIn({ password: "wrongpassword" });
        expect(res.status).toBe(401);
      }

      // 6回目以降はロック中なので 403
      const sixth = await signIn({ password: "wrongpassword" });
      expect(sixth.status).toBe(403);
      const body = (await sixth.json()) as { code?: string };
      expect(body.code).toBe("ACCOUNT_LOCKED");

      // ロック中は正しいパスワードでも入れない
      const correct = await signIn();
      expect(correct.status).toBe(403);
      const correctBody = (await correct.json()) as { code?: string };
      expect(correctBody.code).toBe("ACCOUNT_LOCKED");
    });

    it("ロック中は lockedUntil が DB に記録される", async () => {
      for (let i = 0; i < 5; i++) {
        await signIn({ password: "wrongpassword" });
      }
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: VALID_EMAIL },
        select: { lockedUntil: true, failedLoginAttempts: true },
      });
      expect(user.lockedUntil).not.toBeNull();
      expect(user.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
      expect(user.failedLoginAttempts).toBeGreaterThanOrEqual(5);
    });

    it("cooldown 経過後（lockedUntil < now）は再ログインできる", async () => {
      // 5回失敗してロック
      for (let i = 0; i < 5; i++) {
        await signIn({ password: "wrongpassword" });
      }
      // lockedUntil を過去に書き換えて cooldown 経過をシミュレート
      await prisma.user.update({
        where: { email: VALID_EMAIL },
        data: { lockedUntil: new Date(Date.now() - 1000) },
      });

      const res = await signIn();
      expect(res.status).toBe(200);

      // 成功時にカウンタがリセットされていることを確認
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: VALID_EMAIL },
        select: {
          failedLoginAttempts: true,
          lockedUntil: true,
          lastFailedLoginAt: true,
        },
      });
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
      expect(user.lastFailedLoginAt).toBeNull();
    });

    it("ロック前に成功すると失敗カウンタはリセットされる", async () => {
      // 4回失敗（まだロックされない）
      for (let i = 0; i < 4; i++) {
        await signIn({ password: "wrongpassword" });
      }

      // 正しいパスワードで成功
      const ok = await signIn();
      expect(ok.status).toBe(200);

      const user = await prisma.user.findUniqueOrThrow({
        where: { email: VALID_EMAIL },
        select: { failedLoginAttempts: true, lastFailedLoginAt: true },
      });
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lastFailedLoginAt).toBeNull();
    });

    it("存在しないユーザーには失敗カウンタは記録されない (account enumeration 抑止)", async () => {
      for (let i = 0; i < 5; i++) {
        const res = await signIn({
          email: "ghost@example.com",
          password: "wrongpassword",
        });
        // 401 のまま、ロックには切り替わらない
        expect(res.status).toBe(401);
      }
      // user テーブルには ghost は存在しない
      const ghost = await prisma.user.findUnique({
        where: { email: "ghost@example.com" },
      });
      expect(ghost).toBeNull();
    });
  });

  describe("ユーザー隔離 (認証経由)", () => {
    it("user A の cookie で API にアクセスしても user B のデータは見えない", async () => {
      // user A
      const signUpA = await signUp({ email: "a@example.com" });
      const cookieA = extractSessionCookie(signUpA);
      const userAId = ((await signUpA.json()) as { user: { id: string } }).user
        .id;

      // user B のカテゴリを直接 DB で作成
      await signUp({ email: "b@example.com" });
      const userB = await prisma.user.findUniqueOrThrow({
        where: { email: "b@example.com" },
      });
      await prisma.category.create({
        data: {
          name: "B's category",
          color: "#FF0000",
          userId: userB.id,
        },
      });

      // user A としてカテゴリ一覧取得
      const res = await app.request("/categories", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { name: string }[];
      expect(body).toEqual([]);

      // 念のため A != B
      expect(userAId).not.toBe(userB.id);
    });
  });
});
