# AGENTS.md

タスク管理アプリ（pnpm monorepo: `apps/web` + `apps/api` + `packages/schema`）

## ルール（必読）

`.agent-rules/` 配下に開発ルールがある。コードを変更する前に該当ルールを読むこと。

## リファレンス

- `.agent-rules/` — 開発ルール（アーキテクチャ、コーディング規約等）
- `docs/adr/` — アーキテクチャ決定記録
- `docs/domain/` — ドメイン知識
- `docs/knowledge/` — 技術ナレッジ

### 公式ドキュメント（最新の書き方を確認する際に参照）

- Next.js: https://nextjs.org/llms.txt
- React: https://react.dev/llms.txt
- Hono: https://hono.dev/llms.txt

## Worktree での作業

worktree 環境では `.env` や `.env.local` が存在しないため、開発サーバーやビルドが失敗する。
`scripts/sync-env.sh` を実行して、メインリポジトリの環境変数ファイルをシンボリックリンクすること。

ルートの `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm test` と、`apps/web` / `apps/api` の主要スクリプトは `sync-env.sh` を事前実行するため、通常は手動実行なしでもよい。
ただし初回確認や明示的にリンクを張りたい場合は、以下を実行すること。

```bash
bash scripts/sync-env.sh
```

## PR 作成

`.github/pull_request_template.md` のテンプレートに従って PR を作成すること。

## コマンド

```bash
pnpm dev       # 開発サーバー起動
pnpm build     # ビルド
pnpm lint      # Lint
pnpm test      # テスト
```
