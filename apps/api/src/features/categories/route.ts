import { zValidator } from "@hono/zod-validator";
import {
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import { errorResponse } from "../../shared/http/error-response";
import { validationHook } from "../../shared/http/validation-hook";
import * as categoryService from "./service";

export const categoriesRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const categories = await categoryService.list(userId);
    return c.json(categories);
  })
  .post(
    "/",
    zValidator("json", createCategorySchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const category = await categoryService.create(userId, input);
      return c.json(category, 201);
    },
  )
  .put(
    "/:id",
    zValidator("param", idParamSchema, validationHook),
    zValidator("json", updateCategorySchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const category = await categoryService.update(userId, id, input);
      if (!category) {
        return errorResponse(c, 404, "CATEGORY_NOT_FOUND");
      }
      return c.json(category);
    },
  )
  .delete(
    "/:id",
    zValidator("param", idParamSchema, validationHook),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const result = await categoryService.remove(userId, id);
      if (result === "not_found") {
        return errorResponse(c, 404, "CATEGORY_NOT_FOUND");
      }
      if (result === "conflict") {
        return errorResponse(c, 409, "CATEGORY_IN_USE");
      }
      return c.body(null, 204);
    },
  );
