# プロジェクト進捗

## 完了済み

### Phase 0: 開発環境構築
- [x] devcontainer構築（ファイアウォール、Node.js、pnpm等）
- [x] Next.js 16 + TypeScript + Tailwind CSS セットアップ
- [x] shadcn/ui 初期化
- [x] takt export-cc
- [x] Skills導入（vercel-react-best-practices, ui-ux-pro-max）
- [x] GitHub認証（gh auth login、HTTPS）
- [x] PR作成・マージ済み

### Phase 1: デザイン
- [x] pencil.devで全画面のデザイン作成（ホーム、タスク一覧、タイマー、カレンダー）
  - デザインファイル: `designs/todo-app.pen`
  - テーマ変数でカラー管理（$primary, $card, $text 等）
  - 再利用コンポーネント: Button, Check, Badge, Filter, TabBarItem, SectionHeader, TaskCard, NextTaskHero, CalendarCell
  - モバイル4画面 + PC3画面
- [x] カレンダー改善
- [x] **ユーザーフロー設計** → [`docs/specs/user-flow.md`](specs/user-flow.md)
- [x] フローに基づくUI調整
  - タスクアクションダイアログ（通常/次やるタスク）
  - タスク追加モーダル（モバイル/PC）
  - タイマー終了ダイアログ（完了/継続/中断）
  - 復帰ダイアログ（ブラウザ閉じ後の復帰）
  - PCタイマー簡易表示

### Phase 2-1: 共通基盤
- [x] テーマ変数設定（globals.css）— primaryを青(#3BADE0)に変更
- [x] フォント変更（Geist Sans → Inter）
- [x] shadcn/uiコンポーネント導入+カスタマイズ（button, badge, dialog, input, label）
- [x] アプリ固有コンポーネント9種作成（check, filter-chip, section-header, tab-bar, sidebar, task-card, next-task-card, next-task-hero, calendar-cell）
- [x] optimizePackageImports設定（lucide-react）
- [x] デザインファイルのprimary色も青に同期

## 進行中

### Phase 2-2: 各ページ実装
- [ ] タスクCRUD（追加・編集・削除・一覧）
- [ ] 「次やる」マーク機能 + ホーム画面
- [ ] ローカルストレージによるデータ永続化
- [ ] タイマー機能（カウントダウン、継続/完了/中断選択）
- [ ] カレンダー機能（作業記録：完了+作業中タスクの日別一覧）

### 将来対応
- [ ] PC版PiPタイマー → [`docs/issues/002-pc-pip-timer.md`](issues/002-pc-pip-timer.md)

## 次にやること

1. **Phase 2-2**: taktで各ページを並列実装
