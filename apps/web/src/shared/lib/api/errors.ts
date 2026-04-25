import type { ApiErrorResponse } from "@todo-list/schema";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get errorMessage(): string {
    if (this.body && typeof this.body === "object" && "message" in this.body) {
      return (this.body as ApiErrorResponse).message;
    }
    return "エラーが発生しました";
  }
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function expectOk(
  response: Response,
  message: string,
): Promise<Response> {
  if (response.ok) {
    return response;
  }

  throw new ApiError(
    message,
    response.status,
    await readResponseBody(response),
  );
}
