"use client";

import { createAuthClient } from "better-auth/react";

function getAuthBaseUrl() {
  return globalThis.location?.origin ?? "http://127.0.0.1:3100";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
