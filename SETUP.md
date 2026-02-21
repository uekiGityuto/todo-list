# Phase 0: 開発環境構築 - devcontainer内での引き継ぎ手順

このドキュメントは、devcontainer起動後に `claude --dangerously-skip-permissions` で実行する残りのセットアップ手順です。

## 前提条件（ホスト側で完了済み）

- [x] Git初期化 (`git init`)
- [x] `.gitignore` 作成
- [x] `.devcontainer/` 作成（devcontainer.json, Dockerfile, firewall, etc.）
- [x] `.claude/settings.json` MCP設定（Context7, Playwright）
- [x] GitHubリポジトリ作成（public: https://github.com/uekiGityuto/todo-list）
- [x] mainブランチへ初回push済み
- [x] mainブランチ保護（直push禁止、PR必須）※初回push後に有効化
- [x] takt グローバルインストール（Dockerfileに含む）
- [x] `~/.takt` マウント設定（devcontainer.jsonに含む）

## ユーザーが手動で行う前提条件

- [x] `~/.takt/config.yaml` をホストに作成（dotfilesで管理、`~/.takt` → `dotfiles/dot_takt` シンボリックリンク済み）
- [ ] devcontainer を Rebuild して起動
- [ ] **要確認**: グローバル `~/.claude/settings.json` の git系 `deny` ルールが `--dangerously-skip-permissions` で上書きされるか検証。されない場合、`deny` → `ask` に変更が必要

## devcontainer内で実行するステップ

### Step 3: Next.js + shadcn/ui セットアップ

```bash
# Next.jsプロジェクト作成
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm

# shadcn/ui 初期化
pnpm dlx shadcn@latest init
```

**注意点:**
- `create-next-app` が `.gitignore` を上書きする可能性がある。実行後に以下のエントリが存在するか確認し、なければ追加:
  ```
  # devcontainer
  .devcontainer/extensions.local.txt
  .devcontainer/allowed-domains.local.txt

  # Claude Code
  .claude/settings.local.json
  ```
- `pnpm dev` で開発サーバーが起動することを確認

### Step 5: taktセットアップ

```bash
# takt バージョン確認
takt --version

# Claude Code Skills にエクスポート
npx takt export-cc
```

### Step 6: Claude Code Skills導入

以下の4つのスキルをインストール:
- `find-skills`
- `skill-creator`
- `vercel-react-best-practices`
- `ui-ux-pro-max`

```bash
# スキル検索（対話的）
npx skills find

# インストール例（GitHubリポジトリ指定）
npx skills add <github-user/repo>

# インストール済みスキル一覧
npx skills list
```

**注意:** `npx skills add` は対話的操作（スキル選択・エージェント選択）が必要な場合がある。
スキルの正確なリポジトリ名は `npx skills find <keyword>` で検索して確認する。

### Step 7: CLAUDE.md更新 + 初回コミット

環境構築完了後、CLAUDE.md を以下の観点で更新:
- セットアップ済みのツール・MCP構成の反映
- takt関連の情報追記（`npx takt export-cc` 済みなら Skills セクション等）

その後、コミット＆PRを作成:
```bash
git checkout -b feat/phase0-setup
git add -A
git commit -m "chore: Phase 0 開発環境構築"
git push -u origin feat/phase0-setup
gh pr create --title "chore: Phase 0 開発環境構築" --body "..."
```
※ mainへの直pushは保護ルールにより禁止。PR経由でマージする。

## 実行順序

```
Step 3 (Next.js + shadcn/ui)  ← 最優先・他に依存なし
Step 5 (takt export-cc)       ← Step 3 と並行可だが、Next.jsプロジェクト存在後が安全
Step 6 (Skills)               ← Step 5 の後
Step 7 (CLAUDE.md + コミット) ← 全て完了後
```

## 検証チェックリスト

- [ ] `pnpm dev` でNext.js開発サーバーが起動する
- [ ] `takt --version` でバージョンが表示される
- [ ] `.gitignore` にdevcontainer/Claude Code関連のエントリが含まれている
- [ ] `git status` でトラッキング不要なファイルが表示されない
