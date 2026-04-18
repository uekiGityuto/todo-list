# ADR-0004: バックエンド導入（ローカルストレージ → DB）

## ステータス

Accepted

## コンテキスト

現在はローカルストレージでデータ保存しているが、デバイス間同期やデータ永続性の観点でDBへの移行が必要。別プロジェクトのPOC的な位置付けでもあり、ベストプラクティスな構成を検証したい。

現在のデータアクセス構造:
```
コンポーネント → useTasks() → useLocalStorage()
```

## 決定

### 技術スタック

| カテゴリ | 技術 | 備考 |
|----------|------|------|
| DB | Supabase (PostgreSQL) | 認証もセットで提供 |
| 認証 | Google OAuth (Supabase Auth) | シンプルで導入が容易 |
| APIフレームワーク | Hono | 軽量、型安全なRPCクライアント |
| ORM | Prisma | 型安全、スキーマからの型生成、AIとの相性良 |
| バリデーション | Zod | フロント・API両方で利用、共有パッケージに配置 |
| データフェッチ | TanStack Query + Hono RPCクライアント | 楽観的更新、キャッシュ管理、型安全なAPI呼び出し |

### リポジトリ構成: モノレポ（pnpm workspaces）

```
todo-list/
  packages/
    web/          # Next.js（フロントエンド）
    api/          # Hono + Prisma（バックエンド）
    shared/       # Zod スキーマ、共有型定義
```

デプロイ先はフロントとバックエンドで別々を想定（具体的なデプロイ設定は後回し）。

### フロントエンドのデータフェッチ方針

Server Components + TanStack Query のハイブリッド構成:

- **初期データ取得**: Server Components（SSR）でHono APIをfetch
- **ミューテーション・再フェッチ**: クライアント側でTanStack Query + Hono RPCクライアント
- **インタラクティブな部分**: Client Components（タイマー等）

```tsx
// app/tasks/page.tsx (Server Component)
export default async function Page() {
  const res = await fetch(`${process.env.API_URL}/api/tasks`);
  const tasks = await res.json();
  return <TasksPage initialTasks={tasks} />;
}
```

### ローカル開発

| サービス | 方法 |
|---------|------|
| DB (PostgreSQL) | Supabase CLI (Docker) |
| 認証 | Supabase CLI (Docker) + Google OAuthクライアント |
| API (Hono) | `pnpm dev` (Node.js) |
| フロント (Next.js) | `pnpm dev` |

## 理由

- **Supabase**: PostgreSQL + 認証 + リアルタイムをセットで提供。ローカル開発もCLIで完結
- **Hono**: 軽量で型安全、RPC クライアントによりフロント・バックエンド間の型共有が容易
- **Prisma**: 型安全なORM、スキーマファーストでAIにコードを書かせやすい、レビューもしやすい
- **Zod**: フロント・API両方でバリデーション共有可能
- **TanStack Query + Hono RPC**: 楽観的更新・キャッシュ管理が自動、型安全なAPI呼び出し
- **Server Components + クライアントのハイブリッド**: Next.js App Router のベストプラクティスに従い、初期表示を高速化しつつクライアント側のインタラクションも対応
- **フロントとバックエンドの疎結合**: Server Actions ではなく Hono API を採用。フロントとバックエンドを独立してデプロイ可能にし、将来の柔軟性を確保

## 影響

- モノレポ化に伴い、既存の `src/` を `packages/web/src/` に移動
- 既存のhooks（useTasks, useWorkRecords等）はTanStack Query + Hono RPCベースに書き換え
- ローカル開発にDockerが必要（Supabase CLI）
- Google Cloud ConsoleでOAuthクライアントIDの発行が必要
