# ローカルDBセットアップ

このプロジェクトでは、認証は `Better Auth`、ローカル DB はリポジトリルートの `compose.yaml` で起動する Docker Compose 管理の PostgreSQL を使う。

## 前提

- Docker Desktop など、Docker Compose が動作するコンテナ実行環境が起動していること
- リポジトリルートで `pnpm install` 済みであること

## 初回セットアップ

```bash
pnpm db:setup
```

このコマンドで以下をまとめて実行する。

- `docker compose up -d --wait postgres`
- `pnpm --filter @todo-list/api db:deploy`

`db:deploy` では Prisma migration の適用と Prisma Client の生成を行う。

## 開発中によく使うコマンド

```bash
pnpm db:start                       # ローカル PostgreSQL を起動
pnpm db:stop                        # ローカル PostgreSQL を停止
pnpm db:login                       # psql でログイン
pnpm --filter @todo-list/api test
```

## 接続先

API は [apps/api/.env.example](../../apps/api/.env.example) と同じ形式の `apps/api/.env` を参照する。

ローカルDBのデフォルト接続先:

```bash
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

データはホスト側の Docker named volume `todo-list-postgres-data` に永続化される。完全にリセットしたい場合は `docker compose down -v` を実行する。

## ハマりどころ

- `Can't reach database server at localhost:54322` が出る場合は、まず `pnpm db:setup` を実行する
- ポート 54322 が他プロセスで使われている場合は、競合プロセスを停止してから `pnpm db:start` を再実行する
