# アーキテクチャ: Vertical Slice（API）

Hono + Prisma による API サーバー。機能（use case）ごとに垂直に切る構成。

## ディレクトリ構成

```
apps/api/src/
  app.ts                    # Hono アプリケーションのエントリポイント
  features/
    tasks/
      route.ts              # Hono router 定義のみ
      handler.ts            # 薄い HTTP 層
      service.ts            # ビジネスロジック + Prisma アクセス
      validation.ts         # server-only validation（必要な時だけ）
    categories/
    work-records/
    timer-sessions/
    auth/
  shared/
    lib/
      prisma.ts             # Prisma client singleton
      env.ts                # 環境変数
    auth/
      middleware.ts          # 認証ミドルウェア
      session.ts             # セッション管理
    http/
      errors.ts              # エラー型定義
      error-handler.ts       # グローバルエラーハンドラ
      response.ts            # レスポンスヘルパー
```

## 各ファイルの責務

### route.ts

Hono の router 定義 + zValidator によるバリデーション。RPC の型推論のためバリデーションはここに書く。

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema, updateTaskSchema } from "@todo-list/schema";
import { list, create, update, remove } from "./handler";

export const tasksRoute = new Hono()
  .get("/", list)
  .post("/", zValidator("json", createTaskSchema), create)
  .put("/:id", zValidator("json", updateTaskSchema), update)
  .delete("/:id", remove);
```

### app.ts

ルートを集約し、RPC 用の型をエクスポートする。

```typescript
import { Hono } from "hono";
import { tasksRoute } from "./features/tasks/route";
import { categoriesRoute } from "./features/categories/route";

const app = new Hono();

const routes = app
  .route("/tasks", tasksRoute)
  .route("/categories", categoriesRoute);

export default app;
export type AppType = typeof routes;
```

> RPC の型推論をモノレポで動かすには、web と api の両方の `tsconfig.json` で `"strict": true` が必須。

### handler.ts

薄い HTTP 層。以下だけを行う:
- validated input の取得（`c.req.valid()` — route.ts の zValidator で検証済み）
- auth context 取得
- service 呼び出し
- response mapping

```typescript
// ✅ handler.ts — validated input を受け取る
export const create = async (c) => {
  const input = c.req.valid("json"); // zValidator で検証済み、型付き
  const userId = c.get("userId");
  const task = await taskService.create(userId, input);
  return c.json(task, 201);
};

// ❌ handler.ts に Prisma を書かない
export const create = async (c) => {
  const task = await prisma.task.create({ ... }); // NG
};

// ❌ handler.ts で手動バリデーションしない（route.ts の zValidator を使う）
export const create = async (c) => {
  const body = await c.req.json();
  const input = createTaskSchema.parse(body); // NG — route.ts に書く
};
```

### service.ts

ビジネスロジック + Prisma アクセス。use case の実装。

```typescript
import { prisma } from "@/shared/lib/prisma";

export const taskService = {
  async create(userId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: { ...input, userId },
    });
  },
};
```

### validation.ts（optional）

server-only の validation がある場合のみ作成。`packages/schema` を import して compose する。

## Zod スキーマの置き場所（厳守）

| 置き場所 | 対象 |
|---------|------|
| `packages/schema` | HTTP 契約（request body, query params, path params, response DTO, 共有 entity 表現） |
| `features/*/validation.ts` | server-only validation（auth user id 注入、Prisma 検索条件の補助 validation 等） |

### ルール

- 同じ HTTP contract を `packages/schema` と slice 内で二重定義しない
- API ローカル validation は shared schema を import して compose するだけ
- `schema.ts` という名前は使わない（`packages/schema` と混同するため `validation.ts` を使う）

## shared/ のルール

- `utils.ts` を作らない（何でも入る汎用ファイルは禁止）
- Prisma client は `shared/lib/prisma.ts` のみ
- 認証は `shared/auth/*`
- HTTP 共通は `shared/http/*`
- domain logic は shared に置かない。必ず slice に残す
- shared に昇格してよいのは「2 slice 以上で使われる infra のみ」

## 禁止事項

- handler から Prisma を直接呼ばない
- Repository pattern は導入しない（3つ以上の service で同じ DB access/transaction が重複した時だけ再検討）
- `utils.ts` を作らない
- `packages/schema` の HTTP contract を API 内で再定義しない

## テスト戦略

| 対象 | テスト種別 | 方法 |
|------|-----------|------|
| 純粋ビジネスロジック（validate, 計算, ルール） | 単体テスト | DB 非依存で高速 |
| DB アクセスを含む service / handler | 統合テスト | Hono testClient + テスト DB |

- service が肥大化したら pure logic を slice 内の `domain.ts` か `rules.ts` に抽出し、単体テストを書く
- 抽出した pure logic は shared に出さない（slice 内に留める）
