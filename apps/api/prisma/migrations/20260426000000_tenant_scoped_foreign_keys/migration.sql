-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "WorkRecord" DROP CONSTRAINT "WorkRecord_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TimerSession" DROP CONSTRAINT "TimerSession_taskId_fkey";

-- RepairData: Task の categoryId が別ユーザーの Category を参照している場合は null にする
UPDATE "Task" t SET "categoryId" = NULL
WHERE t."categoryId" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."id" = t."categoryId" AND c."userId" = t."userId"
);

-- RepairData: WorkRecord の taskId が別ユーザーの Task を参照している場合は削除
DELETE FROM "WorkRecord" wr
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = wr."taskId" AND t."userId" = wr."userId"
);

-- RepairData: TimerSession の taskId が別ユーザーの Task を参照している場合は削除
DELETE FROM "TimerSession" ts
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = ts."taskId" AND t."userId" = ts."userId"
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_userId_key" ON "Category"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_userId_key" ON "Task"("id", "userId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_userId_fkey" FOREIGN KEY ("categoryId", "userId") REFERENCES "Category"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRecord" ADD CONSTRAINT "WorkRecord_taskId_userId_fkey" FOREIGN KEY ("taskId", "userId") REFERENCES "Task"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimerSession" ADD CONSTRAINT "TimerSession_taskId_userId_fkey" FOREIGN KEY ("taskId", "userId") REFERENCES "Task"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
