import type { CreateTaskInput, UpdateTaskInput } from "@todo-list/schema";
import type { Context, Env } from "hono";
import type { ValidatedJsonInput } from "../../shared/types/hono";
import * as taskService from "./service";

export async function list(c: Context) {
  const tasks = await taskService.list();
  return c.json(tasks);
}

export async function create(
  c: Context<Env, string, ValidatedJsonInput<CreateTaskInput>>,
) {
  const input = c.req.valid("json");
  const result = await taskService.create(input);
  if (result.type === "category_not_found") {
    return c.json({ error: "Category not found" }, 404);
  }
  return c.json(result.task, 201);
}

export async function update(
  c: Context<Env, string, ValidatedJsonInput<UpdateTaskInput>>,
) {
  const id = c.req.param("id")!;
  const input = c.req.valid("json");
  const result = await taskService.update(id, input);
  if (result.type === "not_found") {
    return c.json({ error: "Not found" }, 404);
  }
  if (result.type === "category_not_found") {
    return c.json({ error: "Category not found" }, 404);
  }
  return c.json(result.task);
}

export async function remove(c: Context) {
  const id = c.req.param("id")!;
  const deleted = await taskService.remove(id);
  if (!deleted) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.body(null, 204);
}
