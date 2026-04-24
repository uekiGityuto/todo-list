import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase, prisma } from "../../../__tests__/helpers/db";
import app from "../../../app";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: "test-user-id" },
  }),
}));

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer test-token",
};

describe("Idempotency middleware", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("should allow first request with Idempotency-Key", async () => {
    const res = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ name: "Test", color: "#000000" }),
    });

    expect(res.status).toBe(201);
  });

  it("should reject duplicate request with same Idempotency-Key", async () => {
    const key = crypto.randomUUID();

    const first = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": key },
      body: JSON.stringify({ name: "Test", color: "#000000" }),
    });
    expect(first.status).toBe(201);

    const second = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": key },
      body: JSON.stringify({ name: "Test", color: "#000000" }),
    });
    expect(second.status).toBe(409);
  });

  it("should allow requests with different Idempotency-Keys", async () => {
    const first = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ name: "Test1", color: "#000000" }),
    });
    expect(first.status).toBe(201);

    const second = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ name: "Test2", color: "#000000" }),
    });
    expect(second.status).toBe(201);
  });

  it("should allow request without Idempotency-Key header", async () => {
    const res = await app.request("/categories", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "Test", color: "#000000" }),
    });

    expect(res.status).toBe(201);
  });

  it("should allow retry with same key after failed request", async () => {
    const key = crypto.randomUUID();

    // バリデーションエラー（400）でキーが消費されないことを確認
    const failed = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": key },
      body: JSON.stringify({ name: "", color: "#000000" }),
    });
    expect(failed.status).toBe(400);

    // 同じキーで正しいリクエストをリトライ
    const retry = await app.request("/categories", {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": key },
      body: JSON.stringify({ name: "Test", color: "#000000" }),
    });
    expect(retry.status).toBe(201);
  });

  it("should not apply to GET requests", async () => {
    const key = crypto.randomUUID();

    const first = await app.request("/categories", {
      headers: { ...headers, "Idempotency-Key": key },
    });
    expect(first.status).toBe(200);

    const second = await app.request("/categories", {
      headers: { ...headers, "Idempotency-Key": key },
    });
    expect(second.status).toBe(200);
  });
});
