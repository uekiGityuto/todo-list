---
paths:
  - "src/**/*.{ts,tsx,css}"
---

# 実装サイクル

新規ページ・機能の実装時に適用する。軽微な修正（バグ修正、スタイル微調整等）には不要。

## 1. 確認

- `docs/specs/pages/page-{画面名}.md` の該当ページ仕様を読む
- `docs/specs/user-flow.md` で画面間の遷移・フローを確認
- `docs/issues/006-directory-structure.md` でファイルの置き場所を確認
- pencil デザインを `batch_get` / `get_screenshot` で確認する
  - `batch_get` は `readDepth: 2〜3`, `searchDepth: 3〜5` に抑える（大きすぎるとコンテキスト溢れ）
  - 該当ページ仕様の「デザイン参照（pencil nodeId）」に nodeId 記載あり

## 2. 実装

## 3. レビュー

- `pnpm build` / `pnpm lint` でエラー・警告がないこと
- pencil `get_guidelines(code, tailwind)` と照合
- vercel-react-best-practices スキルでアンチパターンチェック

## 4. 修正

- レビューで見つかった問題を修正

## 5. 再レビュー

- 修正後、再度レビューを実施して問題がないことを確認
