import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

describe("Work Records API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /work-records", () => {
    it("should return empty array when no records exist", async () => {
      const res = await app.request("/work-records");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("should return all work records", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });
      await prisma.workRecord.create({
        data: {
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
        },
      });
      await prisma.workRecord.create({
        data: {
          taskId: task.id,
          date: "2026-04-18",
          durationMinutes: 15,
          result: "interrupted",
        },
      });

      // When
      const res = await app.request("/work-records");

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("taskId");
      expect(body[0]).toHaveProperty("date");
      expect(body[0]).toHaveProperty("durationMinutes");
      expect(body[0]).toHaveProperty("result");
    });
  });

  describe("POST /work-records", () => {
    it("should create a work record with valid input", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
        },
      });

      // When
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 45,
          result: "completed",
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.taskId).toBe(task.id);
      expect(body.date).toBe("2026-04-19");
      expect(body.durationMinutes).toBe(45);
      expect(body.result).toBe("completed");
      expect(body.id).toBeDefined();
    });

    it("should create a work record with zero duration", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      // When
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          date: "2026-04-19",
          durationMinutes: 0,
          result: "interrupted",
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.durationMinutes).toBe(0);
    });

    it("should return 400 when taskId is not a valid UUID", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "not-a-uuid",
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when result is not a valid enum value", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026-04-19",
          durationMinutes: 30,
          result: "invalid_result",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when durationMinutes is negative", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          date: "2026-04-19",
          durationMinutes: -1,
          result: "completed",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await app.request("/work-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });
});
