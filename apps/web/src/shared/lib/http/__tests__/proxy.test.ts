import { afterEach, describe, expect, it, vi } from "vitest";
import { proxyRequest } from "@/shared/lib/http/proxy";

describe("proxyRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("request の hop-by-hop ヘッダを転送しない", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://127.0.0.1:3100/api/backend/tasks", {
      method: "POST",
      headers: {
        connection: "keep-alive",
        "content-length": "3",
        host: "127.0.0.1:3100",
        "x-test": "value",
      },
      body: "abc",
    });

    await proxyRequest(request, new URL("http://127.0.0.1:3001/tasks"));

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const headers = init.headers as Headers;

    expect(headers.get("connection")).toBeNull();
    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("host")).toBeNull();
    expect(headers.get("x-test")).toBe("value");
  });

  it("response の hop-by-hop ヘッダを落として、それ以外は保持する", async () => {
    const responseHeaders = new Headers();
    responseHeaders.set("connection", "close");
    responseHeaders.set("content-encoding", "gzip");
    responseHeaders.set("content-length", "2");
    responseHeaders.set("transfer-encoding", "chunked");
    responseHeaders.set("x-test", "value");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("ok", { headers: responseHeaders })),
    );

    const response = await proxyRequest(
      new Request("http://127.0.0.1:3100/api/backend/tasks"),
      new URL("http://127.0.0.1:3001/tasks"),
    );

    expect(response.headers.get("connection")).toBeNull();
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("transfer-encoding")).toBeNull();
    expect(response.headers.get("x-test")).toBe("value");
  });

  it("複数の Set-Cookie を保持する", async () => {
    const responseHeaders = new Headers();
    responseHeaders.append("set-cookie", "session=abc; Path=/; HttpOnly");
    responseHeaders.append("set-cookie", "data=def; Path=/; HttpOnly");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("ok", { headers: responseHeaders })),
    );

    const response = await proxyRequest(
      new Request("http://127.0.0.1:3100/api/auth/sign-in"),
      new URL("http://127.0.0.1:3001/api/auth/sign-in"),
    );

    expect(response.headers.getSetCookie()).toEqual([
      "session=abc; Path=/; HttpOnly",
      "data=def; Path=/; HttpOnly",
    ]);
  });
});
