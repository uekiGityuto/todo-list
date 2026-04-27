import { headers } from "next/headers";

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:3001"
  );
}

type AuthSession = {
  session: {
    id: string;
    userId: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
} | null;

export async function getServerAuthSession(
  requestHeaders?: HeadersInit,
): Promise<AuthSession> {
  const resolvedHeaders = requestHeaders ?? (await headers());
  const cookie = new Headers(resolvedHeaders).get("cookie");

  const response = await fetch(`${getApiBaseUrl()}/api/auth/get-session`, {
    method: "GET",
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthSession;
}

export async function signOutServerSession(request: Request) {
  // Better Auth は cookie 付き POST に対して Origin ヘッダを検証し、
  // 欠落 / 信頼外なら 403 を返して sign-out が成立しない。
  // session-expired は GET ナビゲーション経由で呼ばれ Origin を持たない
  // ことが多いため、現在の Web オリジンを明示的に forward する。
  const forwardedHeaders = new Headers(request.headers);
  if (!forwardedHeaders.has("origin")) {
    forwardedHeaders.set("origin", new URL(request.url).origin);
  }

  return fetch(`${getApiBaseUrl()}/api/auth/sign-out`, {
    method: "POST",
    headers: forwardedHeaders,
    cache: "no-store",
  });
}
