# AGENTS.md

## プロジェクト概要

妻の副業タスク管理アプリ。「次やるタスク」の即表示、作業タイマー、カレンダーによる作業履歴確認が主要機能。

## 技術スタック

Next.js (App Router) + TypeScript / pnpm / shadcn/ui + Tailwind CSS / ローカルストレージ

## アーキテクチャ

FSD Lite（`.agent-rules/architecture.md` 参照）

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Lint実行
```

## ドキュメント

| ディレクトリ     | 用途                                                         |
| ---------------- | ------------------------------------------------------------ |
| `docs/specs/`    | 確定済みの設計ドキュメント                                   |
| `docs/issues/`   | 未対応の課題。対応したら結果を追記し `docs/archives/` に移動 |
| `docs/archives/` | 対応済みの課題アーカイブ                                     |

## 開発フロー

pencil.devでデザイン → AIエージェントがMCP経由でコード生成 → ロジック実装 → デザイン調整
