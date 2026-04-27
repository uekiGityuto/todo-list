import { proxyRequest } from "@/shared/lib/http/proxy";

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:3001"
  );
}

async function proxy(request: Request, path: string[]) {
  const targetUrl = new URL(
    `${getApiBaseUrl()}/api/auth/${path.join("/")}${new URL(request.url).search}`,
  );

  return proxyRequest(request, targetUrl);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}
