import type { AppType } from "@todo-list/api/client";
import { hc } from "hono/client";

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}

export function createApiClient() {
  return hc<AppType>(getApiBaseUrl(), {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, {
        ...init,
        cache: "no-store",
      }),
  });
}

export const apiClient = createApiClient();
