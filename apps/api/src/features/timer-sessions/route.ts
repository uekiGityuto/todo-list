import { zValidator } from "@hono/zod-validator";
import { createTimerSessionSchema } from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import * as timerSessionService from "./service";

export const timerSessionsRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const session = await timerSessionService.getCurrent(userId);
    return c.json(session);
  })
  .post("/", zValidator("json", createTimerSessionSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const result = await timerSessionService.create(userId, input);
    if (result.type === "active_session_exists") {
      return c.json({ error: "Active session already exists" }, 409);
    }
    if (result.type === "task_not_found") {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json(result.session, 201);
  })
  .delete("/", async (c) => {
    const userId = c.get("userId");
    await timerSessionService.removeAll(userId);
    return c.body(null, 204);
  });
