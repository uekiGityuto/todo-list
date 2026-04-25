import { Hono } from "hono";
import { cors } from "hono/cors";
import { categoriesRoute } from "./features/categories/route";
import { tasksRoute } from "./features/tasks/route";
import { timerSessionsRoute } from "./features/timer-sessions/route";
import { workRecordsRoute } from "./features/work-records/route";
import { authMiddleware } from "./shared/auth/middleware";
import { idempotencyMiddleware } from "./shared/idempotency/middleware";

function resolveCorsOrigin(origin: string) {
  if (origin.startsWith("http://localhost:")) {
    return origin;
  }

  if (origin.startsWith("http://127.0.0.1:")) {
    return origin;
  }

  return "";
}

const app = new Hono()
  .use(
    "/*",
    cors({
      origin: resolveCorsOrigin,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    }),
  )
  .use("/*", authMiddleware)
  .use("/*", idempotencyMiddleware)
  .route("/tasks", tasksRoute)
  .route("/categories", categoriesRoute)
  .route("/work-records", workRecordsRoute)
  .route("/timer-sessions", timerSessionsRoute);

export default app;
export type AppType = typeof app;
