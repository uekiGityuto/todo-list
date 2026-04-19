import { zValidator } from "@hono/zod-validator";
import {
  createTaskSchema,
  idParamSchema,
  updateTaskSchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import * as taskService from "./service";

export const tasksRoute = new Hono()
  .get("/", async (c) => {
    const tasks = await taskService.list();
    return c.json(tasks);
  })
  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await taskService.create(input);
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
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const result = await taskService.update(id, input);
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
    const { id } = c.req.valid("param");
    const deleted = await taskService.remove(id);
    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.body(null, 204);
  });
