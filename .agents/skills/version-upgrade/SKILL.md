---
name: version-upgrade
description: パッケージやツールのバージョンアップを行う。トリガー例：「バージョンアップして」「パッケージ更新して」「ライブラリを最新にして」
---

# バージョンアップスキル

pnpm monorepo（`apps/web` + `apps/api` + `packages/schema`）のパッケージやツール（pnpm, Node.js 等）のバージョンアップを行う。

## 基本原則

1. **必ず `pnpm up` / `pnpm add` コマンドで更新する**: `package.json` を手動編集（Edit tool 等）してはならない
2. **上げたら確認する**: バージョンアップ後は必ず確認チェックリストを実施する
3. **確認が終わるまでコミット・push しない**: ビルド・lint・テストが全て通ってから
4. **メジャーと minor/patch は原則として混ぜない**: メジャーは breaking changes を伴うため、minor/patch とは別 PR にする。ただし規模が小さい・本番未リリース等の状況では、ユーザーと相談したうえで 1 PR にまとめてもよい

## 更新コマンド

```bash
# semver 範囲内の更新（マイナー/パッチ）
pnpm up -r

# 最新バージョンに更新（semver 範囲を超えてメジャーも上がる）
pnpm up -rL <package1> <package2> ...
```

`pnpm up -r` だけでは最新に上がりきらないことがある。最終的に `pnpm up -rL <package>` で個別に最新化する。

## ワークフロー

セッションをまたいで作業することがある。ユーザーの指示に応じて途中のステップから開始すること。

### Step 0: 現状把握

```bash
pnpm outdated -r
```

メジャーバージョンが上がっているパッケージを把握し、ユーザーに調査結果を共有する。

### Step 1: マイナー/パッチ更新 → PR

1. `pnpm up -r` で semver 範囲内の更新を一括適用
2. 確認チェックリストを実施
3. `pnpm up -r` で上がりきらなかったパッケージを `pnpm up -rL <package>` で個別に最新化（**メジャーアップ対象は除く**）
4. 再度確認チェックリストを実施
5. → PR

### Step 2: メジャーバージョンアップ → PR（1 つまたは複数）

1. 各パッケージの breaking changes を調査する（GitHub Releases / CHANGELOG）
2. 修正が少ないパッケージをまとめてアップグレード → PR
   - `pnpm up -rL <package1> <package2> ...`
   - 確認チェックリストを実施
3. 修正が多いパッケージは個別にアップグレード → 各 PR
   - `pnpm up -rL <package>`
   - breaking changes に応じた設定変更・コード修正
   - 確認チェックリストを実施

**例外**: 規模が小さい・本番未リリース・コード変更不要等の場合は、Step 1 の minor/patch と同 PR にまとめてもよい。判断に迷う場合はユーザーに相談する。

## 確認チェックリスト

すべてのバージョンアップで必ず実施:

- [ ] `pnpm lint` が通ること（ルートで一括実行）
- [ ] `pnpm build` が通ること（全 workspace）
- [ ] `pnpm test` が通ること（全 workspace の vitest）
- [ ] 上記が通ったら、ユーザーにブラウザでの動作確認を依頼する

上げたパッケージに応じて追加で実施:

- **`@prisma/client` / `prisma` / `@prisma/adapter-pg`**: 更新後 `pnpm --filter @todo-list/api db:generate` で Prisma Client を再生成する（型エクスポートが変わることがある）
- **`@biomejs/biome`**: `biome.json` の `$schema` URL を新バージョンへ追従（例: `https://biomejs.dev/schemas/2.4.13/schema.json`）
- **`msw`**: `pnpm --filter @todo-list/web msw:init` で `apps/web/public/mockServiceWorker.js` を更新
- **`@playwright/test`**: ブラウザ更新が必要な場合がある（`pnpm exec playwright install`）。E2E は `pnpm test:e2e` で実行
- **`tailwindcss` / `shadcn`**: UI の見た目に影響しうる。ユーザーにブラウザ動作確認を依頼
- **`oxlint` / `oxlint-tsgolint`**: 新ルール追加で既存コードがエラーになる場合がある。`pnpm lint` で検出
- **`storybook` / `@storybook/nextjs-vite`**: `pnpm --filter @todo-list/web build-storybook` でビルド確認
- **`vitest`**: テスト設定（`vitest.config.mts`）の互換性確認
- **`hono` / `@hono/node-server` / `@hono/zod-validator`**: API ハンドラ・ミドルウェアの動作確認
- **postinstall スクリプトを持つパッケージが新規追加された場合**: `pnpm-workspace.yaml` の `allowBuilds` への追加を検討（現状: `lefthook`, `supabase`, `prisma`, `@prisma/client`, `@prisma/engines`）

## 既知の制約

- **`@vitejs/plugin-react` v6** は Vite 8 必須。本リポジトリは vitest 経由で Vite 7 を使うため、**v5 系据え置き**。Vite 8 対応（vitest メジャーアップ等）と合わせて再検討する
- **`tsconfck`（storybook 経由の transitive dep）** が `typescript@^5.0.0` を要求するが、本リポジトリは TS 6 を使用。peer 警告は出るが動作上は問題なし。上流対応待ち

## pnpm のアップグレード手順

本リポジトリには `.mise.toml` も `packageManager` フィールドもない。pnpm バージョンは以下で管理されている:

1. `.github/workflows/ci.yml` の `pnpm/action-setup` の `with.version`

更新後は CI が通るか確認すること。

## Node.js のアップグレード手順

1. `.github/workflows/ci.yml` の `actions/setup-node` の `with.node-version`
2. 同時に `@types/node` のメジャーを Node 本体に合わせて上げる（Node 24 → `@types/node@24.x`）

**ユーザーから明確な指示がない限り Node 本体のメジャーアップはやらない。**

## 注意事項

- **`@types/node` のメジャーは Node.js 本体のバージョンに合わせる**（Node 24 なら `@types/node@24.x`、勝手に v25 へ上げない）
- **TypeScript のメジャーアップ**: ユーザーから明確な指示がない限りやらない
- **PR は `.github/pull_request_template.md` のテンプレートに従う**
- **ブランチ名は `feat/` プレフィックス**（`CLAUDE.local.md` 準拠、`git switch -c feat/...` を使う。`git checkout` は使わない）
- **commit はフックを通す**（`--no-verify` 禁止。`a046a9b` で hook bypass を禁止する設定済み）

## 非推奨パッケージの対応

- **削除前に必ず import を検索**: `Grep` ツールでコード内の使用箇所を確認
- **`@types/*` の deprecated**: 本体が型を同梱するようになった場合は削除してよい
