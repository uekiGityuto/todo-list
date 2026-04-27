import { NextResponse } from "next/server";

// Strip hop-by-hop headers plus fields that the runtime recalculates.
const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function copyRequestHeaders(headers: Headers): Headers {
  const forwardedHeaders = new Headers();

  headers.forEach((value, key) => {
    if (HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }

    forwardedHeaders.set(key, value);
  });

  return forwardedHeaders;
}

function copyResponseHeaders(headers: Headers): Headers {
  const forwardedHeaders = new Headers();

  headers.forEach((value, key) => {
    if (HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      return;
    }

    forwardedHeaders.append(key, value);
  });

  return forwardedHeaders;
}

export async function proxyRequest(request: Request, targetUrl: URL) {
  const proxiedResponse = await fetch(targetUrl, {
    method: request.method,
    headers: copyRequestHeaders(request.headers),
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    cache: "no-store",
  });

  return new NextResponse(proxiedResponse.body, {
    status: proxiedResponse.status,
    headers: copyResponseHeaders(proxiedResponse.headers),
  });
}
