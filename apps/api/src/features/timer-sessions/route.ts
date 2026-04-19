import { zValidator } from "@hono/zod-validator";
import { createTimerSessionSchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as handler from "./handler";

export const timerSessionsRoute = new Hono()
  .get("/", handler.getCurrent)
  .post("/", zValidator("json", createTimerSessionSchema), handler.create)
  .delete("/", handler.remove);
