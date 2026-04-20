---
name: create-issue
description: "GitHub issue を作成する。issue 作成、タスク起票、バグ報告などで使用する。"
allowed-tools: Bash(gh:*)
---

# Issue 作成

## テンプレート

`.github/ISSUE_TEMPLATE/task.yml` のフォーマットに従って issue を作成する。

## ラベル

作成時に以下のラベルを必ず付ける。

| ラベル | 条件 |
|---|---|
| `ready` | 要件・参照資料・確認方法が明確で、追加の議論なく実装に入れる |
| `needs-refinement` | 要件が曖昧、設計判断が必要、または情報が不足している |

## コマンド例

```bash
gh issue create --title "タイトル" --body "本文" --label "ready"
```
