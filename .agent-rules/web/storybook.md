---
paths:
  - "apps/web/.storybook/**"
  - "apps/web/src/**/*.stories.tsx"
  - "apps/web/src/shared/storybook/**"
---

# Storybook ルール

- Storybook では見た目確認と状態差分確認を行う
- 画面遷移や認証を含む動作確認は Storybook では行わない
- ページは初期表示のみを基本とする
- Story は再現条件を固定できる形にし、props で足りる場合は props を使う
- API モックが必要な場合のみ MSW を使う
