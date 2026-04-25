-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "WorkRecord" DROP CONSTRAINT "WorkRecord_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TimerSession" DROP CONSTRAINT "TimerSession_taskId_fkey";

-- RepairData: クロステナント不整合の検出と修復

-- WorkRecord / TimerSession に不整合行があればマイグレーションを中断する
-- （データ削除を伴うため、手動確認を要求する）
DO $$
DECLARE
  wr_count INTEGER;
  ts_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO wr_count FROM "WorkRecord" wr
  WHERE NOT EXISTS (
    SELECT 1 FROM "Task" t WHERE t."id" = wr."taskId" AND t."userId" = wr."userId"
  );

  SELECT COUNT(*) INTO ts_count FROM "TimerSession" ts
  WHERE NOT EXISTS (
    SELECT 1 FROM "Task" t WHERE t."id" = ts."taskId" AND t."userId" = ts."userId"
  );

  IF wr_count > 0 OR ts_count > 0 THEN
    RAISE EXCEPTION 'Cross-tenant data detected: % WorkRecord(s), % TimerSession(s). Manual remediation required before applying this migration.', wr_count, ts_count;
  END IF;
END $$;

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
