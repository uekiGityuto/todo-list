import { zValidator } from "@hono/zod-validator";
import { createWorkRecordSchema } from "@todo-list/schema";
import { Hono } from "hono";
import type { AuthEnv } from "../../shared/auth/env";
import * as workRecordService from "./service";

export const workRecordsRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const records = await workRecordService.list(userId);
    return c.json(records);
  })
  .post("/", zValidator("json", createWorkRecordSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const result = await workRecordService.create(userId, input);
    if (result.type === "task_not_found") {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json(result.workRecord, 201);
  });
