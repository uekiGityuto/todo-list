import { zValidator } from "@hono/zod-validator";
import {
  createTaskSchema,
  idParamSchema,
  updateTaskSchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import * as taskService from "./service";

export const tasksRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const tasks = await taskService.list(userId);
    return c.json(tasks);
  })
  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const result = await taskService.create(userId, input);
    if (result.type === "category_not_found") {
      return c.json({ error: "Category not found" }, 404);
    }
    return c.json(result.task, 201);
  })
  .put(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateTaskSchema),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const result = await taskService.update(userId, id, input);
      if (result.type === "not_found") {
        return c.json({ error: "Not found" }, 404);
      }
      if (result.type === "category_not_found") {
        return c.json({ error: "Category not found" }, 404);
      }
      return c.json(result.task);
    },
  )
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const deleted = await taskService.remove(userId, id);
    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.body(null, 204);
  });
