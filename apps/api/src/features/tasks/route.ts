import { zValidator } from "@hono/zod-validator";
import { createTaskSchema, updateTaskSchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as handler from "./handler";

export const tasksRoute = new Hono()
  .get("/", handler.list)
  .post("/", zValidator("json", createTaskSchema), handler.create)
  .put("/:id", zValidator("json", updateTaskSchema), handler.update)
  .delete("/:id", handler.remove);
