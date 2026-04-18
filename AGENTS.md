# AGENTS.md

## プロジェクト概要

妻の副業タスク管理アプリ。「次やるタスク」の即表示、作業タイマー、カレンダーによる作業履歴確認が主要機能。

## 技術スタック

Next.js (App Router) + TypeScript / pnpm / shadcn/ui + Tailwind CSS / ローカルストレージ

## アーキテクチャ

FSD Lite（`.agent-rules/web/architecture.md` 参照）

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Lint実行
```

## ドキュメント

| ディレクトリ       | 用途                         |
| ------------------ | ---------------------------- |
| `docs/adr/`        | アーキテクチャ決定記録 (ADR) |
| `docs/domain/`     | ドメイン知識                 |
| `docs/knowledge/`  | 技術ナレッジ                 |

## 開発フロー

pencil.devでデザイン → AIエージェントがMCP経由でコード生成 → ロジック実装 → デザイン調整
