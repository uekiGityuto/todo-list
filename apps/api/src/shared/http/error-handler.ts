import type { ErrorHandler } from "hono";
import type { Logger } from "pino";

export function createErrorHandler(logger: Logger): ErrorHandler {
  return (err, c) => {
    logger.error(
      {
        requestId: c.get("requestId"),
        err,
      },
      "unhandled error",
    );

    return c.json({ error: "Internal Server Error" }, 500);
  };
}
