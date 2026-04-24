import { createMiddleware } from "hono/factory";
import type { AuthEnv } from "../auth/env";

const TTL_MS = 5 * 60 * 1000;
const CLEANUP_THRESHOLD = 1000;

type IdempotencyEntry = {
  timestamp: number;
  response?: Response;
};

const store = new Map<string, IdempotencyEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.timestamp > TTL_MS) {
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
    const compositeKey = `${userId}:${method}:${c.req.path}:${idempotencyKey}`;

    if (store.size > CLEANUP_THRESHOLD) {
      cleanup();
    }

    const existing = store.get(compositeKey);
    if (existing && Date.now() - existing.timestamp < TTL_MS) {
      if (existing.response) {
        return existing.response.clone();
      }
      return c.json({ error: "Duplicate request" }, 409);
    }

    store.set(compositeKey, { timestamp: Date.now() });
    try {
      await next();

      const status = c.res.status;
      if (status >= 200 && status < 300) {
        store.set(compositeKey, {
          timestamp: Date.now(),
          response: c.res.clone(),
        });
      } else {
        store.delete(compositeKey);
      }
    } catch (e) {
      store.delete(compositeKey);
      throw e;
    }
  },
);
