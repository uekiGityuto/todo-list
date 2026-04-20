import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: "test-user-id" },
  }),
}));

describe("Timer Sessions API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /timer-sessions", () => {
    it("should return null when no active session exists", async () => {
      const res = await app.request("/timer-sessions", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toBeNull();
    });

    it("should return the active session", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "test-user-id",
        },
      });
      await prisma.timerSession.create({
        data: {
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).not.toBeNull();
      expect(body.taskId).toBe(task.id);
      expect(body.taskName).toBe("Timer task");
      expect(body.categoryName).toBe("Work");
      expect(body.estimatedMinutes).toBe(25);
      expect(body.id).toBeDefined();
      expect(body.startedAt).toBeDefined();
    });
  });

  describe("POST /timer-sessions", () => {
    it("should create a new timer session", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.taskId).toBe(task.id);
      expect(body.taskName).toBe("Timer task");
      expect(body.categoryName).toBe("Work");
      expect(body.estimatedMinutes).toBe(25);
      expect(body.id).toBeDefined();
      expect(body.startedAt).toBeDefined();
    });

    it("should return 409 when an active session already exists", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "test-user-id",
        },
      });
      await prisma.timerSession.create({
        data: {
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: task.id,
          taskName: "Another session",
          categoryName: "Work",
          estimatedMinutes: 30,
        }),
      });

      // Then
      expect(res.status).toBe(409);
    });

    it("should allow creating a session with empty categoryName", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "",
          estimatedMinutes: 25,
        }),
      });

      // Then
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.categoryName).toBe("");
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when estimatedMinutes is not positive", async () => {
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          taskName: "Task",
          categoryName: "Work",
          estimatedMinutes: 0,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 404 when task does not exist", async () => {
      const res = await app.request("/timer-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          taskId: "00000000-0000-0000-0000-000000000000",
          taskName: "Task",
          categoryName: "Work",
          estimatedMinutes: 25,
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /timer-sessions", () => {
    it("should delete the active session", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "test-user-id",
        },
      });
      await prisma.timerSession.create({
        data: {
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(204);

      const sessions = await prisma.timerSession.findMany();
      expect(sessions).toHaveLength(0);
    });

    it("should return 204 even when no session exists", async () => {
      const res = await app.request("/timer-sessions", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(204);
    });
  });
});
