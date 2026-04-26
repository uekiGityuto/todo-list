import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const AUTH_DIR = path.join(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");
const ENV_FILE = path.join(__dirname, "../apps/web/.env.local");
const TEST_EMAIL = "agent@example.com";
// ローカル Supabase 専用。存在しなければ自動で作成する。
const TEST_PASSWORD = "agent001";
const STORAGE_KEY = "sb-127-auth-token";
const SUPABASE_URL = "http://127.0.0.1:54321";

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function readAnonKey() {
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (envAnonKey) {
    return envAnonKey;
  }

  const env = await fs.readFile(ENV_FILE, "utf8");
  const line = env
    .split("\n")
    .find((entry) => entry.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY="));

  if (!line) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY が環境変数にも apps/web/.env.local にもありません",
    );
  }

  return line.slice("NEXT_PUBLIC_SUPABASE_ANON_KEY=".length).trim();
}

async function signInWithPassword(anonKey: string) {
  return fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
}

async function signUp(anonKey: string) {
  return fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
}

test("認証済み状態を作成する", async ({ context, page }) => {
  await fs.mkdir(AUTH_DIR, { recursive: true });

  const anonKey = await readAnonKey();

  let response = await signInWithPassword(anonKey);

  if (!response.ok) {
    const signupResponse = await signUp(anonKey);
    if (!signupResponse.ok) {
      throw new Error(
        `テストアカウントの作成に失敗しました: ${await signupResponse.text()}`,
      );
    }

    response = await signInWithPassword(anonKey);
  }

  if (!response.ok) {
    throw new Error(
      `テストアカウントのログインに失敗しました: ${await response.text()}`,
    );
  }

  const session = await response.json();
  const cookieValue = `base64-${toBase64Url(JSON.stringify(session))}`;

  await context.addCookies([
    {
      name: STORAGE_KEY,
      value: cookieValue,
      url: "http://127.0.0.1:3100",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await context.storageState({ path: AUTH_FILE });
});
