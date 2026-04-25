import { zValidator } from "@hono/zod-validator";
import {
  createTaskSchema,
  idParamSchema,
  updateTaskSchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import { errorResponse } from "../../shared/http/error-response";
import { validationHook } from "../../shared/http/validation-hook";
import * as taskService from "./service";

export const tasksRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const tasks = await taskService.list(userId);
    return c.json(tasks);
  })
  .post(
    "/",
    zValidator("json", createTaskSchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const result = await taskService.create(userId, input);
      if (result.type === "category_not_found") {
        return errorResponse(c, 404, "CATEGORY_NOT_FOUND");
      }
      return c.json(result.task, 201);
    },
  )
  .put(
    "/:id",
    zValidator("param", idParamSchema, validationHook),
    zValidator("json", updateTaskSchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const result = await taskService.update(userId, id, input);
      if (result.type === "not_found") {
        return errorResponse(c, 404, "TASK_NOT_FOUND");
      }
      if (result.type === "category_not_found") {
        return errorResponse(c, 404, "CATEGORY_NOT_FOUND");
      }
      return c.json(result.task);
    },
  )
  .delete(
    "/:id",
    zValidator("param", idParamSchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const deleted = await taskService.remove(userId, id);
      if (!deleted) {
        return errorResponse(c, 404, "TASK_NOT_FOUND");
      }
      return c.body(null, 204);
    },
  );
