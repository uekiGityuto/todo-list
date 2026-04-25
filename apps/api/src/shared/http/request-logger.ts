import type { MiddlewareHandler } from "hono";
import type { Logger } from "pino";

function getLogLevel(status: number): "info" | "warn" | "error" {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  return "info";
}

export function createRequestLogger(logger: Logger): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const status = c.res.status;
    const durationMs = Date.now() - start;
    const level = getLogLevel(status);

    logger[level](
      {
        requestId: c.get("requestId"),
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs,
      },
      "request completed",
    );
  };
}
