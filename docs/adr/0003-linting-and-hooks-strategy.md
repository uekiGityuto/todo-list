# ADR-0003: Lint・Git Hooks 戦略

## ステータス

Superseded — OxLint + Biome に移行済み。現在の設定は `biome.json`, `lefthook.yml`, `.oxlintrc.json` を参照。

## コンテキスト

ESLintのデフォルト設定では `@typescript-eslint/no-unused-vars` 等が warning のみで、`pnpm lint` の終了コードが常に 0 になる問題があった。pre-commit hook でのブロックが機能しない状態だった。

## 決定

### ESLintルール

以下のプラグイン・ルールを追加:

- `unused-imports/no-unused-imports`: error
- `unused-imports/no-unused-vars`: warn（`_` プレフィックス除外）
- `@typescript-eslint/no-unused-vars`: off（unused-imports に委譲）
- `@typescript-eslint/switch-exhaustiveness-check`: error
- `react/jsx-key`: error
- `import/order`: error（グループ分け + アルファベット順）

### Git Hooks: lefthook

Claude Code の PreToolUse hook から **lefthook** に移行:

- `lefthook.yml` で format → lint の piped 実行
- `CLAUDECODE=1` 時のみ実行（手動コミット時はスキップ）
- main ブランチ保護は `block-main-git.sh` で継続

## 理由

- error レベルにすることで `pnpm lint` が非ゼロ終了コードを返し、CIやpre-commit hookでブロック可能に
- lefthook は設定ファイルベースで管理しやすく、piped 実行で format → lint の順序を保証できる

## 影響

- `pnpm lint` でエラーが検出された場合、コミットがブロックされる
- 手動コミット時はスキップ（`CLAUDECODE=1` 環境変数で制御）
