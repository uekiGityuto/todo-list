# タスク一覧画面 仕様

## パス

`/tasks`

## 概要

タスクの CRUD とフィルタリング。「次やる」マークの付与もここから行う。

## レイアウト

### モバイル

```
[header]              ← "タスク" タイトル + 「+追加」ボタン
[filters]             ← FilterChip: すべて / 未完了 / 完了済み
[categoryFilters]     ← カテゴリ別フィルタ（ドット付き）
[taskList]
  [NextTaskCard]      ← 「次やる」タスク（先頭に表示）
  [TaskCard] x N      ← 通常タスク
[TabBar]              ← activeTab="tasks"
```

### PC

```
[Sidebar activeItem="tasks"] | [mainArea]
                             |   [header + 追加ボタン]
                             |   [filters + categoryFilters]
                             |   [NextTaskCard]
                             |   [TaskCard x N]
```

## 使用コンポーネント

| コンポーネント       | 用途                                         |
| -------------------- | -------------------------------------------- |
| `Button`             | 「+追加」ボタン（primary, アイコン: Plus）   |
| `FilterChip`         | ステータスフィルタ（すべて/未完了/完了済み） |
| `FilterChip`（拡張） | カテゴリフィルタ（カラードット付き）         |
| `NextTaskCard`       | 「次やる」タスクの強調表示                   |
| `TaskCard`           | 通常タスクカード                             |
| `Check`              | TaskCard 内のチェックボックス                |
| `Dialog`             | タスク追加/編集モーダル、アクションメニュー  |
| `Input` / `Label`    | タスク追加フォーム内                         |
| `TabBar` / `Sidebar` | ナビゲーション                               |

## 状態

### 通常状態

- タスクが存在 → フィルタ + リスト表示
- 「次やる」タスクあり → `NextTaskCard` をリスト先頭に表示

### 空状態

- タスクなし → 空メッセージ + 「タスクを追加する」ボタン
  - アイコン: `clipboard-list`（48px）
  - "タスクがありません"（16px, semibold）
  - "新しいタスクを追加しよう"（14px, muted）

### フィルタ

| フィルタ | 表示対象                           |
| -------- | ---------------------------------- |
| すべて   | 全タスク                           |
| 未完了   | ステータスが「未着手」or「作業中」 |
| 完了済み | ステータスが「完了」               |

カテゴリフィルタは AND 条件で絞り込み。

## インタラクション

| 操作                    | 動作                           |
| ----------------------- | ------------------------------ |
| 「+追加」ボタン         | タスク追加モーダル表示         |
| FilterChip タップ       | ステータスでフィルタ           |
| カテゴリフィルタ タップ | カテゴリでフィルタ             |
| TaskCard chevron        | アクションメニュー表示         |
| NextTaskCard chevron    | 「次やる」用アクションメニュー |
| Check タップ            | タスクを完了にする             |

### タスク追加モーダル

- タスク名（必須）
- カテゴリ（任意、ドロップダウン選択 + 新規作成）
- 予定日（任意）
- 見積もり時間（任意）

### アクションメニュー（通常タスク）

- 次やるに設定
- 作業を始める
- 編集する
- 削除する

### アクションメニュー（「次やる」タスク）

- 作業を始める
- 次やるを解除
- 編集する
- 削除する

## 実装時の考慮事項

### カテゴリフィルタの横スクロール

- カテゴリ数が画面幅を超える場合、横スクロールで対応
- `overflow-x-auto` + `flex-nowrap` でチップ型フィルタを横並び
- スクロールバーは非表示にする（`::-webkit-scrollbar` 等）
- 右端にフェード表示を入れて「まだある」ことを示す

### タスクアクションのアコーディオン展開

- TaskCard の chevron タップ → ボトムシートではなくカード直下にアクション一覧をアコーディオン展開
- 閉じた状態: `chevron-down`、開いた状態: `chevron-up`
- 同時に開けるカードは **1つのみ**（他を開くと前のは閉じる）
- 削除タップ → 確認ダイアログを表示

### オーバーレイ

- モーダル・ボトムシート等の浮き要素には `bg-overlay`（`#00000040`）を適用

## データ要件

- 全タスク一覧
- カテゴリ一覧（フィルタ用）
- 「次やる」フラグ

## デザイン参照（pencil nodeId）

| 画面                                | nodeId  |
| ----------------------------------- | ------- |
| Mobile - Tasks                      | `EsDrU` |
| Mobile - Tasks (Empty)              | `jkSfI` |
| Mobile - Tasks (Action Open)        | `TFwgm` |
| Mobile - Tasks (Next Action Open)   | `xNFA2` |
| Mobile - Add Task                   | `N6Z8D` |
| Mobile - Add Task (Category)        | `HjdlO` |
| Mobile - Add Task (Category Create) | `iF5AW` |
| Mobile - Add Category               | `mZEMI` |
| PC - Tasks                          | `xzsWL` |
| PC - Tasks (Empty)                  | `gUgBx` |
| PC - Add Task                       | `i1bFM` |
| PC - Task Action                    | `H0gBR` |
| PC - Next Task Action               | `prLMX` |
