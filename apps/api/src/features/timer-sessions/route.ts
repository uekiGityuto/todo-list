import { zValidator } from "@hono/zod-validator";
import { createTimerSessionSchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as timerSessionService from "./service";

export const timerSessionsRoute = new Hono()
  .get("/", async (c) => {
    const session = await timerSessionService.getCurrent();
    return c.json(session);
  })
  .post("/", zValidator("json", createTimerSessionSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await timerSessionService.create(input);
    if (result.type === "active_session_exists") {
      return c.json({ error: "Active session already exists" }, 409);
    }
    if (result.type === "task_not_found") {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json(result.session, 201);
  })
  .delete("/", async (c) => {
    await timerSessionService.removeAll();
    return c.body(null, 204);
  });
