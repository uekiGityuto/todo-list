# ディレクトリ構成の未決定事項

## 概要

`docs/specs/directory-structure.md` の WIP 部分を確定させる。

## 未決定事項

- モデル定義方法（type/interface vs class）→ [005-task-model-definition.md](./005-task-model-definition.md) の決定に依存
- `types/` vs `models/` のディレクトリ名
- `use-local-storage.ts` を汎用フックとして切り出すかどうか

## 決定事項

- **type/interface を採用** → `src/types/` に配置
- **ユニオン型定数** → `src/enums/` に配置（`task-statuses.ts`, `work-results.ts`）
- **`use-local-storage.ts` を切り出す** → DB 移行時の差し替えを容易にするため

## ステータス

対応済み → `docs/specs/directory-structure.md` を更新
