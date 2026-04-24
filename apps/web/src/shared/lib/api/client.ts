import type { AppType } from "@todo-list/api/client";
import { hc } from "hono/client";
import { createSupabaseBrowserClient } from "../supabase/client";

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}

export function createApiClient(
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>),
) {
  return hc<AppType>(getApiBaseUrl(), {
    headers,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const method = init?.method?.toUpperCase();
      if (method && method !== "GET" && method !== "HEAD") {
        headers.set("Idempotency-Key", crypto.randomUUID());
      }
      // Next.js の fetch キャッシュを無効化し、キャッシュ管理は TanStack Query に委ねる
      return fetch(input, { ...init, headers, cache: "no-store" });
    },
  });
}

export const apiClient = createApiClient(
  async (): Promise<Record<string, string>> => {
    if (typeof window === "undefined") return {};
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};
  },
);
