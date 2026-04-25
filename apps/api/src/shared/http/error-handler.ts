import type { ErrorHandler } from "hono";
import type { Logger } from "pino";
import { errorResponse } from "./error-response";

export function createErrorHandler(logger: Logger): ErrorHandler {
  return (err, c) => {
    logger.error(
      {
        requestId: c.get("requestId"),
        err,
      },
      "unhandled error",
    );

    return errorResponse(c, 500, "INTERNAL_SERVER_ERROR");
  };
}
