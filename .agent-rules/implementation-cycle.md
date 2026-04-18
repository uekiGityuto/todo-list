---
paths:
  - "apps/web/src/**/*.{ts,tsx,css}"
---

# 実装サイクル

新規ページ・機能の実装時に適用する。軽微な修正（バグ修正、スタイル微調整等）には不要。

## 1. 確認

- 既存コードを読んで現在の実装を把握する
- ファイルの置き場所を確認: `.agent-rules/architecture.md`
- pencil デザインを `batch_get` / `get_screenshot` で確認する
  - `batch_get` は `readDepth: 2〜3`, `searchDepth: 3〜5` に抑える（大きすぎるとコンテキスト溢れ）

## 2. 実装

## 3. レビュー

- `pnpm build` / `pnpm lint` でエラー・警告がないこと
- pencil `get_guidelines(code, tailwind)` と照合
- vercel-react-best-practices スキルでアンチパターンチェック

## 4. 修正

- レビューで見つかった問題を修正

## 5. 再レビュー

- 修正後、再度レビューを実施して問題がないことを確認
