-- AlterTable
ALTER TABLE "categories" RENAME CONSTRAINT "Category_pkey" TO "categories_pkey";

-- AlterTable
ALTER TABLE "tasks" RENAME CONSTRAINT "Task_pkey" TO "tasks_pkey";

-- AlterTable
ALTER TABLE "timer_sessions" RENAME CONSTRAINT "TimerSession_pkey" TO "timer_sessions_pkey";

-- AlterTable
ALTER TABLE "work_records" RENAME CONSTRAINT "WorkRecord_pkey" TO "work_records_pkey";

-- RenameForeignKey
ALTER TABLE "tasks" RENAME CONSTRAINT "Task_categoryId_userId_fkey" TO "tasks_category_id_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "timer_sessions" RENAME CONSTRAINT "TimerSession_taskId_userId_fkey" TO "timer_sessions_task_id_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "work_records" RENAME CONSTRAINT "WorkRecord_taskId_userId_fkey" TO "work_records_task_id_user_id_fkey";

-- RenameIndex
ALTER INDEX "Category_id_userId_key" RENAME TO "categories_id_user_id_key";

-- RenameIndex
ALTER INDEX "Task_id_userId_key" RENAME TO "tasks_id_user_id_key";

-- RenameIndex
ALTER INDEX "TimerSession_userId_singletonKey_key" RENAME TO "timer_sessions_user_id_singleton_key_key";
