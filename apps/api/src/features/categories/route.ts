import { zValidator } from "@hono/zod-validator";
import { createCategorySchema, updateCategorySchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as handler from "./handler";

export const categoriesRoute = new Hono()
  .get("/", handler.list)
  .post("/", zValidator("json", createCategorySchema), handler.create)
  .put("/:id", zValidator("json", updateCategorySchema), handler.update)
  .delete("/:id", handler.remove);
