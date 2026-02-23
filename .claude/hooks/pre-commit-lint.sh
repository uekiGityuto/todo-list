#!/bin/bash
# PreToolUse hook: git commit 前にステージング済みの ts/tsx ファイルがあれば lint を実行

# stdin から JSON を読み取り
INPUT=$(cat)

# tool_input.command を取得
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# git commit コマンドかどうかチェック
if ! echo "$COMMAND" | grep -q 'git commit'; then
  exit 0
fi

# ステージング済みの ts/tsx ファイルがあるかチェック
staged=$(git diff --cached --name-only 2>/dev/null | grep -E '\.(ts|tsx)$')
if [ -z "$staged" ]; then
  exit 0
fi

# lint 実行
if ! pnpm lint 2>&1; then
  echo 'lint エラーがあります。修正してからコミットしてください。' >&2
  exit 2
fi
