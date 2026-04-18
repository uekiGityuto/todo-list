# ADR-0001: ドメインモデル定義方法

## ステータス

Accepted

## コンテキスト

各ページ実装に入る前に、ドメインモデルの定義方法を決める必要がある。選択肢として type/interface と class（state ラッパーパターン）があった。

## 決定

### エンティティ: type/interface を採用

| 型 | 概要 | 主要フィールド |
|----|------|---------------|
| Task | 中心エンティティ | id, name, categoryId, status, isNext, estimatedMinutes, scheduledDate, createdAt, updatedAt |
| Category | タスク分類 | id, name, color |
| WorkRecord | 作業履歴 | id, taskId, date, durationMinutes, result |
| TimerSession | タイマー実行状態 | taskId, startedAt, estimatedMinutes |

ビジネスロジックはモデルに持たせず、ユーティリティ関数に分離する。

### ユニオン型: `as const` オブジェクト + `keyof typeof`

`enum` は使わず、定数オブジェクトでラベル等のマッピングを持たせる。

| 型 | 値 |
|----|-----|
| TaskStatus | `todo` / `in_progress` / `done` |
| WorkResult | `completed` / `interrupted` |

### 保存用 / コンポーネント用の分離

| 保存用 | コンポーネント用（hooks が返す） |
|--------|--------------------------------|
| Task（categoryId） | TaskWithCategory（category 埋め込み） |
| TimerSession（taskId） | TimerSessionWithTask（task 埋め込み） |

### ファイル配置

- `src/shared/enums/` — TASK_STATUSES, WORK_RESULTS
- `src/shared/types/` — Task, Category, WorkRecord, TimerSession

## 理由

- **type/interface を選んだ理由**: JSON.parseの結果をそのまま使える、React stateのイミュータブル操作と相性が良い、スプレッド構文で簡単にコピー・更新できる、React/Next.jsコミュニティの主流パターン
- **class を選ばなかった理由**: localStorage（JSON.parse）との相性でインスタンス化が必要、Reactのイミュータブルパターンと噛み合わない
- **enum を使わない理由**: `as const` + `keyof typeof` の方がラベル等のメタデータを持たせやすい

## 影響

- 型定義は `src/shared/types/` に集約
- ビジネスロジックは `src/shared/lib/` のユーティリティ関数として実装
