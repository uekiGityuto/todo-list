import type { ApiErrorCode, ApiErrorResponse } from "@todo-list/schema";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: "認証が必要です",
  FORBIDDEN: "この操作は許可されていません",
  TASK_NOT_FOUND: "タスクが見つかりません",
  CATEGORY_NOT_FOUND: "カテゴリが見つかりません",
  CATEGORY_IN_USE:
    "カテゴリが使用中のため削除できません。もう一度お試しください",
  NOT_FOUND: "リクエストされたリソースが見つかりません",
  ACTIVE_SESSION_EXISTS: "タイマーセッションが既に存在します",
  VALIDATION_ERROR: "入力内容に誤りがあります",
  INVALID_JSON: "リクエストの形式が正しくありません",
  BAD_REQUEST: "リクエストを処理できませんでした",
  INTERNAL_SERVER_ERROR: "サーバーエラーが発生しました",
};

export function errorResponse<S extends ContentfulStatusCode>(
  c: Context,
  status: S,
  code: ApiErrorCode,
  extra?: { errors?: ApiErrorResponse["errors"] },
) {
  const body: ApiErrorResponse = {
    code,
    message: ERROR_MESSAGES[code],
    requestId: c.get("requestId"),
    ...extra,
  };
  return c.json(body, status);
}
