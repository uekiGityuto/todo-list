# ディレクトリ構成

Phase 2-2 の各ページ実装時に、どこに何を置くかの指針。

## 現状（Phase 2-1 完了時点）

```
src/
├── app/
│   ├── globals.css          # テーマ変数
│   ├── layout.tsx           # ルートレイアウト（Inter フォント）
│   └── page.tsx             # ショーケース（仮）
├── components/
│   ├── ui/                  # shadcn/ui（button, badge, dialog, input, label）
│   ├── calendar-cell.tsx    # アプリ固有コンポーネント
│   ├── check.tsx
│   ├── filter-chip.tsx
│   ├── next-task-card.tsx
│   ├── next-task-hero.tsx
│   ├── section-header.tsx
│   ├── sidebar.tsx
│   ├── tab-bar.tsx
│   └── task-card.tsx
└── lib/
    └── utils.ts             # cn() ユーティリティ
```

## Phase 2-2 構成

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx             # ホーム画面（/）
│   ├── tasks/
│   │   └── page.tsx         # タスク一覧（/tasks）
│   ├── timer/
│   │   └── page.tsx         # タイマー（/timer）
│   └── calendar/
│       └── page.tsx         # カレンダー（/calendar）
├── components/
│   ├── ui/                  # shadcn/ui ベース
│   └── *.tsx                # アプリ固有（presentational）
├── enums/
│   ├── task-statuses.ts     # TASK_STATUSES, TaskStatus
│   └── work-results.ts     # WORK_RESULTS, WorkResult
├── hooks/
│   ├── use-tasks.ts         # タスク CRUD 操作
│   ├── use-timer.ts         # タイマーロジック
│   ├── use-work-records.ts  # 作業記録の読み書き
│   └── use-local-storage.ts # localStorage 汎用フック
├── lib/
│   └── utils.ts
└── types/
    ├── task.ts              # Task, Category
    ├── work-record.ts       # WorkRecord
    └── timer.ts             # TimerSession
```

## データアクセスの方針

hooks をデータアクセスの境界とする。コンポーネントはストレージの実装を知らない。

```
コンポーネント → useTasks() → useLocalStorage()（今）
                            → API/DB hooks（将来）
```

- 移行時は hooks の中身だけ差し替える
- `useLocalStorage` を汎用フックとして切り出し、localStorage 操作を集約する
- Repository パターン等の抽象レイヤーは挟まない（hooks 自体が境界）
