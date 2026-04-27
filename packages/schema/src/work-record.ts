import { z } from "zod";

const workResultEnum = z.enum(["completed", "interrupted"]);

// durationMinutes は実経過時間（クライアント側で `Date.now() - startedAt` を計算）。
// 日跨ぎ・長時間放置・recovery dialog 経由で 1440 を超えうるため、
// サーバ側で上限を弾くと timer 完了 / リカバリーフローが詰む（work-record が
// 保存できず timer session も clear されない）。よって上限は設けない。
export const createWorkRecordSchema = z.object({
  taskId: z.uuid(),
  date: z.iso.date(),
  durationMinutes: z.number().int().min(0),
  result: workResultEnum,
});

export const workRecordResponseSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  date: z.iso.date(),
  durationMinutes: z.number().int(),
  result: workResultEnum,
});

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type WorkRecordResponse = z.infer<typeof workRecordResponseSchema>;
