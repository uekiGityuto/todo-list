---
paths:
  - "apps/web/src/shared/hooks/**"
  - "apps/web/src/shared/lib/**"
  - "apps/web/src/shared/ui/**"
  - "apps/web/src/views/**"
---

# Web テストルール

## 何をテストするか

- `apps/web/src/shared/hooks/` のカスタムフックはテスト必須
- `apps/web/src/shared/lib/` のユーティリティ関数はテスト必須（`api/` を除く）
- `shared/ui/` や `views/**/ui/` のうち、フォーム、バリデーション、状態遷移、submit、エラー表示を持つものはテスト対象
- `app/` のルーティング層や、見た目だけの UI は原則テスト不要

## 規約

- テストファイルは `__tests__/` ディレクトリに置く
- 実装ファイルの隣に `.test.ts(x)` を colocate しない
- テストランナー: Vitest
