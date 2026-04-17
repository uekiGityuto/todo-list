#!/bin/bash
# PostToolUse hook: Edit/Write 後に prettier + eslint を実行

FILE_PATH=$(jq -r '.tool_input.file_path // empty' < /dev/stdin)

# file_path が空またはファイルが存在しない場合はスキップ
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# prettier で format
pnpm exec prettier --write "$FILE_PATH" >/dev/null 2>&1

# JS/TS ファイルの場合は eslint も実行
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx|mjs|cjs)$'; then
  LINT_OUTPUT=$(pnpm exec eslint --fix "$FILE_PATH" 2>&1)
  LINT_EXIT=$?
  if [ $LINT_EXIT -ne 0 ]; then
    echo "$LINT_OUTPUT" >&2
    exit 2
  fi
fi

exit 0
