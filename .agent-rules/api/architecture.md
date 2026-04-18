# API ルール

Vertical Slice 構成。機能ごとに `src/features/<slice>/` にまとめる。

## ファイル構成ルール

- 新機能は `src/features/<slice>/` に作る
- 各 slice の基本ファイルは `route.ts`, `handler.ts`, `service.ts`
- `validation.ts` は server-only validation がある場合のみ作る

## 責務の境界

- `route.ts`: Hono router 定義 + zValidator（RPC 型推論のためバリデーションはここ）
- `handler.ts`: `c.req.valid()` で validated input 取得 → service 呼び出し → response mapping
- `service.ts`: ビジネスロジック + Prisma アクセス
- `app.ts`: ルート集約 + `export type AppType = typeof routes`（RPC 用）

## Zod スキーマの配置

- HTTP 契約（request body, query params, response DTO 等）→ `packages/schema`
- server-only の compose / refine → `features/*/validation.ts`
- 同じ HTTP contract を `packages/schema` と slice 内で二重定義しない
- `schema.ts` という名前は使わない（`validation.ts` を使う）

## shared/ の配置

- `utils.ts` を作らない
- Prisma client は `shared/lib/prisma.ts` のみ
- 認証は `shared/auth/*`、HTTP 共通は `shared/http/*`
- domain logic は shared に置かない（slice 内に留める）
- shared に昇格してよいのは「2 slice 以上で使われる infra のみ」

## 禁止事項

- handler から Prisma を直接呼ばない
- handler で手動バリデーションしない（route.ts の zValidator を使う）
- Repository pattern は導入しない（3つ以上の service で同じ DB access が重複した時だけ再検討）
- `packages/schema` の HTTP contract を API 内で再定義しない

## テスト

- 純粋ビジネスロジック → 単体テスト（DB 非依存）
- DB アクセスを含む処理 → 統合テスト（Hono testClient + テスト DB）
- service が肥大化したら pure logic を slice 内の `domain.ts` に抽出し、単体テストを書く
