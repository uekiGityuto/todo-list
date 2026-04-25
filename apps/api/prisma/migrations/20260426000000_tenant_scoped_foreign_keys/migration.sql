-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "WorkRecord" DROP CONSTRAINT "WorkRecord_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TimerSession" DROP CONSTRAINT "TimerSession_taskId_fkey";

-- RepairData: 不整合行を退避テーブルに移動してから修復する

-- 退避テーブル作成
CREATE TABLE IF NOT EXISTS "_quarantine_WorkRecord" (LIKE "WorkRecord" INCLUDING ALL);
CREATE TABLE IF NOT EXISTS "_quarantine_TimerSession" (LIKE "TimerSession" INCLUDING ALL);

-- WorkRecord: userId が Task と一致しない行を退避
INSERT INTO "_quarantine_WorkRecord"
SELECT wr.* FROM "WorkRecord" wr
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = wr."taskId" AND t."userId" = wr."userId"
);
DELETE FROM "WorkRecord" wr
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = wr."taskId" AND t."userId" = wr."userId"
);

-- TimerSession: userId が Task と一致しない行を退避
INSERT INTO "_quarantine_TimerSession"
SELECT ts.* FROM "TimerSession" ts
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = ts."taskId" AND t."userId" = ts."userId"
);
DELETE FROM "TimerSession" ts
WHERE NOT EXISTS (
  SELECT 1 FROM "Task" t
  WHERE t."id" = ts."taskId" AND t."userId" = ts."userId"
);

-- Task: categoryId が別ユーザーの Category を参照している場合は null にする（データ損失なし）
UPDATE "Task" t SET "categoryId" = NULL
WHERE t."categoryId" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."id" = t."categoryId" AND c."userId" = t."userId"
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
