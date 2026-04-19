import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

describe("Tasks API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /tasks", () => {
    it("should return empty array when no tasks exist", async () => {
      const res = await app.request("/tasks");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("should return all tasks", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });
      await prisma.task.create({
        data: {
          name: "Task 2",
          categoryId: category.id,
          status: "in_progress",
          isNext: true,
          estimatedMinutes: 60,
          scheduledDate: "2026-04-20",
        },
      });

      // When
      const res = await app.request("/tasks");

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("name");
      expect(body[0]).toHaveProperty("categoryId");
      expect(body[0]).toHaveProperty("status");
      expect(body[0]).toHaveProperty("isNext");
      expect(body[0]).toHaveProperty("createdAt");
      expect(body[0]).toHaveProperty("updatedAt");
    });
  });

  describe("POST /tasks", () => {
    it("should create a task with all fields", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });

      // When
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Implement feature",
          categoryId: category.id,
          estimatedMinutes: 60,
          scheduledDate: "2026-04-20",
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe("Implement feature");
      expect(body.categoryId).toBe(category.id);
      expect(body.status).toBe("todo");
      expect(body.isNext).toBe(false);
      expect(body.estimatedMinutes).toBe(60);
      expect(body.scheduledDate).toBe("2026-04-20");
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it("should create a task with null optional fields", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });

      // When
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Simple task",
          categoryId: category.id,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe("Simple task");
      expect(body.estimatedMinutes).toBeNull();
      expect(body.scheduledDate).toBeNull();
    });

    it("should create an uncategorized task when categoryId is null", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Uncategorized task",
          categoryId: null,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.categoryId).toBeNull();
    });

    it("should create an uncategorized task when categoryId is empty string", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Uncategorized task",
          categoryId: "",
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.categoryId).toBeNull();
    });

    it("should return 400 when name is empty", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });

      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          categoryId: category.id,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when categoryId is not a valid UUID", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test task",
          categoryId: "not-a-uuid",
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("should return 404 when categoryId does not exist", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Task with missing category",
          categoryId: "00000000-0000-0000-0000-000000000000",
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /tasks/:id", () => {
    it("should update a task", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Original",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated",
          categoryId: category.id,
          status: "in_progress",
          isNext: true,
          estimatedMinutes: 90,
          scheduledDate: "2026-05-01",
        }),
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe("Updated");
      expect(body.status).toBe("in_progress");
      expect(body.isNext).toBe(true);
      expect(body.estimatedMinutes).toBe(90);
      expect(body.scheduledDate).toBe("2026-05-01");
    });

    it("should return 404 when task does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/tasks/${nonExistentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated",
          categoryId: null,
          status: "todo",
          isNext: false,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(404);
    });

    it("should return 400 when body is invalid", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 404 when categoryId does not exist", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated",
          categoryId: "00000000-0000-0000-0000-000000000000",
          status: "todo",
          isNext: false,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "To delete",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "DELETE",
      });

      // Then
      expect(res.status).toBe(204);

      const deleted = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deleted).toBeNull();
    });

    it("should return 404 when task does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/tasks/${nonExistentId}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
    });
  });
});
