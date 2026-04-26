---
paths:
  - "**/package.json"
---

パッケージの追加は `pnpm add <package>` コマンドを使うこと。`package.json` を直接編集して依存パッケージを追加しない。

monorepo では対象 workspace に対して追加すること。対象ディレクトリで `pnpm add` を実行するか、`pnpm --filter <workspace> add ...` を使う。

新規追加時はバージョンを手で固定せず、`pnpm add` でその時点の互換のある版を解決する。互換性が重要な依存は `peerDependencies` も確認する。
