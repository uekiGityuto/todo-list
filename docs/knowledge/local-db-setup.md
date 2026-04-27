# ローカルDBセットアップ

このプロジェクトでは、認証は `Better Auth`、ローカル DB 起動は `Supabase CLI` を使う。

## 前提

- Docker Desktop など、Supabase CLI が利用するコンテナ実行環境が起動していること
- リポジトリルートで `pnpm install` 済みであること

## 初回セットアップ

```bash
pnpm supabase:setup
```

このコマンドで以下をまとめて実行する。

- `pnpm exec supabase start`
- `pnpm --filter @todo-list/api db:deploy`

`db:deploy` では Prisma migration の適用と Prisma Client の生成を行う。

## 開発中によく使うコマンド

```bash
pnpm supabase:start
pnpm supabase:stop
pnpm db:login
pnpm --filter @todo-list/api test
```

## 接続先

API は [apps/api/.env.example](../../apps/api/.env.example) と同じ形式の `apps/api/.env` を参照する。

ローカルDBのデフォルト接続先:

```bash
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## ハマりどころ

- `Can't reach database server at localhost:54322` が出る場合は、まず `pnpm supabase:setup` を実行する
- Supabase CLI が見つからない場合も、グローバルインストールは不要で `pnpm exec supabase` が使われる
