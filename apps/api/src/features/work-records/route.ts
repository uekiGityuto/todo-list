import { zValidator } from "@hono/zod-validator";
import { createWorkRecordSchema } from "@todo-list/schema";
import { Hono } from "hono";
import * as workRecordService from "./service";

export const workRecordsRoute = new Hono()
  .get("/", async (c) => {
    const records = await workRecordService.list();
    return c.json(records);
  })
  .post("/", zValidator("json", createWorkRecordSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await workRecordService.create(input);
    if (result.type === "task_not_found") {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json(result.workRecord, 201);
  });
