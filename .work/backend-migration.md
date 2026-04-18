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
    route.ts              # Hono router + zValidator
    handler.ts            # validated input 取得 → service → response
    service.ts            # ビジネスロジック + Prisma
    validation.ts         # server-only validation（必要な時だけ）
  categories/
    route.ts / handler.ts / service.ts
  work-records/
    route.ts / handler.ts / service.ts
  timer-sessions/
    route.ts / handler.ts / service.ts
  auth/
    route.ts / handler.ts / service.ts
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
import { list, create, update, remove } from "./handler";

export const tasksRoute = new Hono()
  .get("/", list)
  .post("/", zValidator("json", createTaskSchema), create)
  .put("/:id", zValidator("json", updateTaskSchema), update)
  .delete("/:id", remove);
```

#### app.ts

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

> RPC の型推論をモノレポで動かすには、web と api の両方の tsconfig.json で "strict": true が必須。

#### handler.ts

```typescript
// validated input を受け取る
export const create = async (c) => {
  const input = c.req.valid("json"); // zValidator で検証済み、型付き
  const userId = c.get("userId");
  const task = await taskService.create(userId, input);
  return c.json(task, 201);
};
```

#### service.ts

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
- [ ] TanStack Query + Hono RPC でフロント接続
- [ ] Google OAuth 認証
- [ ] 既存 hooks（useTasks, useWorkRecords, useTimer）の差し替え
