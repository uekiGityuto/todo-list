-- ログイン失敗回数ベースのアカウントロック用カラムを追加
ALTER TABLE "user"
  ADD COLUMN "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "last_failed_login_at" TIMESTAMP(3),
  ADD COLUMN "locked_until" TIMESTAMP(3);
