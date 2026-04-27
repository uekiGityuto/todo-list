import type { AppType } from "@todo-list/api/client";
import { hc } from "hono/client";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

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
        credentials: "include",
      }),
  });
}
export const apiClient = createApiClient();
