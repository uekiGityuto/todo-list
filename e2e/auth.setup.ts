import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const AUTH_DIR = path.join(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");
const TEST_EMAIL = "agent@example.com";
const TEST_PASSWORD = "agent001";
const API_BASE_URL = process.env.API_URL ?? "http://127.0.0.1:3001";
const WEB_ORIGIN = "http://127.0.0.1:3100";

function buildStorageStateFromSetCookie(setCookie: string) {
  const [cookiePart, ...attributeParts] = setCookie.split(";");
  const [name, ...valueParts] = cookiePart.split("=");
  const value = valueParts.join("=");

  let maxAge = 60 * 60 * 24 * 7;
  let path = "/";
  let httpOnly = false;
  let secure = false;
  let sameSite: "Lax" | "Strict" | "None" = "Lax";

  for (const part of attributeParts) {
    const trimmed = part.trim();
    const [attributeName, attributeValue] = trimmed.split("=");

    if (attributeName.toLowerCase() === "max-age" && attributeValue) {
      maxAge = Number(attributeValue);
    }
    if (attributeName.toLowerCase() === "path" && attributeValue) {
      path = attributeValue;
    }
    if (attributeName.toLowerCase() === "httponly") {
      httpOnly = true;
    }
    if (attributeName.toLowerCase() === "secure") {
      secure = true;
    }
    if (attributeName.toLowerCase() === "samesite" && attributeValue) {
      sameSite = attributeValue as typeof sameSite;
    }
  }

  return {
    cookies: [
      {
        name,
        value,
        domain: "127.0.0.1",
        path,
        expires: Math.floor(Date.now() / 1000) + maxAge,
        httpOnly,
        secure,
        sameSite,
      },
    ],
    origins: [],
  };
}

async function signInByApi(request: Parameters<typeof test>[0]["request"]) {
  return request.post(`${API_BASE_URL}/api/auth/sign-in/email`, {
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
    headers: {
      Origin: WEB_ORIGIN,
    },
  });
}

async function signUpByApi(request: Parameters<typeof test>[0]["request"]) {
  return request.post(`${API_BASE_URL}/api/auth/sign-up/email`, {
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: "agent",
    },
    headers: {
      Origin: WEB_ORIGIN,
    },
  });
}

test("認証済み状態を作成する", async ({ request }) => {
  await fs.mkdir(AUTH_DIR, { recursive: true });

  let signInResponse = await signInByApi(request);

  if (!signInResponse.ok()) {
    const signUpResponse = await signUpByApi(request);
    const signUpBody = await signUpResponse.text();

    if (!signUpResponse.ok()) {
      throw new Error(
        `E2E auth setup failed for ${TEST_EMAIL}: signup did not complete. ` +
          `Status: ${signUpResponse.status()}. Body: ${signUpBody}`,
      );
    }

    signInResponse = await signInByApi(request);
  }

  expect(signInResponse.ok()).toBeTruthy();
  const setCookie = signInResponse.headers()["set-cookie"];
  if (!setCookie) {
    throw new Error(
      "E2E auth setup failed: sign-in response did not set a cookie.",
    );
  }

  await fs.writeFile(
    AUTH_FILE,
    JSON.stringify(buildStorageStateFromSetCookie(setCookie), null, 2),
    "utf-8",
  );
});
