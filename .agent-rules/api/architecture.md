---
paths:
  - "apps/api/src/**/*.ts"
---

# API ルール

Vertical Slice 構成。機能ごとに `src/features/<slice>/` にまとめる。

## ファイル構成ルール

- 新機能は `src/features/<slice>/` に作る
- 各 slice の基本ファイルは `route.ts`, `service.ts`
- `validation.ts` は server-only validation がある場合のみ作る

## 責務の境界

- `route.ts`: Hono route 定義、`zValidator`、`c.req.valid()`、response mapping
- `service.ts`: ビジネスロジック + Prisma アクセス
- `app.ts`: ルート集約 + `export type AppType = typeof app`（RPC 用）

## Hono ベストプラクティス

- Hono の handler は原則 `route.ts` に直接書く
- `route.ts` と handler を分離した controller 構成は基本採用しない
- 理由: Hono の型推論は route 定義の近くで最も強く働き、`c.req.param()`、`c.req.valid()`、RPC 用 `AppType` が自然につながるため
- handler を分ける必要が本当にある場合は、素の `Context<...>` を手で書き足すより `hono/factory` を優先して検討する
- `Context` の generic を手で補うための独自ユーティリティ型は基本作らない

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

- route.ts で手動バリデーションしない（`zValidator` を使う）
- `handler.ts` を前提にした controller 分離を新規導入しない
- Repository pattern は導入しない（3つ以上の service で同じ DB access が重複した時だけ再検討）
- `packages/schema` の HTTP contract を API 内で再定義しない