import { zValidator } from "@hono/zod-validator";
import {
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import * as categoryService from "./service";

export const categoriesRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const categories = await categoryService.list(userId);
    return c.json(categories);
  })
  .post("/", zValidator("json", createCategorySchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const category = await categoryService.create(userId, input);
    return c.json(category, 201);
  })
  .put(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateCategorySchema),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const category = await categoryService.update(userId, id, input);
      if (!category) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json(category);
    },
  )
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const deleted = await categoryService.remove(userId, id);
    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.body(null, 204);
  });
