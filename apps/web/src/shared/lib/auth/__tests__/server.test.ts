import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signOutServerSession } from "@/shared/lib/auth/server";

describe("signOutServerSession", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    fetchSpy.mockReset();
    fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Origin ヘッダがない request でも、Web オリジンを補完して sign-out へ forward する", async () => {
    const request = new Request(
      "https://app.example.com/auth/session-expired",
      {
        method: "GET",
        headers: { cookie: "better-auth.session_token=abc" },
      },
    );

    await signOutServerSession(request);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const init = fetchSpy.mock.calls[0]![1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("origin")).toBe("https://app.example.com");
    expect(headers.get("cookie")).toBe("better-auth.session_token=abc");
  });

  it("Origin ヘッダが既にある場合は上書きしない", async () => {
    const request = new Request(
      "https://app.example.com/auth/session-expired",
      {
        method: "POST",
        headers: {
          cookie: "better-auth.session_token=abc",
          origin: "https://other.example.com",
        },
      },
    );

    await signOutServerSession(request);

    const init = fetchSpy.mock.calls[0]![1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("origin")).toBe("https://other.example.com");
  });
});
