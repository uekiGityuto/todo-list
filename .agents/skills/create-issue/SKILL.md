---
name: create-issue
description: "GitHub issue を作成する。issue 作成、タスク起票、バグ報告などで使用する。"
allowed-tools: Bash(gh:*)
---

# Issue 作成

## テンプレート

`.github/ISSUE_TEMPLATE/task.yml` のフォーマットに従って issue を作成する。

## ラベル

作成時に以下のいずれかのラベルを必ず付ける。

| ラベル | 条件 |
|---|---|
| `ready` | 要件・参照資料・確認方法が明確で、追加の議論なく実装に入れる |
| `needs-refinement` | 要件が曖昧、設計判断が必要、または情報が不足している |

## ユーザーの依頼の性質を反映する

ユーザーの依頼をそのまま確定要件として書かない。依頼の性質に応じて issue の内容とラベルを合わせる。

- 「〜を実装して」「〜を追加して」→ 確定タスク。具体的な要件を書き、`ready` ラベル
- 「〜を検討して」「〜を調査して」「〜するかどうか判断して」→ 検討タスク。検討ポイントを書き、`needs-refinement` ラベル

## コマンド例

```bash
gh issue create --title "タイトル" --body "本文" --label "ready"
```
