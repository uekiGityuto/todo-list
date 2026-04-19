import { zValidator } from "@hono/zod-validator";
import {
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
} from "@todo-list/schema";
import { Hono } from "hono";
import * as categoryService from "./service";

export const categoriesRoute = new Hono()
  .get("/", async (c) => {
    const categories = await categoryService.list();
    return c.json(categories);
  })
  .post("/", zValidator("json", createCategorySchema), async (c) => {
    const input = c.req.valid("json");
    const category = await categoryService.create(input);
    return c.json(category, 201);
  })
  .put(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateCategorySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const category = await categoryService.update(id, input);
      if (!category) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json(category);
    },
  )
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const deleted = await categoryService.remove(id);
    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.body(null, 204);
  });
