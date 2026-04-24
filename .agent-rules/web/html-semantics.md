---
paths:
  - "apps/web/src/views/**/*.tsx"
  - "apps/web/src/shared/ui/**/*.tsx"
---

# HTML セマンティクスルール

HTML 要素が本来持つ機能を JavaScript で再実装しない。
ブラウザがデフォルトで提供する振る舞い（キーボード操作、アクセシビリティ、右クリックメニュー等）を損なわないことを最優先とする。

## 原則

- リンクは `<a>`（または `<Link>`）を使う。`onClick` + `router.push` で遷移しない
- フォームは `<form>` + `onSubmit` を使う。ボタンの `onClick` で値を収集しない
- クリック可能な要素は `<button>` を使う。`<div onClick>` を使わない
- フォーム要素は HTML 標準の属性（`name`, `required`, `type` 等）を正しく設定する