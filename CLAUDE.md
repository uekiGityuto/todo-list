# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

妻の副業タスク管理を効率化するアプリ。「次やるタスク」の即表示、作業タイマー、カレンダーによる作業履歴確認が主要機能。

設計書: `task-management-plan.md`

## 技術スタック

- **フレームワーク**: Next.js + TypeScript
- **パッケージマネージャ**: pnpm
- **UI**: shadcn/ui + Tailwind CSS
- **デザイン**: pencil.dev（MCP経由で.penファイルを読み取りコード生成）
- **データ保存**: ローカルストレージ（将来的にSupabase等のDB移行予定）
- **開発環境**: devcontainer

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Lint実行
```

## アーキテクチャ

### 画面構成

| 画面 | パス（想定） | 概要 |
|------|-------------|------|
| ホーム | `/` | 「次やる」タスクをデカデカ表示 |
| タスク一覧 | `/tasks` | タスクCRUD + 「次やる」マーク付与 |
| タイマー | 常時表示 | カウントダウン、終了時に継続/完了/中断選択 |
| カレンダー | `/calendar` | 日付ごとの完了タスク一覧 |

### 開発フロー

pencil.devでデザイン → Claude CodeがMCP経由でコード生成 → ロジック実装 → デザイン調整
