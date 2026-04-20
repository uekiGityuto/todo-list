# AGENTS.md

タスク管理アプリ（pnpm monorepo: `apps/web` + `apps/api` + `packages/schema`）

## ルール（必読）

`.agent-rules/` 配下に開発ルールがある。コードを変更する前に該当ルールを読むこと。

## リファレンス

- `.agent-rules/` — 開発ルール（アーキテクチャ、コーディング規約等）
- `docs/adr/` — アーキテクチャ決定記録
- `docs/domain/` — ドメイン知識
- `docs/knowledge/` — 技術ナレッジ

## コマンド

```bash
pnpm dev       # 開発サーバー起動
pnpm build     # ビルド
pnpm lint      # Lint
pnpm test      # テスト
```
