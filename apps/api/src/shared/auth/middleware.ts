import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
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

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJwks());
    if (!payload.sub) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
