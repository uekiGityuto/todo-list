import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

describe("Categories API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /categories", () => {
    it("should return empty array when no categories exist", async () => {
      const res = await app.request("/categories");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("should return all categories", async () => {
      // Given
      await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      await prisma.category.create({
        data: { name: "Personal", color: "#00FF00" },
      });

      // When
      const res = await app.request("/categories");

      // Then
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("name");
      expect(body[0]).toHaveProperty("color");
    });
  });

  describe("POST /categories", () => {
    it("should create a category with valid input", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    it("should return 400 when name is empty", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          color: "#0000FF",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /categories/:id", () => {
    it("should update a category", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

    it("should return 404 when category does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/categories/${nonExistentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated",
          color: "#FF0000",
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /categories/:id", () => {
    it("should delete a category", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "DELETE",
      });

      // Then
      expect(res.status).toBe(204);

      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });

    it("should set related tasks categoryId to null when category is deleted", async () => {
      // Given
      const category = await prisma.category.create({
        data: { name: "Work", color: "#0000FF" },
      });
      const task = await prisma.task.create({
        data: {
          name: "Task with category",
          categoryId: category.id,
          status: "todo",
          isNext: false,
        },
      });

      // When
      const res = await app.request(`/categories/${category.id}`, {
        method: "DELETE",
      });

      // Then
      expect(res.status).toBe(204);

      const updatedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.categoryId).toBeNull();
    });

    it("should return 404 when category does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await app.request(`/categories/${nonExistentId}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
    });
  });
});
