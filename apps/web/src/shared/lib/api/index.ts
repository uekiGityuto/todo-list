import { apiClient } from "./client";
import { expectOk } from "./errors";
import {
  type CategoriesResponse,
  type CreateCategoryRequest,
  type CreateCategorySuccess,
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
  type TasksResponse,
  type TimerSessionResponse,
  type UpdateCategoryRequest,
  type UpdateCategorySuccess,
  type UpdateTaskRequest,
  type UpdateTaskSuccess,
  type WorkRecordsResponse,
} from "./types";

export async function fetchTasks() {
  const response = await apiClient.tasks.$get();
  await expectOk(response, "Failed to fetch tasks");
  const tasks = (await response.json()) as TasksResponse;
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
  const categories = (await response.json()) as CategoriesResponse;
  return categories.map(normalizeCategory);
}

export async function createCategory(input: CreateCategoryRequest) {
  const response = await apiClient.categories.$post({ json: input });
  await expectOk(response, "Failed to create category");
  return normalizeCategory((await response.json()) as CreateCategorySuccess);
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
  const records = (await response.json()) as WorkRecordsResponse;
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
  const session = (await response.json()) as TimerSessionResponse;
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
