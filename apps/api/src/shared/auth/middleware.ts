import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { errorResponse } from "../http/error-response";
import type { AuthEnv } from "./env";

let jwks: ReturnType<typeof createRemoteJWKSet>;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

function unauthorized(c: Parameters<typeof errorResponse>[0]) {
  c.header("WWW-Authenticate", "Bearer");
  return errorResponse(c, 401, "UNAUTHORIZED");
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized(c);
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJwks());
    if (!payload.sub) {
      return unauthorized(c);
    }
    c.set("userId", payload.sub);
    await next();
  } catch {
    return unauthorized(c);
  }
});
