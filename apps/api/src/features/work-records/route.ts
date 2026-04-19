import { zValidator } from "@hono/zod-validator";
import { createWorkRecordSchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as handler from "./handler";

export const workRecordsRoute = new Hono()
  .get("/", handler.list)
  .post("/", zValidator("json", createWorkRecordSchema), handler.create);
