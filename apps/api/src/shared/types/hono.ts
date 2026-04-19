/**
 * Hono の Context 型にバリデーション済み JSON ボディの型情報を付与するユーティリティ型。
 * handler.ts で Context<Env, string, ValidatedJsonInput<T>> として使用する。
 */
export type ValidatedJsonInput<T> = { in: { json: T }; out: { json: T } };
