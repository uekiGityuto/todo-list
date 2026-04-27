---
paths:
  - "apps/web/src/**/*.ts"
  - "apps/web/src/**/*.tsx"
  - "packages/schema/src/**/*.ts"
---

# Web フォームバリデーションルール

フォームのバリデーションは「共通ルール」と「UI 入力都合」を分離すること。

## 基本方針

- 必須、文字数、数値範囲、enum、HEX、UUID、日付フォーマットのような本質的な制約は `packages/schema` に寄せる
- `trim`, `"" -> null`, `Date`, `<select>` の string 値のような UI 入力都合は `apps/web` 側で扱う
- UI 用 schema はフォーム近傍に置き、shared primitive schema に寄せる

## react-hook-form

- フォーム状態管理は `react-hook-form` を使う
- バリデーションは `zodResolver` を使う
- submit ボタンは `LoadingButton` を使う
- 多重送信防止は `mutation-guard.md` に従う

## submit / mutation の責務

- フォームコンポーネント
  - 入力 UI
  - RHF
  - schema
  - フィールドエラー表示
- カスタム hook
  - submit
  - mutation 呼び出し
  - API エラー → `setError`
  - 成功時の close / redirect

バリデーションルール本体を submit hook に書かないこと。

## API エラーの扱い

- API の field error は可能な限り `setError` に流す
- フィールドに割り当てられないエラーは `root.serverError` に出す

## 認証フォームの扱い

- Better Auth など API 契約を共有していないフォームは `apps/web` 側だけで schema を持ってよい
- ただし、同じフォーム内では UI 用 schema と submit hook の責務分離は守る

## 配置ルール

- 1 つのページでしか使わないフォームは `views/**/ui/`
- 複数ページで使うフォームは `shared/ui/`
- schema と submit hook はフォームの近くに置く

## 避けること

- 同じ `min`, `max`, `positive` を API と Web で二重定義する
- API 契約 schema を UI 入力 schema としてそのまま使う
- `useState` だけでフォーム状態・エラー・submit を個別管理し続ける
