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
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, {
        ...init,
        cache: "no-store",
      }),
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
