import { apiClient } from "./client";
import { expectOk } from "./errors";
import {
  type CreateCategoryRequest,
  type CreateTaskRequest,
  type CreateTaskSuccess,
  type CreateTimerSessionRequest,
  type CreateTimerSessionSuccess,
  type CreateWorkRecordRequest,
  type CreateWorkRecordSuccess,
  normalizeCategory,
  normalizeTask,
  normalizeTimerSession,
  normalizeWorkRecord,
  type UpdateCategoryRequest,
  type UpdateCategorySuccess,
  type UpdateTaskRequest,
  type UpdateTaskSuccess,
} from "./types";

// 補足: ここで言う「単一ステータス」とは、Hono RPC の型定義上 handler が
// 成功 body のみを型付けしているエンドポイント（GET 系や、`errorResponse` で
// 別 status を明示していない一部の POST）のこと。実行時には auth ミドルウェアや
// validator で 401/400 が返り得るが、それらは型推論に反映されない。
//
// このケースでは `response.json()` が成功 body 型に推論されるので型アサーションは
// 不要。一方、handler が `errorResponse` で複数 status を型付けしているエンド
// ポイントは、Hono RPC が各レスポンス body を 1 つの ClientResponse にマージする
// ため `response.json()` の推論結果が `成功 body | エラー body` の union になる。
// `response.ok` での narrowing も効かないので、成功 body のみを取り出すために
// `as ...Success` で型アサーションを残す。

export async function fetchTasks() {
  const response = await apiClient.tasks.$get();
  await expectOk(response, "Failed to fetch tasks");
  const tasks = await response.json();
  return tasks.map(normalizeTask);
}

export async function createTask(input: CreateTaskRequest) {
  const response = await apiClient.tasks.$post({ json: input });
  await expectOk(response, "Failed to create task");
  return normalizeTask((await response.json()) as CreateTaskSuccess);
}

export async function updateTask(id: string, input: UpdateTaskRequest) {
  const response = await apiClient.tasks[":id"].$put({
    param: { id },
    json: input,
  });
  await expectOk(response, "Failed to update task");
  return normalizeTask((await response.json()) as UpdateTaskSuccess);
}

export async function deleteTask(id: string) {
  const response = await apiClient.tasks[":id"].$delete({
    param: { id },
  });
  await expectOk(response, "Failed to delete task");
}

export async function fetchCategories() {
  const response = await apiClient.categories.$get();
  await expectOk(response, "Failed to fetch categories");
  const categories = await response.json();
  return categories.map(normalizeCategory);
}

export async function createCategory(input: CreateCategoryRequest) {
  const response = await apiClient.categories.$post({ json: input });
  await expectOk(response, "Failed to create category");
  return normalizeCategory(await response.json());
}

export async function updateCategory(id: string, input: UpdateCategoryRequest) {
  const response = await apiClient.categories[":id"].$put({
    param: { id },
    json: input,
  });
  await expectOk(response, "Failed to update category");
  return normalizeCategory((await response.json()) as UpdateCategorySuccess);
}

export async function deleteCategory(id: string) {
  const response = await apiClient.categories[":id"].$delete({
    param: { id },
  });
  await expectOk(response, "Failed to delete category");
}

export async function fetchWorkRecords() {
  const response = await apiClient["work-records"].$get();
  await expectOk(response, "Failed to fetch work records");
  const records = await response.json();
  return records.map(normalizeWorkRecord);
}

export async function createWorkRecord(input: CreateWorkRecordRequest) {
  const response = await apiClient["work-records"].$post({ json: input });
  await expectOk(response, "Failed to create work record");
  return normalizeWorkRecord(
    (await response.json()) as CreateWorkRecordSuccess,
  );
}

export async function fetchCurrentTimerSession() {
  const response = await apiClient["timer-sessions"].$get();
  await expectOk(response, "Failed to fetch timer session");
  const session = await response.json();
  return session ? normalizeTimerSession(session) : null;
}

export async function createTimerSession(input: CreateTimerSessionRequest) {
  const response = await apiClient["timer-sessions"].$post({ json: input });
  await expectOk(response, "Failed to create timer session");
  return normalizeTimerSession(
    (await response.json()) as CreateTimerSessionSuccess,
  );
}

export async function deleteCurrentTimerSession() {
  const response = await apiClient["timer-sessions"].$delete();
  await expectOk(response, "Failed to delete timer session");
}
