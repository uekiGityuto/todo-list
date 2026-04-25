import type { ApiErrorCode } from "@todo-list/schema";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Logger } from "pino";
import { errorResponse } from "./error-response";

const HTTP_EXCEPTION_CODE_MAP: Partial<Record<number, ApiErrorCode>> = {
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
};

function resolveHttpException400Code(err: HTTPException): ApiErrorCode {
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

export function createErrorHandler(logger: Logger): ErrorHandler {
  return (err, c) => {
    if (err instanceof HTTPException && err.status < 500) {
      logger.warn(
        { requestId: c.get("requestId"), status: err.status },
        err.message,
      );
      if (err.status === 400) {
        return errorResponse(c, 400, resolveHttpException400Code(err));
      }
      const code =
        HTTP_EXCEPTION_CODE_MAP[err.status] ?? "INTERNAL_SERVER_ERROR";
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
