import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getSession } from "../../../__tests__/helpers/auth";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

describe("タスク API", () => {
  beforeEach(async () => {
    await cleanDatabase();
    getSession.mockClear();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /tasks", () => {
    it("タスクが存在しない場合、空配列を返す", async () => {
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("すべてのタスクを返す", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      await prisma.task.create({
        data: {
          name: "Task 1",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
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
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer test-token" },
      });

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
    it("全フィールド指定でタスクを作成する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });

      // When
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("オプションフィールドが null でタスクを作成する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });

      // When
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("categoryId が null の場合、未分類タスクを作成する", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("categoryId が空文字の場合、未分類タスクを作成する", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("name が空の場合、400 を返す", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });

      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "",
          categoryId: category.id,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("scheduledDate が不正な日付形式の場合、400 を返す", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Test task",
          categoryId: null,
          estimatedMinutes: null,
          scheduledDate: "2026/04/20",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("categoryId が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Test task",
          categoryId: "not-a-uuid",
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("必須フィールドが不足している場合、400 を返す", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("categoryId が存在しない場合、404 を返す", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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
    it("タスクを更新する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Original",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("タスクが存在しない場合、404 を返す", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/tasks/${nonExistentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("リクエストボディが無効な場合、400 を返す", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ name: "" }),
      });

      expect(res.status).toBe(400);
    });

    it("categoryId が存在しない場合、404 を返す", async () => {
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
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

    it("タスク ID が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/tasks/not-a-uuid", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Updated",
          categoryId: null,
          status: "todo",
          isNext: false,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("タスクを削除する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "To delete",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(204);

      const deleted = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deleted).toBeNull();
    });

    it("タスクが存在しない場合、404 を返す", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/tasks/${nonExistentId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(404);
    });

    it("タスク ID が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/tasks/not-a-uuid", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(400);
    });
  });

  describe("ユーザー隔離", () => {
    it("別ユーザーのタスクは一覧に含まれない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      await prisma.task.create({
        data: {
          name: "Other user task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "other-user-id",
        },
      });

      // When
      const res = await app.request("/tasks", {
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("別ユーザーのカテゴリでタスクを作成できない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });

      // When
      const res = await app.request("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Task",
          categoryId: category.id,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      // Then
      expect(res.status).toBe(404);
    });

    it("別ユーザーのタスクは更新できない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Other user task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "other-user-id",
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Updated",
          categoryId: null,
          status: "todo",
          isNext: false,
          estimatedMinutes: null,
          scheduledDate: null,
        }),
      });

      // Then
      expect(res.status).toBe(404);
    });

    it("タスク削除時に別ユーザーの作業記録は影響を受けない", async () => {
      // Given: 自分のタスクと別ユーザーのタスク・作業記録を作成
      const myCategory = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const myTask = await prisma.task.create({
        data: {
          name: "My task",
          categoryId: myCategory.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });
      const otherCategory = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const otherTask = await prisma.task.create({
        data: {
          name: "Other user task",
          categoryId: otherCategory.id,
          status: "todo",
          isNext: false,
          userId: "other-user-id",
        },
      });
      const otherWorkRecord = await prisma.workRecord.create({
        data: {
          taskId: otherTask.id,
          date: "2026-04-19",
          durationMinutes: 30,
          result: "completed",
          userId: "other-user-id",
        },
      });

      // When: 自分のタスクを削除
      const res = await app.request(`/tasks/${myTask.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then: 別ユーザーの作業記録は残っている
      expect(res.status).toBe(204);
      const record = await prisma.workRecord.findUnique({
        where: { id: otherWorkRecord.id },
      });
      expect(record).not.toBeNull();
    });

    it("別ユーザーのタスクは削除できない", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "other-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Other user task",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "other-user-id",
        },
      });

      // When
      const res = await app.request(`/tasks/${task.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(404);

      // タスクが削除されていないことを確認
      const existing = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(existing).not.toBeNull();
    });
  });
});
