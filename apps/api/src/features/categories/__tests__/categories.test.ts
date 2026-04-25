import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: "test-user-id" },
  }),
}));

describe("カテゴリ API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /categories", () => {
    it("カテゴリが存在しない場合、空配列を返す", async () => {
      const res = await app.request("/categories", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("すべてのカテゴリを返す", async () => {
      // Given
      await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      await prisma.category.create({
        data: { name: "Personal", color: "#00FF00", userId: "test-user-id" },
      });

      // When
      const res = await app.request("/categories", {
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("name");
      expect(body[0]).toHaveProperty("color");
    });

    it("localhost オリジンに CORS ヘッダーを含める", async () => {
      const res = await app.request("/categories", {
        headers: {
          Origin: "http://localhost:3000",
          Authorization: "Bearer test-token",
        },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
    });
  });

  describe("OPTIONS /categories", () => {
    it("プリフライトリクエストを処理する", async () => {
      const res = await app.request("/categories", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
          Authorization: "Bearer test-token",
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
      expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
        "Content-Type",
      );
    });
  });

  describe("POST /categories", () => {
    it("有効な入力でカテゴリを作成する", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Work",
          color: "#0000FF",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe("Work");
      expect(body.color).toBe("#0000FF");
      expect(body.id).toBeDefined();
    });

    it("name が空の場合、400 を返す", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "",
          color: "#0000FF",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("color が不正な形式の場合、400 を返す", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Work",
          color: "red",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("必須フィールドが不足している場合、400 を返す", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /categories/:id", () => {
    it("カテゴリを更新する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Updated Work",
          color: "#FF0000",
        }),
      });

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe("Updated Work");
      expect(body.color).toBe("#FF0000");
    });

    it("カテゴリが存在しない場合、404 を返す", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/categories/${nonExistentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Updated",
          color: "#FF0000",
        }),
      });

      expect(res.status).toBe(404);
    });

    it("カテゴリ ID が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/categories/not-a-uuid", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Updated",
          color: "#FF0000",
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /categories/:id", () => {
    it("カテゴリを削除する", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(204);

      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });

    it("カテゴリ削除時に関連タスクの categoryId を null にする", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF", userId: "test-user-id" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task with category",
          categoryId: category.id,
          status: "todo",
          isNext: false,
          userId: "test-user-id",
        },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      // Then
      expect(res.status).toBe(204);

      const updatedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.categoryId).toBeNull();
    });

    it("カテゴリが存在しない場合、404 を返す", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/categories/${nonExistentId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(404);
    });

    it("カテゴリ ID が有効な UUID でない場合、400 を返す", async () => {
      const res = await app.request("/categories/not-a-uuid", {
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      });

      expect(res.status).toBe(400);
    });
  });
});
