---
paths:
  - "apps/api/src/features/*/route.ts"
---

# API エラーハンドリングルール

エラーレスポンスを `{ code, message, requestId }` の統一形式で返すためのルール。
フロントは `code` で分岐、`message` でトースト表示する前提。

## エラーレスポンス

- エラーレスポンスは `errorResponse(c, status, code)` で返す
- `c.json({ error: "..." })` で直接返さない

## zValidator

- `zValidator` には `validationHook` を第3引数に渡す
- `zValidator("json", schema, validationHook)`
- hook なしだと Zod のエラー構造がそのまま返り、統一形式にならない
