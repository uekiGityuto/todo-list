import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import { errorResponse } from "./error-response";

export function createErrorHandler(logger: Logger): ErrorHandler {
  return (err, c) => {
    if (err instanceof HTTPException && err.status < 500) {
      logger.warn(
        { requestId: c.get("requestId"), status: err.status },
        err.message,
      );
      if (err.status === 400) {
        return errorResponse(c, 400, "INVALID_JSON");
      }
      return err.getResponse();
    }

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
