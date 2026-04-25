---
paths:
  - "apps/web/src/**/*.test.*"
  - "apps/api/src/**/*.test.*"
---

# テスト記述ルール

## テスト名は日本語で書く

- `describe` / `it` のテスト名は日本語で記述する
- ただし `describe` に関数名・フック名をそのまま書く場合は英語のまま可（例: `describe("useTimer", ...)`）
- API テストの HTTP メソッド + パスも英語のまま可（例: `describe("GET /tasks", ...)`）
