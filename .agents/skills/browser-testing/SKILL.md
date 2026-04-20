---
name: browser-testing
description: "Playwright MCP を使ったブラウザでの動作確認。開発サーバー起動、認証、UI操作の検証を行う。UIの動作確認やブラウザテストが必要な場合に使用する。"
compatibility: Requires Docker Desktop, Playwright MCP server
allowed-tools: Bash(docker:*) Bash(pnpm:*) mcp__playwright__*
---

# ブラウザテスト

Playwright MCP を使ったブラウザでの動作確認手順。

## 1. 環境準備

### Docker

Supabase ローカル DB に Docker が必要。

```bash
# Docker が起動しているか確認
docker info > /dev/null 2>&1
```

起動していない場合は `open -a "Docker"` で Docker Desktop を起動する。
起動に失敗する場合はユーザーに連絡すること。

### 開発サーバー

```bash
pnpm dev
```

API（`apps/api`）と Web（`apps/web`）が両方起動する。

## 2. 認証

ログインが必要な場合は以下のテストユーザーを使用する。

- メールアドレス: `agent@example.com`
- パスワード: `agent001`

対象ユーザーが存在しない場合は、上記の情報でサインアップしてから使用する。

## 3. ブラウザ操作

Playwright MCP ツールを使用する。

1. `browser_navigate` でページにアクセスする
2. `browser_snapshot` で現在の状態を確認する
3. `browser_click` / `browser_fill_form` / `browser_press_key` で操作する
4. 操作後に `browser_snapshot` で結果を確認する
5. 必要に応じて `browser_take_screenshot` でスクリーンショットを撮る
