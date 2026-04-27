import { vi } from "vitest";

export const getSession = vi.fn(
  async ({ headers }: { headers?: Headers | globalThis.HeadersInit }) => {
    const requestHeaders = new Headers(headers);
    const authorization = requestHeaders.get("authorization");
    const cookie = requestHeaders.get("cookie");

    if (
      authorization === "Bearer test-token" ||
      cookie?.includes("better-auth.session_token=test-session")
    ) {
      return {
        session: {
          id: "test-session-id",
          userId: "test-user-id",
        },
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "test",
        },
      };
    }

    return null;
  },
);

vi.mock("../../shared/auth/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));
