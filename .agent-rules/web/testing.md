---
paths:
  - "apps/web/src/shared/hooks/**"
  - "apps/web/src/shared/lib/**"
---

# Web テストルール

## テスト必須ディレクトリ

以下のディレクトリのファイルを追加・変更した場合、対応するテストを書くこと。

- `apps/web/src/shared/hooks/` — カスタムフック
- `apps/web/src/shared/lib/` — ユーティリティ関数（`api/`, `supabase/` 配下は除く）

## テスト不要

- `apps/web/src/app/` — Next.js ルーティング層
- `apps/web/src/views/` — ページコンポーネント
- `apps/web/src/shared/ui/` — UI コンポーネント

## 規約

- テストファイルは `__tests__/` ディレクトリに `<対象ファイル名>.test.ts(x)` で配置する
- テストランナー: Vitest
