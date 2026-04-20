-- DropIndex
DROP INDEX "TimerSession_singletonKey_key";

-- CreateIndex
CREATE UNIQUE INDEX "TimerSession_userId_singletonKey_key" ON "TimerSession"("userId", "singletonKey");
