import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getSession } from "../../../__tests__/helpers/auth";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

describe("タイマーセッション API", () => {
  beforeEach(async () => {
    await cleanDatabase();
    getSession.mockClear();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /timer-sessions", () => {
    it("アクティブなセッションがない場合、null を返す", async () => {
      const res = await app.request("/timer-sessions", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toBeNull();
    });

    it("アクティブなセッションを返す", async () => {
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
    it("新しいタイマーセッションを作成する", async () => {
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

    it("アクティブなセッションが既に存在する場合、409 を返す", async () => {
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

    it("空の categoryName でセッションを作成できる", async () => {
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

    it("必須フィールドが不足している場合、400 を返す", async () => {
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

    it("estimatedMinutes が正の数でない場合、400 を返す", async () => {
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

    it("タスクが存在しない場合、404 を返す", async () => {
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
    it("アクティブなセッションを削除する", async () => {
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

    it("セッションが存在しない場合でも 204 を返す", async () => {
      const res = await app.request("/timer-sessions", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(204);
    });
  });

  describe("ユーザー隔離", () => {
    it("別ユーザーのセッションは取得できない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "other-user-id",
        },
      });
      await prisma.timerSession.create({
        data: {
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
          userId: "other-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toBeNull();
    });

    it("別ユーザーのタスクでセッションを作成できない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "other-user-id",
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
      expect(res.status).toBe(404);
    });

    it("別ユーザーのセッションは削除されない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Timer task",
          categoryId: category.id,
          status: "in_progress",
          isNext: false,
          userId: "other-user-id",
        },
      });
      await prisma.timerSession.create({
        data: {
          taskId: task.id,
          taskName: "Timer task",
          categoryName: "Work",
          estimatedMinutes: 25,
          userId: "other-user-id",
        },
      });

      // When
      const res = await app.request("/timer-sessions", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(204);

      // 別ユーザーのセッションが削除されていないことを確認
      const sessions = await prisma.timerSession.findMany({
        where: { userId: "other-user-id" },
      });
      expect(sessions).toHaveLength(1);
    });
  });
});
