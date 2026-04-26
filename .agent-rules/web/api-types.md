---
paths:
  - "apps/web/src/shared/lib/api/**"
  - "apps/web/src/shared/types/**"
  - "apps/web/src/shared/hooks/**"
  - "apps/web/src/shared/ui/**"
  - "apps/web/src/views/**"
---

# Web API 型ルール

- API レスポンス型と画面用型は分離する
- API クライアント層で `normalizeX` を通して画面用型に変換する
- `hooks` / `views` / `shared/ui` では画面用型を使い、API レスポンス型を直接渡さない
