-- RenameEnum
ALTER TYPE "TaskStatus" RENAME TO "task_status";
ALTER TYPE "WorkResult" RENAME TO "work_result";

-- RenameTables
ALTER TABLE "Category" RENAME TO "categories";
ALTER TABLE "Task" RENAME TO "tasks";
ALTER TABLE "WorkRecord" RENAME TO "work_records";
ALTER TABLE "TimerSession" RENAME TO "timer_sessions";

-- RenameColumns: categories
ALTER TABLE "categories" RENAME COLUMN "userId" TO "user_id";

-- RenameColumns: tasks
ALTER TABLE "tasks" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "tasks" RENAME COLUMN "categoryId" TO "category_id";
ALTER TABLE "tasks" RENAME COLUMN "isNext" TO "is_next";
ALTER TABLE "tasks" RENAME COLUMN "estimatedMinutes" TO "estimated_minutes";
ALTER TABLE "tasks" RENAME COLUMN "scheduledDate" TO "scheduled_date";
ALTER TABLE "tasks" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "tasks" RENAME COLUMN "updatedAt" TO "updated_at";

-- RenameColumns: work_records
ALTER TABLE "work_records" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "work_records" RENAME COLUMN "taskId" TO "task_id";
ALTER TABLE "work_records" RENAME COLUMN "durationMinutes" TO "duration_minutes";

-- RenameColumns: timer_sessions
ALTER TABLE "timer_sessions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "timer_sessions" RENAME COLUMN "singletonKey" TO "singleton_key";
ALTER TABLE "timer_sessions" RENAME COLUMN "taskId" TO "task_id";
ALTER TABLE "timer_sessions" RENAME COLUMN "taskName" TO "task_name";
ALTER TABLE "timer_sessions" RENAME COLUMN "categoryName" TO "category_name";
ALTER TABLE "timer_sessions" RENAME COLUMN "estimatedMinutes" TO "estimated_minutes";
ALTER TABLE "timer_sessions" RENAME COLUMN "startedAt" TO "started_at";
