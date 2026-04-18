# ADR-0004: バックエンド導入（ローカルストレージ → DB）

## ステータス

Accepted

## コンテキスト

デバイス間同期やデータ永続性の観点でDBへの移行が必要。別プロジェクトのPOC的な位置付けでもあり、ベストプラクティスな構成を検証したい。

## 決定

### 技術スタック

| カテゴリ | 技術 |
|----------|------|
| DB | Supabase (PostgreSQL) |
| 認証 | Google OAuth (Supabase Auth) |
| APIフレームワーク | Hono |
| ORM | Prisma |
| バリデーション | Zod |
| データフェッチ | TanStack Query + Hono RPCクライアント |

### アーキテクチャ構成

- **リポジトリ**: モノレポ（pnpm workspaces）。`apps/web`, `apps/api`, `packages/schema`
- **API**: Vertical Slice 構成。機能ごとに route / handler / service を垂直にまとめる
- **フロント**: 初期データは Server Components（SSR）、ミューテーションは TanStack Query + Hono RPC
- **型安全**: Hono RPC で API の型がフロント側に自動伝播。Zod スキーマは `packages/schema` で共有
- **フロントとバックエンドの疎結合**: Server Actions ではなく Hono API を採用。独立デプロイ可能

### ローカル開発

Supabase CLI (Docker) で DB・認証をローカル実行。

## 理由

- **Supabase**: PostgreSQL + 認証をセットで提供。ローカル開発もCLIで完結
- **Hono**: 軽量で型安全、RPC クライアントによりフロント・バックエンド間の型共有が容易
- **Prisma**: スキーマファーストで型安全。AIにコードを書かせやすく、レビューもしやすい
- **Zod**: フロント・API両方でバリデーション共有可能
- **TanStack Query + Hono RPC**: 楽観的更新・キャッシュ管理が自動、型安全なAPI呼び出し
- **Vertical Slice**: 機能ごとに垂直にまとめることで責務が明確。Coding Agentが迷いにくい
- **Server Actions を使わない理由**: フロントとバックエンドを疎結合にし、将来のモバイル対応にも備える
