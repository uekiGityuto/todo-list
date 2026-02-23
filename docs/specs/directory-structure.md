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

## Phase 2-2 想定（WIP）

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
├── hooks/
│   ├── use-tasks.ts         # タスク CRUD 操作
│   ├── use-timer.ts         # タイマーロジック
│   ├── use-work-records.ts  # 作業記録の読み書き
│   └── use-local-storage.ts # localStorage 汎用フック（？）
├── lib/
│   └── utils.ts
└── types/                   # ← モデル定義方法次第で変わる（後述）
```

### types/ の構成案

**A: type/interface の場合**

```
types/
├── task.ts           # Task, Category の型定義
├── work-record.ts    # WorkRecord の型定義
├── timer.ts          # TimerSession の型定義
└── constants.ts      # TASK_STATUSES, WORK_RESULTS 等
```

**B: class の場合**

```
models/               # types/ ではなく models/ にする？
├── task.ts           # Task クラス + TaskState 型
├── category.ts       # Category クラス + CategoryState 型
├── work-record.ts    # WorkRecord クラス + WorkRecordState 型
├── timer-session.ts  # TimerSession クラス
└── constants.ts      # TASK_STATUSES, WORK_RESULTS 等
```

## データアクセスの方針

hooks をデータアクセスの境界とする。コンポーネントはストレージの実装を知らない。

```
コンポーネント → useTasks() → localStorage（今）
                            → API/DB（将来）
```

- 移行時は hooks の中身だけ差し替える
- Repository パターン等の抽象レイヤーは挟まない（hooks 自体が境界）
