import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@todo-list/schema";
import type { Context, Env } from "hono";
import type { ValidatedJsonInput } from "../../shared/types/hono";
import * as categoryService from "./service";

export async function list(c: Context) {
  const categories = await categoryService.list();
  return c.json(categories);
}

export async function create(
  c: Context<Env, string, ValidatedJsonInput<CreateCategoryInput>>,
) {
  const input = c.req.valid("json");
  const category = await categoryService.create(input);
  return c.json(category, 201);
}

export async function update(
  c: Context<Env, string, ValidatedJsonInput<UpdateCategoryInput>>,
) {
  const id = c.req.param("id")!;
  const input = c.req.valid("json");
  const category = await categoryService.update(id, input);
  if (!category) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(category);
}

export async function remove(c: Context) {
  const id = c.req.param("id")!;
  const deleted = await categoryService.remove(id);
  if (!deleted) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.body(null, 204);
}
