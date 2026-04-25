import type { ApiErrorCode } from "@todo-list/schema";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Logger } from "pino";
import { errorResponse } from "./error-response";

function resolveHttpExceptionCode(err: HTTPException): ApiErrorCode {
  if (err.status === 400) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes("malformed") ||
      msg.includes("unexpected") ||
      msg.includes("json")
    ) {
      return "INVALID_JSON";
    }
    return "VALIDATION_ERROR";
  }
  if (err.status === 401) return "UNAUTHORIZED";
  if (err.status === 403) return "FORBIDDEN";
  return "INTERNAL_SERVER_ERROR";
}

export function createErrorHandler(logger: Logger): ErrorHandler {
  return (err, c) => {
    if (err instanceof HTTPException && err.status < 500) {
      logger.warn(
        { requestId: c.get("requestId"), status: err.status },
        err.message,
      );
      const code = resolveHttpExceptionCode(err);
      return errorResponse(c, err.status as ContentfulStatusCode, code);
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
