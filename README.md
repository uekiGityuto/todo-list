# todo-list

タスク管理アプリ（pnpm monorepo）

## セットアップ

### 必要なツール

- [mise](https://mise.jdx.dev/) — Node.js, pnpm 等のバージョン管理
- [Docker](https://www.docker.com/) — Supabase ローカル DB
- [Gitleaks](https://github.com/gitleaks/gitleaks) — シークレット検出（pre-commit で使用）
- [Semgrep](https://semgrep.dev/) — セキュリティスキャン（pre-commit で使用）

```bash
# Gitleaks・Semgrep のインストール（macOS）
brew install gitleaks semgrep

# ツールインストール（mise で Node.js, pnpm 等を管理）
mise install

# 依存インストール
pnpm install

# Docker 起動（Supabase ローカル DB）
open -a "Docker"

# Supabase 起動 + DB マイグレーション
pnpm supabase:setup

# 開発サーバー起動
pnpm dev
```

## コマンド

```bash
pnpm dev             # 開発サーバー起動（web + api）
pnpm build           # ビルド
pnpm lint            # Lint
pnpm test            # テスト
pnpm format          # フォーマット（Biome）
pnpm supabase:start  # Supabase 起動
pnpm supabase:stop   # Supabase 停止
pnpm db:login        # DB に接続
```

## TAKT（AI ワークフロー）

```bash
# issue を指定して実行
takt -w todo-list-default -i #30

# ページ実装用ワークフロー
takt -w todo-list-page -i #15

# PR を自動作成
takt -w todo-list-default -i #30 --auto-pr

# ドラフト PR で作成
takt -w todo-list-default -i #30 --auto-pr --draft
```

| ワークフロー | 用途 |
|---|---|
| `todo-list-default` | 一般的な issue 実装（web/api 両対応） |
| `todo-list-page` | Web ページ実装（デザイン照合付き） |
