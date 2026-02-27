# 設定画面 仕様

## パス

`/settings`

## 概要

カテゴリの管理（追加・編集・削除）を行う設定画面。

## レイアウト

### モバイル

```
[statusBar]
[header]              ← "設定" タイトル（24px, bold）
[content]
  [categorySection]
    [sectionHeader]   ← "カテゴリ"（16px, bold）
    [categoryList]    ← カード内にカテゴリ一覧（セパレータ区切り）
    [addButton]       ← "＋ カテゴリを追加" Ghost ボタン
[TabBar]              ← activeTab="settings"
```

### PC

```
[Sidebar activeItem="settings"] | [mainArea]
                                |   [header]  ← "設定"（24px, bold）
                                |   [content]
                                |     [categorySection (w=480)]
                                |     [editPanel (w=400)]  ← 追加/編集時のみ表示
```

## 使用コンポーネント

| コンポーネント       | 用途                                 |
| -------------------- | ------------------------------------ |
| `SectionHeader`      | "カテゴリ" 見出し                    |
| `TabBar` / `Sidebar` | ナビゲーション                       |
| `Button` (Ghost)     | カテゴリ追加ボタン（+ アイコン付き） |
| `Button` (Primary)   | 追加/保存ボタン                      |
| `Button` (Outlined)  | キャンセルボタン                     |
| `Input`              | カテゴリ名入力フィールド             |

## カテゴリ一覧

- カード（`bg-card`, `rounded-radius`）内にリスト表示
- 各アイテム: カラードット（12px 丸）+ カテゴリ名（14px）+ 編集アイコン（pencil, 16px）+ 削除アイコン（trash-2, 16px）
- アイテム間: `border` 色の 1px セパレータ
- アイテム padding: `[14, 16]`
- アイコン色: `text-muted-foreground`
- アイコン間 gap: 12

## カテゴリ追加/編集パネル

### PC

- カテゴリ一覧の右側に editPanel（w=400）として表示
- カード（`bg-card`, `rounded-radius`, padding 24）
- gap: 24

### モバイル

- モーダル表示（`bg-overlay` 背景）

### パネル内容

- タイトル: "カテゴリ追加" or "カテゴリ編集"（16px, bold）
- カテゴリ名フィールド:
  - ラベル: "カテゴリ名 \*"（12px, semibold）
  - Input: 高さ 44px, `rounded-12`, `bg-background`, placeholder "カテゴリ名を入力"
- カラーフィールド:
  - ラベル: "カラー"（12px, semibold）
  - カラーグリッド: 10色の丸（32px）、gap 12
  - 選択色: `primary` 色の 2px ボーダー
  - カラー一覧: `#3B82F6`, `#22C55E`, `#F97316`, `#EF4444`, `#EC4899`, `#A855F7`, `#F43F5E`, `#14B8A6`, `#6366F1`, `#FACC15`（`category-select.tsx` の `CATEGORY_COLORS` と同一）
- ボタン: キャンセル（Outlined）+ 追加/保存（Primary）、gap 12

## インタラクション

| 操作                    | 動作                                               |
| ----------------------- | -------------------------------------------------- |
| 「＋ カテゴリを追加」   | 追加パネルを表示（PC: 右側 / モバイル: モーダル）  |
| 編集アイコン（pencil）  | 編集パネルを表示（該当カテゴリの情報をプリセット） |
| 削除アイコン（trash-2） | 確認ダイアログ後にカテゴリ削除                     |
| キャンセルボタン        | パネル/モーダルを閉じる                            |
| 追加/保存ボタン         | カテゴリを保存してパネル/モーダルを閉じる          |
| TabBar / Sidebar        | ページ遷移                                         |

## 状態

### 通常状態

- カテゴリ一覧のみ表示（PC の editPanel は非表示）

### 追加/編集中（PC）

- カテゴリ一覧の右側に editPanel を表示

### 追加/編集中（モバイル）

- モーダルで追加/編集フォームを表示

### カテゴリなし（空状態）

- カテゴリ一覧が空の場合、「＋ カテゴリを追加」ボタンのみ表示

## データ要件

- `useTasks` フックの `categories` と `addCategory` を使用
- 編集・削除は `useTasks` に `updateCategory`, `deleteCategory` を追加する必要あり

### useTasks への追加が必要な関数

| 関数             | シグネチャ                                          |
| ---------------- | --------------------------------------------------- |
| `updateCategory` | `(id: string, name: string, color: string) => void` |
| `deleteCategory` | `(id: string) => void`                              |

## 実装時の考慮事項

### カテゴリ削除時の影響

- 紐づくタスクがある場合、確認ダイアログを表示:
  - 「このカテゴリに紐づいているタスクがあります。カテゴリを削除すると該当タスクのカテゴリは未分類になります。よろしいですか？」
- 確認後、該当タスクの `categoryId` を空文字（未分類）に変更してからカテゴリを削除
- 紐づくタスクがない場合は確認なしで即削除

### オーバーレイ

- モーダル等の浮き要素には `bg-overlay`（`#00000040`）を適用

## デザイン参照（pencil nodeId）

| 画面                 | nodeId  |
| -------------------- | ------- |
| Mobile - Settings    | `5ZSZt` |
| PC - Settings        | `UkbrM` |
| PC - Settings (Edit) | `ojdiy` |
