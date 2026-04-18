# ADR-0002: ディレクトリ構成

## ステータス

Accepted

## コンテキスト

FSD Lite（Feature-Sliced Design v2.1 簡略版）を採用するにあたり、型定義・定数・フックの配置場所を確定する必要があった。

## 決定

- 型定義 → `src/shared/types/` に配置（`models/` ではなく `types/`）
- ユニオン型定数 → `src/shared/enums/` に配置
- `use-local-storage.ts` → `src/shared/hooks/` に汎用フックとして切り出す
- FSD の `pages/` レイヤーを `views/` にリネーム

> FSD Liteの全体構成は `.agent-rules/architecture.md` を参照。

## 理由

- `types/` の方がTypeScriptコミュニティの慣例に沿う（classを使わないため `models/` は不適切）
- `use-local-storage.ts` を切り出すことで、DB移行時の差し替えが容易になる
- `pages/` → `views/` のリネーム: Next.js が `src/pages/` を Pages Router 用に予約しているため。App Router のみ使用しているが、将来の混乱を避ける

## 影響

- `.agent-rules/architecture.md` にディレクトリ構成を反映済み
