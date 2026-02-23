# ドメインモデルの定義方法

## 概要

Phase 2-2 の各ページ実装に入る前に、ドメインモデルの定義方法を決める。
現状コンポーネントは props で個別の値を受け取っており、統一的なモデル型がない。

## ドメイン型一覧

### エンティティ → type/interface or class（未決定）

| 型 | 概要 | 主要フィールド |
|---|---|---|
| **Task** | 中心エンティティ | id, name, categoryId, status, isNext, estimatedMinutes, scheduledDate, createdAt, updatedAt |
| **Category** | タスク分類（独立管理） | id, name, color |
| **WorkRecord** | 作業履歴（カレンダー用） | id, taskId, date, durationMinutes, result |
| **TimerSession** | タイマー実行状態（localStorage） | taskId, startedAt, estimatedMinutes |

### ユニオン型 → `as const` オブジェクト + `keyof typeof`（決定済み）

`enum` は使わず、定数オブジェクトでラベル等のマッピングを持たせる。

| 型 | 値 |
|---|---|
| **TaskStatus** | `todo` / `in_progress` / `done` |
| **WorkResult** | `completed` / `interrupted` |

```ts
const TASK_STATUSES = {
  todo: { label: "未着手" },
  in_progress: { label: "作業中" },
  done: { label: "完了" },
} as const
type TaskStatus = keyof typeof TASK_STATUSES
```

## エンティティの定義方法：選択肢

### A: type / interface

- JSON.parse() の結果をそのまま型アサーションで使える
- React の state 管理（イミュータブル操作）と相性が良い
- スプレッド構文で簡単にコピー・更新できる
- React / Next.js コミュニティの主流パターン

### B: class（state ラッパーパターン）

- クラスが `readonly state: State` としてプレーンオブジェクトを保持
- `state` はそのまま JSON.stringify/parse 可能（シリアライズ問題なし）
- 復元時は `new Task(parsedState)` でインスタンス化
- メソッドでビジネスロジックをカプセル化できる（例: `task.isOverdue()`）
- ユーザーの過去プロジェクトではこのパターンを採用

```ts
type TaskState = {
  id: string
  name: string
  status: TaskStatus
  // ...
}

export class Task {
  readonly state: TaskState
  constructor(data: TaskState) {
    this.state = data
  }
  isOverdue(): boolean { /* ... */ }
}
```

## 検討ポイント

- localStorage との相性（JSON.parse の戻り値はプレーンオブジェクト）
- React state のイミュータブル更新パターンとの整合性
- ビジネスロジックの置き場所（モデル内 vs ユーティリティ関数）
- 将来的な DB 移行（Supabase 等）への影響

## ステータス

未検討 → 別セッションで決定する
