---
paths:
  - "apps/api/prisma/schema.prisma"
  - "apps/api/prisma/migrations/**"
---

# Prisma スキーマルール

## テナント隔離（複合FK）

全テーブルに `userId` カラムがあり、テナント隔離を DB レベルで強制している。

新しいテーブルやリレーションを追加する際は以下を守ること:

- 親テーブルに `@@unique([id, userId])` を付ける
- 子テーブルの FK は `(外部キー, userId)` の複合で親の `(id, userId)` を参照する
- `onDelete` は用途に応じて `Cascade` または `Restrict` を選ぶ（`SetNull` は複合FK では使わない）

```prisma
// 例: WorkRecord → Task
task Task @relation(fields: [taskId, userId], references: [id, userId], onDelete: Cascade)
```

## マイグレーション

- FK 制約を追加・変更するマイグレーションでは、既存データの不整合を事前に検出するステップを入れる
- 不整合がある場合はマイグレーションを中断し、手動対応を要求する（暗黙のデータ削除をしない）
