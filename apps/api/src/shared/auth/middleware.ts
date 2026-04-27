import { createMiddleware } from "hono/factory";
import { errorResponse } from "../http/error-response";
import { auth } from "./auth";
import type { AuthEnv } from "./env";

function unauthorized(c: Parameters<typeof errorResponse>[0]) {
  c.header("WWW-Authenticate", "Bearer");
  return errorResponse(c, 401, "UNAUTHORIZED");
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user.id) {
    return unauthorized(c);
  }

  c.set("userId", session.user.id);
  await next();
});
