import { z } from "zod";

// 1日 = 1440分。実用的なタスク見積もり・作業記録の上限として採用
export const MAX_DURATION_MINUTES = 1440;

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
  .max(MAX_DURATION_MINUTES, "見積もり時間を正しく選択してください")
  .nullable();
