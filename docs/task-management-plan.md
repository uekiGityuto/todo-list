# タスク管理アプリ 設計書

## プロジェクト名

todo-list

## 👀 背景・課題

インスタなどで副業をしている妻からのヒアリングに基づく。

- 何か作業しようと思った時に、何をしようか考えている時間がもったいない
- 前回やった作業内容を忘れていて、なにをやるべきか思い出す時間が必要
- 考えている間に他のことに脱線するから、すぐ作業に入りたい
- すぐ別のことに脱線する

## 🖥 利用環境

- **メイン**: PC（ブラウザ）
- **サブ**: スマートフォン（ブラウザ）

## 💭 ソリューション

ベースはシンプルなタスク管理アプリ。上記の課題それぞれに対応する機能を持つ。

### 次にやるタスクがわからない問題

- 開いた時に、今やることをデカデカと表示する
- タスクに「次やる」マークをつけて、次回起動時にそのタスクを表示する

### 前回やった作業内容がわからない問題

- カレンダーで日付ごとに対応したタスクを一覧で見れる
- タップしたらその日の詳細が見れる

### 脱線する問題

- タスクに作業時間を設定してタイマー発動
- 時間になったら、継続するか完了するか中断するか選べる
- タイマーは出しっぱなし

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js + TypeScript |
| パッケージマネージャ | pnpm |
| UIライブラリ | shadcn/ui + Tailwind CSS |
| デザイン | pencil.dev（shadcn/ui UIキット使用） |
| 実装 | Claude Code（pencil MCP連携） |
| データ保存 | ローカルストレージ → 後でログイン + DB |
| 開発環境 | devcontainer |
| オーケストレーション | takt + Claude Code Agent Teams |

### 技術選定の理由

- **Next.js**: ルーティング・API Routes を標準で持ち、将来のログイン機能追加に向いている
- **shadcn/ui**: pencil.devのUIキットとして内蔵されており、Claude Codeとの相性も良い。v0・Bolt・Lovable等のAIツールのデファクト
- **pencil.dev**: IDE内でデザイン→Claude CodeがMCP経由で.penファイルを読み取りコード生成。デザインとコードが同一リポジトリで完結する
- **takt**: Claude Code Agent Teamsと連携し、issue → plan → implement → review のフローを自動化。ワークフローの確実な実行を保証する

## 🔌 MCP構成

| MCP Server | 用途 |
|-----------|------|
| Context7 | ライブラリの最新ドキュメント参照（Next.js, shadcn/ui等） |
| Playwright | デザインと実装の差分確認、E2Eテスト |
| pencil.dev | デザイン ↔ コード連携（.penファイル読み書き） |

### 入れないもの・理由

- **Sequential Thinking**: taktのオーケストレーションが同等の役割を果たすため不要
- **Filesystem**: Claude Codeが標準でファイル操作可能なため不要
- **Serena**: ゼロから作るプロジェクトのためLSP連携の恩恵が薄い

## 🧠 Claude Code Skills

| Skill | 用途 |
|-------|------|
| find-skills | スキル検索（メタスキル） |
| skill-creator | 独自ワークフローのスキル化 |
| vercel-react-best-practices | Next.js/Reactのコード品質チェック |
| ui-ux-pro-max | 参考サイトのUI/UX解析・再現 |
| supabase-postgres-best-practices | Phase 5のDB移行時に導入 |

## 📐 画面構成

| 画面 | 概要 |
|------|------|
| ホーム | 「次やる」マークをつけたタスクをデカデカ表示。即作業開始できる |
| タスク一覧 | タスクの追加・編集・完了・削除。「次やる」マーク付与 |
| タイマー | カウントダウンタイマー。常時表示。終了時に継続/完了/中断を選択 |
| カレンダー | 日付ごとの完了タスク一覧。日付クリックで詳細表示 |

## 🔧 開発フロー

```
pencil.devでデザイン → Claude Codeでコード生成 → ロジック実装 → デザイン調整
```

1. pencil.devで画面デザイン（shadcn/ui UIキット使用）
2. Claude CodeがMCP経由で.penファイルを読み取り、React + Tailwindのコードを生成
3. 状態管理・データ永続化等のロジックはClaude Codeに指示して実装
4. デザイン変更はpencilで修正 → Claude Codeに「デザインに合わせてコード更新して」と指示

## 📋 フェーズ計画

### Phase 0：開発環境構築

- devcontainer設定（既存プロジェクトのものをベースにカスタム）
- MCP設定（Context7, Playwright, pencil.dev, GitHub）
- Claude Code Skills導入（find-skills, skill-creator, vercel-react-best-practices, ui-ux-pro-max）
- takt + Agent Teamsセットアップ（`npx takt export-cc`）

### Phase 1：プロジェクトセットアップ + デザイン

- Next.js + TypeScript + pnpm プロジェクト作成
- shadcn/ui + Tailwind CSS セットアップ
- pencil.devで全画面のデザイン（ホーム・タスク一覧・タイマー・カレンダー）
- データ構造（Taskの型）の設計

### Phase 2：コア機能

- タスクCRUD（追加・編集・完了・削除）
- 「次やる」マーク機能
- ホーム画面（マークしたタスクをドーンと表示）
- ローカルストレージでのデータ永続化

### Phase 3：タイマー機能

- タスクに作業時間を設定
- カウントダウンタイマー（常時表示）
- 終了時のアクション選択（継続/完了/中断）

### Phase 4：カレンダー機能

- 日付ごとの完了タスク一覧表示
- 日付クリックで詳細表示

### Phase 5：認証・データ永続化

- ログイン機能（Supabase等）
- ローカルストレージからDB移行
- Claude Code Skills追加：supabase-postgres-best-practices
