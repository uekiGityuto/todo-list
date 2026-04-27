import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { categoriesRoute } from "./features/categories/route";
import { tasksRoute } from "./features/tasks/route";
import { timerSessionsRoute } from "./features/timer-sessions/route";
import { workRecordsRoute } from "./features/work-records/route";
import { authMiddleware } from "./shared/auth/middleware";
import { createErrorHandler } from "./shared/http/error-handler";
import { errorResponse } from "./shared/http/error-response";
import { createRequestLogger } from "./shared/http/request-logger";
import { logger } from "./shared/lib/logger";

function resolveCorsOrigin(origin: string) {
  if (origin.startsWith("http://localhost:")) {
    return origin;
  }

  if (origin.startsWith("http://127.0.0.1:")) {
    return origin;
  }

  return "";
}

const requestLoggerMiddleware = createRequestLogger(logger);
const errorHandler = createErrorHandler(logger);

const app = new Hono()
  .use("/*", requestId())
  .use(
    "/*",
    cors({
      origin: resolveCorsOrigin,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use("/*", requestLoggerMiddleware)
  .use("/*", async (c, next) => {
    // 認証必須 API のレスポンスがブラウザ・中間キャッシュに残らないようにする。
    // 例外で onError 経路に流れた場合も header を確実に付けるため、
    // next() の前に設定する（context のヘッダは最終 Response にマージされる）。
    c.header("Cache-Control", "no-store, private");
    await next();
  })
  .use("/*", authMiddleware)
  .route("/tasks", tasksRoute)
  .route("/categories", categoriesRoute)
  .route("/work-records", workRecordsRoute)
  .route("/timer-sessions", timerSessionsRoute)
  .notFound((c) => errorResponse(c, 404, "NOT_FOUND"))
  .onError(errorHandler);

export default app;
export type AppType = typeof app;
