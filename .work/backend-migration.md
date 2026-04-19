# バックエンド導入 移行作業メモ

issue #19 の作業用メモ。実装完了後に削除する。

## 現在の構成

```
コンポーネント → useTasks() → useLocalStorage()
```

データアクセスは hooks 内の `useLocalStorage` で完結。hooks を差し替えることで移行可能。

対象 hooks:
- `useTasks()` — Task, Category の CRUD
- `useWorkRecords()` — WorkRecord の CRUD
- `useTimer()` — TimerSession の管理

## 移行後の構成

### API（apps/api/src/）

```
app.ts                    # Hono エントリポイント、ルート集約、AppType エクスポート
features/
  tasks/
    route.ts              # Hono route + zValidator + request/response mapping
    service.ts            # ビジネスロジック + Prisma
    validation.ts         # server-only validation（必要な時だけ）
  categories/
    route.ts / service.ts
  work-records/
    route.ts / service.ts
  timer-sessions/
    route.ts / service.ts
  auth/
    route.ts / service.ts
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

### packages/schema/src/

```
task.ts                   # Task 関連の Zod スキーマ
category.ts
work-record.ts
timer-session.ts
auth.ts
common.ts                 # 共通（pagination 等）
```

### フロントのデータフェッチ

Server Components + TanStack Query のハイブリッド:

```tsx
// app/tasks/page.tsx (Server Component)
export default async function Page() {
  const res = await fetch(`${process.env.API_URL}/api/tasks`);
  const tasks = await res.json();
  return <TasksPage initialTasks={tasks} />;
}
```

```tsx
// フロント側の API 呼び出し（TanStack Query + Hono RPC）
import { hc } from "hono/client";
import type { AppType } from "@todo-list/api";

const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!);

// 型安全な API 呼び出し
const res = await client.tasks.$post({
  json: { name: "タスク名", categoryId: "xxx" },
});
```

### サンプルコード

#### route.ts

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema, updateTaskSchema } from "@todo-list/schema";
import * as taskService from "./service";

export const tasksRoute = new Hono()
  .get("/", async (c) => {
    const tasks = await taskService.list();
    return c.json(tasks);
  })
  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const input = c.req.valid("json");
    const task = await taskService.create(input);
    return c.json(task, 201);
  })
  .put("/:id", zValidator("json", updateTaskSchema), async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json");
    const task = await taskService.update(id, input);
    return c.json(task);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await taskService.remove(id);
    return c.body(null, 204);
  });
```

#### app.ts

```typescript
import { Hono } from "hono";
import { tasksRoute } from "./features/tasks/route";
import { categoriesRoute } from "./features/categories/route";

const app = new Hono()
  .route("/tasks", tasksRoute)
  .route("/categories", categoriesRoute);

export default app;
export type AppType = typeof app;
```

> RPC の型推論をモノレポで動かすには、web と api の両方の tsconfig.json で "strict": true が必須。

#### service.ts

```typescript
import { prisma } from "@/shared/lib/prisma";

export const taskService = {
  async create(input: CreateTaskInput) {
    return prisma.task.create({
      data: input,
    });
  },
};
```

## Hono の実装方針

- handler は原則 `route.ts` に直接書く
- Hono は route 定義の近くで型推論が最も強く働くため、`c.req.param()`、`c.req.valid()`、RPC 用 `AppType` を素直に活かせる
- `handler.ts` を挟む controller 風構成は、型を手で補う必要が出やすいので採用しない
- HTTP 文脈を持たない業務ロジックと Prisma 操作は `service.ts` に寄せる
- 追加の server-only validation が必要な場合だけ `validation.ts` を slice 内に置く

## テスト方針

- API テストは `app.request()` を基本とする
- typed client が欲しいケースでは `hono/testing` の `testClient()` を検討する
- route 単体で型推論を活かせる構成を優先し、`Context` generic を補うための独自ユーティリティ型は作らない

## ローカル開発

| サービス | 方法 |
|---------|------|
| DB (PostgreSQL) | Supabase CLI (Docker) |
| 認証 | Supabase CLI (Docker) + Google OAuthクライアント |
| API (Hono) | `pnpm dev` (Node.js) |
| フロント (Next.js) | `pnpm dev` |

## TODO

- [ ] Supabase CLI セットアップ
- [ ] Prisma スキーマ定義
- [ ] Hono API 実装（features/ 構成）
- [ ] packages/schema に Zod スキーマ定義
- [ ] Hono RPC でフロント接続
- [ ] Google OAuth 認証
- [ ] 既存 hooks（useTasks, useWorkRecords, useTimer）の差し替え
