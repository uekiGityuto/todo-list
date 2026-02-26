# タイマー画面の実装

## 背景

- ホーム画面（PR #10, `feat/home-page`）で NextTaskHero に「作業を始める」ボタンを配置済み
- タスク一覧のアクションメニューにも「作業を始める」がある
- クリック時 `/timer?taskId=xxx` に遷移するが、タイマー画面が未実装のため動作しない

## やること

タイマー画面（`/timer`）を実装する。

## 参照ドキュメント

- タイマー仕様: `docs/specs/pages/page-timer.md`
- ユーザーフロー: `docs/specs/user-flow.md`
- デザイン: pencil の nodeId（タイマー仕様書に記載）

## 備考

- ホーム画面PRがまだマージされていない場合は、`feat/home-page` ブランチから派生するか、main マージ後に作業する
