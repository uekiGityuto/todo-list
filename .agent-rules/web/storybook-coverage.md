---
paths:
  - "apps/web/src/**/*.stories.tsx"
  - "apps/web/src/shared/ui/**"
  - "apps/web/src/views/**"
---

# Storybook カバレッジルール

## 何を Story にするか

- ページには Story を作る
- ページ以外は原則不要
- ボタン、フォーム、モーダルなどのパーツは、状態による UI の変化を確認したい場合に Story を作る

## 原則不要

- 画面遷移しないと価値が出ないもの
- 認証や実 API との結合確認が主目的のもの
- 見た目や状態差分のない単純な UI
