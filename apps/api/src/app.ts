import { Hono } from "hono";
import { categoriesRoute } from "./features/categories/route";
import { tasksRoute } from "./features/tasks/route";
import { timerSessionsRoute } from "./features/timer-sessions/route";
import { workRecordsRoute } from "./features/work-records/route";

const app = new Hono()
  .route("/tasks", tasksRoute)
  .route("/categories", categoriesRoute)
  .route("/work-records", workRecordsRoute)
  .route("/timer-sessions", timerSessionsRoute);

export default app;
export type AppType = typeof app;
