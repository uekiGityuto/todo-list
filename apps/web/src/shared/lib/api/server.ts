import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createApiClient } from "./client";
import { ApiError, expectOk } from "./errors";
import {
  normalizeCategory,
  normalizeTask,
  normalizeTimerSession,
  normalizeWorkRecord,
} from "./types";

function rethrowOrRedirectUnauthorized(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    redirect("/auth/session-expired");
  }
  throw error;
}

async function expectOkOrRedirect(response: Response, message: string) {
  try {
    await expectOk(response, message);
  } catch (error) {
    rethrowOrRedirectUnauthorized(error);
  }
}

const getServerApiClient = cache(async () => {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  return createApiClient(cookie ? { cookie } : {});
});

// ここで呼んでいる getter はいずれも、Hono RPC の型定義上は handler が単一の成功
// レスポンス（200）のみを型付けしているエンドポイント。`response.json()` がその
// まま成功 body 型に推論されるので `as ...Response` の型アサーションは不要。
// （実行時には auth ミドルウェア等により 401 などが返り得るが、それは型推論には
// 反映されないため別途 `expectOkOrRedirect` で扱う。）

export const getTasks = cache(async () => {
  const client = await getServerApiClient();
  const response = await client.tasks.$get();
  await expectOkOrRedirect(response, "Failed to fetch tasks");
  const tasks = await response.json();
  return tasks.map(normalizeTask);
});

export const getCategories = cache(async () => {
  const client = await getServerApiClient();
  const response = await client.categories.$get();
  await expectOkOrRedirect(response, "Failed to fetch categories");
  const categories = await response.json();
  return categories.map(normalizeCategory);
});

export const getWorkRecords = cache(async () => {
  const client = await getServerApiClient();
  const response = await client["work-records"].$get();
  await expectOkOrRedirect(response, "Failed to fetch work records");
  const records = await response.json();
  return records.map(normalizeWorkRecord);
});

export const getCurrentTimerSession = cache(async () => {
  const client = await getServerApiClient();
  const response = await client["timer-sessions"].$get();
  await expectOkOrRedirect(response, "Failed to fetch timer session");
  const session = await response.json();
  return session ? normalizeTimerSession(session) : null;
});
