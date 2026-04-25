---
paths:
  - "apps/web/src/views/**/*.tsx"
  - "apps/web/src/shared/ui/**/*.tsx"
---

# ミューテーション多重実行防止ルール

ミューテーションを実行するボタン・フォームには、必ず多重実行防止を実装すること。

## ボタン（onClick）

`shared/ui/loading-button.tsx` の `LoadingButton` を使い、`loading` prop に mutation の `isPending` を渡す。

```tsx
<LoadingButton loading={isDeletingTask} onClick={onConfirm}>
  削除
</LoadingButton>
```

## フォーム（onSubmit）

1. submit ボタンに `LoadingButton` + `loading` を設定する
2. `handleSubmit` の冒頭で `if (loading) return` ガードを入れる（Enter キーによる再送信防止）

```tsx
const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (loading) return;
await onSubmit(data);
};
```

### react-hook-form を使う場合

- `formState.isSubmitting` を `loading` 変数に束縛して使ってよい
- submit ボタンには `LoadingButton loading={loading}` を渡す
- `handleSubmit(async (values) => { if (loading) return; ... })` の形で明示ガードを残す

```tsx
const loading = isSubmitting;

const onSubmit = handleSubmit(async (values) => {
  if (loading) return;
  await submit(values);
});
```

## 複合操作（複数の非同期処理 + 画面遷移）

ローカルの loading state を使い、以下を守る:

- ハンドラ冒頭で `if (loadingAction) return` ガードを入れる
- `router.push` 後は loading を解除しない（コンポーネントのアンマウントに任せる）
- エラー時のみ `catch` で loading を解除する

## isPending の取得元

`useTasks` フックが各 mutation の `isPending` を返す（`isAddingTask`, `isUpdatingTask`, `isDeletingTask`, `isAddingCategory`, `isUpdatingCategory`, `isDeletingCategory`）。
