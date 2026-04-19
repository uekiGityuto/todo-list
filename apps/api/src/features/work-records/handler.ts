import type { CreateWorkRecordInput } from "@todo-list/schema";
import type { Context, Env } from "hono";
import type { ValidatedJsonInput } from "../../shared/types/hono";
import * as workRecordService from "./service";

export async function list(c: Context) {
  const records = await workRecordService.list();
  return c.json(records);
}

export async function create(
  c: Context<Env, string, ValidatedJsonInput<CreateWorkRecordInput>>,
) {
  const input = c.req.valid("json");
  const result = await workRecordService.create(input);
  if (result.type === "task_not_found") {
    return c.json({ error: "Task not found" }, 404);
  }
  return c.json(result.workRecord, 201);
}
