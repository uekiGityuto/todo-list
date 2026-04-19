import type { CreateTimerSessionInput } from "@todo-list/schema";
import type { Context, Env } from "hono";
import type { ValidatedJsonInput } from "../../shared/types/hono";
import * as timerSessionService from "./service";

export async function getCurrent(c: Context) {
  const session = await timerSessionService.getCurrent();
  return c.json(session);
}

export async function create(
  c: Context<Env, string, ValidatedJsonInput<CreateTimerSessionInput>>,
) {
  const input = c.req.valid("json");
  const result = await timerSessionService.create(input);
  if (result.type === "active_session_exists") {
    return c.json({ error: "Active session already exists" }, 409);
  }
  if (result.type === "task_not_found") {
    return c.json({ error: "Task not found" }, 404);
  }
  return c.json(result.session, 201);
}

export async function remove(c: Context) {
  await timerSessionService.removeAll();
  return c.body(null, 204);
}
