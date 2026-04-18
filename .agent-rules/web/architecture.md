# アーキテクチャ: FSD Lite (Feature-Sliced Design v2.1 簡略版)

FSD v2.1 の "Pages First" 思想をベースに、このプロジェクトの規模に合わせて簡略化。

> `views/` は FSD の pages 層に相当する。Next.js の `src/pages/` 予約名との衝突を避けるためリネーム。

## レイヤー構成

> 以下の `src/` は `apps/web/src/` を指す。

```
src/
  app/                    # Next.js App Router（ルーティングのみ、薄く保つ）
    page.tsx              # → views/home を呼ぶだけ
    tasks/page.tsx        # → views/tasks を呼ぶだけ
    ...

  views/                  # FSD pages層: ページ単位の実装
    home/
      ui/                 # ページ固有のコンポーネント
      index.ts            # Public API
    tasks/
      ui/
      hooks/              # ページ固有のフック
      index.ts
    ...                   # 他のページも同様の構造

  shared/                 # FSD shared層: 共通基盤
    ui/
      shadcn/             # shadcn/ui（自動生成）
      sidebar.tsx         # アプリ共有コンポーネント
      ...
    hooks/                # 共通フック（use-local-storage 等）
    lib/                  # ユーティリティ（utils, format-* 等）
    types/                # 共通型定義
    enums/                # 列挙型
    constants/            # 定数
```

## 依存方向（厳守）

```
app/ → views/ → shared/
```

- 上位レイヤーは下位のみ import 可能。逆方向禁止
- views 同士の cross-import 禁止（共通ロジックは shared/ に置く）

```typescript
// ✅ OK
// views/tasks/ui/task-list.tsx
import { Button } from "@/shared/ui/shadcn/button";
import type { Task } from "@/shared/types/task";

// ❌ NG: views 同士の import
// views/home/ui/home-page.tsx
import { TaskCard } from "@/views/tasks/ui/task-card";
// → TaskCard を shared/ui/ に移動するか、views/home/ にコピーを作る
```

## ファイル配置の判断基準

1. **1つのページでしか使わない** → そのページの `views/xxx/` に置く
2. **2つ以上のページで使う** → `shared/` に置く
3. **ビジネスロジックなし（純粋なUI/ユーティリティ）** → `shared/` に置く

迷ったらまず `views/` に置く。後から `shared/` に抽出すればよい。

## app/ ディレクトリのルール

Next.js App Router のファイルのみ置く。ビジネスロジックやUIコンポーネントの実装は書かない。

```typescript
// ✅ app/tasks/page.tsx — 薄いエントリポイント
import { TasksPage } from "@/views/tasks";
export default function Page() {
  return <TasksPage />;
}

// ❌ app/tasks/page.tsx にロジックやUIを直接書く
export default function Page() {
  const { tasks, addTask } = useTasks();
  return <div>{ /* 大量のJSX */ }</div>;
}
```

## Public API (index.ts)

各 views スライスは `index.ts` で公開インターフェースを定義する。外部からは `index.ts` 経由でのみ import する。

```typescript
// ✅ views/tasks/index.ts
export { TasksPage } from "./ui/tasks-page";

// ✅ 外部からの import
import { TasksPage } from "@/views/tasks";

// ❌ 内部ファイルを直接 import
import { TasksPage } from "@/views/tasks/ui/tasks-page";
```

## 現在使わないレイヤー

以下の FSD レイヤーは現時点では不要。必要になった時に追加する。

- **features/**: ユーザーアクション（2つ以上のページで再利用する場合に検討）
- **entities/**: ビジネスドメインモデル（型定義は shared/types/ で十分）
- **widgets/**: 大きな複合UIブロック（現状の規模では不要）
