# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

妻の副業タスク管理を効率化するアプリ。「次やるタスク」の即表示、作業タイマー、カレンダーによる作業履歴確認が主要機能。利用環境はPCメイン、スマホサブ。

設計書: `docs/task-management-plan.md`

## ドキュメント管理

| ディレクトリ | 用途 |
|------------|------|
| `docs/specs/` | 確定済みの設計ドキュメント |
| `docs/issues/` | 未対応の課題。対応したら結果を追記し `docs/archives/` に移動 |
| `docs/archives/` | 対応済みの課題アーカイブ |

## 技術スタック

- **フレームワーク**: Next.js + TypeScript
- **パッケージマネージャ**: pnpm
- **UI**: shadcn/ui + Tailwind CSS
- **デザイン**: pencil.dev（MCP経由で.penファイルを読み取りコード生成）
- **データ保存**: ローカルストレージ（将来的にSupabase等のDB移行予定）
- **開発環境**: devcontainer

## Gitルール

- **mainブランチでは作業しない**。必ずfeatureブランチを切ってからコミットすること
- PRはmain向けに作成し、マージはPR経由で行う

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Lint実行
```

## MCP

- **Context7**: 技術ドキュメント参照
- **Playwright**: ブラウザ操作・E2Eテスト

## Skills

- **takt**: `npx takt export-cc` でエクスポート済み。`/takt <piece-name> <task>` で利用
- **vercel-react-best-practices**: React/Next.jsパフォーマンス最適化ガイドライン
- **ui-ux-pro-max**: UI/UX設計ガイドライン

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
