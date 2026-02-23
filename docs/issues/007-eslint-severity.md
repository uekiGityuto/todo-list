# Hooks の検証と ESLint severity 設定

## 問題

1. **main ブランチへの commit ブロックが未検証**: `block-main-git.sh` を stdin 読み取りに修正したが、main ブランチ上に修正が反映されていないためテストできていない（PR マージ後に検証が必要）
2. **ESLint が warning しか出さない**: `eslint-config-next/typescript` のデフォルトでは `@typescript-eslint/no-unused-vars` 等が warning。error が出ないため `pnpm lint` の終了コードが常に 0 になる
3. **pre-commit-lint hook の検証ができていない**: hook は `pnpm lint` の終了コードでブロック判定するが、error が出ないためブロックされるケースを確認できていない

## 対応案

- PR マージ後に main ブランチで `block-main-git.sh` の動作確認
- `eslint.config.mjs` で severity を error に変更するルールを追加
- または hook 側で `--max-warnings 0` を使い warning でもブロックする

## 関連

- `.claude/hooks/block-main-git.sh` — main ブランチ保護 hook
- `.claude/hooks/pre-commit-lint.sh` — コミット前 lint hook
- `eslint.config.mjs` — ESLint 設定

## ステータス

未対応
