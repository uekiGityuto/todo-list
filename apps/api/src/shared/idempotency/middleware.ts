import { createMiddleware } from "hono/factory";
import type { AuthEnv } from "../auth/env";

const TTL_MS = 5 * 60 * 1000;
const CLEANUP_THRESHOLD = 1000;

const store = new Map<string, number>();

function cleanup() {
  const now = Date.now();
  for (const [key, timestamp] of store) {
    if (now - timestamp > TTL_MS) {
      store.delete(key);
    }
  }
}

export const idempotencyMiddleware = createMiddleware<AuthEnv>(
  async (c, next) => {
    const method = c.req.method;
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return next();
    }

    const idempotencyKey = c.req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return next();
    }

    const userId = c.get("userId");
    const compositeKey = `${userId}:${idempotencyKey}`;

    if (store.size > CLEANUP_THRESHOLD) {
      cleanup();
    }

    const storedTimestamp = store.get(compositeKey);
    if (storedTimestamp !== undefined) {
      if (Date.now() - storedTimestamp < TTL_MS) {
        return c.json({ error: "Duplicate request" }, 409);
      }
      store.delete(compositeKey);
    }

    store.set(compositeKey, Date.now());
    await next();
  },
);
