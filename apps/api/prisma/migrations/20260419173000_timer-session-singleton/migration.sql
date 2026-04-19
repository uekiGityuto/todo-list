ALTER TABLE "TimerSession"
ADD COLUMN "singletonKey" TEXT NOT NULL DEFAULT 'active';

CREATE UNIQUE INDEX "TimerSession_singletonKey_key" ON "TimerSession"("singletonKey");
