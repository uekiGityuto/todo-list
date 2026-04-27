import { z } from "zod";

// タスクの見積もり時間（user 入力）の上限。1日 = 1440分。
// 注: 実経過時間（work-record の durationMinutes 等）には適用しない。
// 経過時間は日跨ぎや長時間放置で 1440 を超えうるため、サーバ側で弾くと
// timer 完了 / リカバリーフローが詰む。
export const MAX_ESTIMATED_MINUTES = 1440;

export const taskNameSchema = z
  .string()
  .trim()
  .min(1, "タスク名を入力してください")
  .max(100, "タスク名は100文字以内で入力してください");

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "カテゴリ名を入力してください")
  .max(50, "カテゴリ名は50文字以内で入力してください");

export const categoryColorSchema = z
  .string()
  .min(1, "カラーは必須です")
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    "HEXカラーコード形式（例: #FF0000）で入力してください",
  );

export const estimatedMinutesSchema = z
  .number("見積もり時間を正しく選択してください")
  .int("見積もり時間を正しく選択してください")
  .positive("見積もり時間を正しく選択してください")
  .max(MAX_ESTIMATED_MINUTES, "見積もり時間を正しく選択してください")
  .nullable();
