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
  const session = await timerSessionService.create(input);
  if (!session) {
    return c.json({ error: "Active session already exists" }, 409);
  }
  return c.json(session, 201);
}

export async function remove(c: Context) {
  await timerSessionService.removeAll();
  return c.body(null, 204);
}
