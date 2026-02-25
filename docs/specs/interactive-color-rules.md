# インタラクティブUI カラールール

ユーザーが操作可能なUI要素の色を5種類に分類し、それぞれにhover色を定義する。

## カラータイプ一覧

| #   | タイプ           | 用途                                                              | デフォルト                | hover                 | CSS変数              |
| --- | ---------------- | ----------------------------------------------------------------- | ------------------------- | --------------------- | -------------------- |
| 1   | **primary**      | 主要アクション（追加、作成、更新）                                | `bg-primary`              | `bg-primary/90`       | `--primary`          |
| 2   | **outline**      | 補助アクション（キャンセル、フィルタチップ、ghost ボタン）        | `bg-transparent` + border | `bg-accent`           | `--accent`           |
| 3   | **surface**      | カード上のアクション（通常タスクのアクションメニュー等）          | `bg-transparent`          | `bg-surface-hover`    | `--surface-hover`    |
| 4   | **primary-soft** | primary系背景上のアクション（次やるタスクのアクションメニュー等） | `bg-transparent`          | `bg-primary-soft`     | `--primary-soft`     |
| 5   | **destructive**  | 危険操作（削除）                                                  | `text-destructive`        | `bg-destructive-soft` | `--destructive-soft` |

## 使い分けの判断基準

- **親の背景色**でhover色を決める
  - 白背景（`bg-background`）→ outline（accent）
  - グレー背景（`bg-card`）→ surface
  - 水色背景（`bg-primary-soft`）→ primary-soft
- **アクションの重要度**で種類を決める
  - メインCTA → primary
  - 補助・キャンセル → outline
  - 削除・危険操作 → destructive

## CSS変数の値（ライトモード）

```css
--primary: #3bade0;
--primary-soft: #3bade020; /* primary の 12% 透過 */
--accent: #3bade015; /* primary の 8% 透過（ghost/outline hover） */
--surface-hover: #e4e4e7; /* border色と同じグレー */
--destructive-soft: oklch(
  0.577 0.245 27.325 / 10%
); /* destructive の 10% 透過 */
```

## 適用例

| UI要素                        | タイプ            |
| ----------------------------- | ----------------- |
| 「+追加」ボタン               | primary           |
| 「キャンセル」ボタン          | outline           |
| FilterChip                    | outline           |
| TaskCard 内アクション項目     | surface           |
| NextTaskCard 内アクション項目 | primary-soft      |
| 「削除」アクション項目        | destructive       |
| Calendar の日付ホバー         | outline（accent） |
