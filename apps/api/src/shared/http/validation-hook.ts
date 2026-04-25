import type { ApiFieldError } from "@todo-list/schema";
import { errorResponse } from "./error-response";

function toFieldErrors(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): ApiFieldError[] {
  return issues.map((issue) => ({
    field: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

// Hono RPC の型推論にエラーレスポンス型が漏れるのを防ぐため返り値を void に宣言
// 実行時は Response を返し、zValidator がリクエストを短絡する
// biome-ignore lint/suspicious/noConfusingVoidType: Hono RPC 型推論のために必要
export const validationHook: (
  result: {
    success: boolean;
    error?: {
      issues: readonly { path: readonly PropertyKey[]; message: string }[];
    };
  },
  c: Parameters<typeof errorResponse>[0],
) => void = (result, c) => {
  if (!result.success && result.error) {
    const errors = toFieldErrors(result.error.issues);
    return errorResponse(c, 400, "VALIDATION_ERROR", { errors }) as never;
  }
};
