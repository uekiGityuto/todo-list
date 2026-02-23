#!/bin/bash
# PreToolUse hook: main ブランチでの git 操作をブロック

branch=$(git branch --show-current 2>/dev/null)
if [ "$branch" != "main" ]; then
  exit 0
fi

# stdin から JSON を読み取り
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

if echo "$COMMAND" | grep -qE '^git (add|commit|stash|rebase|reset|cherry-pick)'; then
  echo 'mainブランチでのgit操作は禁止です。featureブランチを作成してください。' >&2
  exit 2
fi
