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

// 補足:
// 単一ステータスのみを返すエンドポイント（GET 系や、エラー分岐を持たない一部の POST）
// では、`response.json()` が成功 body の型に推論されるので型アサーションは不要。
// 一方、`errorResponse` などで複数ステータスを返すエンドポイントは、Hono RPC の型が
// 全レスポンス body を 1 つの ClientResponse にマージするため `response.json()` の
// 推論結果が `成功 body | エラー body` の union になる。`response.ok` での narrowing は
// 効かないので、成功 body のみを取り出すために `as ...Success` で型アサーションを残す。

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
