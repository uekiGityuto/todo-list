import type { AppType } from "@todo-list/api/client";
import type { InferRequestType, InferResponseType } from "hono/client";
import { hc } from "hono/client";

import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";

const contractClient = hc<AppType>("http://localhost");

export type TasksResponse = InferResponseType<
  typeof contractClient.tasks.$get,
  200
>;
export type TaskResponse = TasksResponse[number];
export type CreateTaskSuccess = InferResponseType<
  typeof contractClient.tasks.$post,
  201
>;
export type UpdateTaskSuccess = InferResponseType<
  (typeof contractClient.tasks)[":id"]["$put"],
  200
>;
export type CategoriesResponse = InferResponseType<
  typeof contractClient.categories.$get,
  200
>;
export type CategoryResponse = CategoriesResponse[number];
export type CreateCategorySuccess = InferResponseType<
  typeof contractClient.categories.$post,
  201
>;
export type UpdateCategorySuccess = InferResponseType<
  (typeof contractClient.categories)[":id"]["$put"],
  200
>;
export type WorkRecordsResponse = InferResponseType<
  (typeof contractClient)["work-records"]["$get"],
  200
>;
export type WorkRecordResponse = WorkRecordsResponse[number];
export type CreateWorkRecordSuccess = InferResponseType<
  (typeof contractClient)["work-records"]["$post"],
  201
>;
export type TimerSessionResponse = InferResponseType<
  (typeof contractClient)["timer-sessions"]["$get"],
  200
>;
export type CreateTimerSessionSuccess = InferResponseType<
  (typeof contractClient)["timer-sessions"]["$post"],
  201
>;

export type CreateTaskRequest = InferRequestType<
  typeof contractClient.tasks.$post
>["json"];
export type UpdateTaskRequest = InferRequestType<
  (typeof contractClient.tasks)[":id"]["$put"]
>["json"];
export type CreateCategoryRequest = InferRequestType<
  typeof contractClient.categories.$post
>["json"];
export type UpdateCategoryRequest = InferRequestType<
  (typeof contractClient.categories)[":id"]["$put"]
>["json"];
export type CreateWorkRecordRequest = InferRequestType<
  (typeof contractClient)["work-records"]["$post"]
>["json"];
export type CreateTimerSessionRequest = InferRequestType<
  (typeof contractClient)["timer-sessions"]["$post"]
>["json"];

export function normalizeTask(task: TaskResponse): Task {
  return {
    ...task,
    categoryId: task.categoryId ?? "",
  };
}

export function normalizeCategory(category: CategoryResponse): Category {
  return category;
}

export function normalizeWorkRecord(record: WorkRecordResponse): WorkRecord {
  return record;
}

export function normalizeTimerSession(
  session: Exclude<TimerSessionResponse, null>,
): TimerSession {
  return {
    taskId: session.taskId,
    taskName: session.taskName,
    categoryName: session.categoryName,
    estimatedMinutes: session.estimatedMinutes,
    startedAt: session.startedAt,
  };
}
