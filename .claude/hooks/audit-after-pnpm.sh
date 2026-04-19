#!/bin/bash
# PostToolUse hook: pnpm install/add/update 後に本番依存の脆弱性チェック

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

if ! echo "$COMMAND" | grep -qE 'pnpm\s+.*\b(install|i|add|update|up)\b'; then
  exit 0
fi

RESULT=$(pnpm audit --prod 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "[pnpm audit] 本番依存に脆弱性が見つかりました:" >&2
  echo "$RESULT" >&2
  echo "" >&2
  echo "脆弱性の内容をユーザーに報告し、対応方針を相談してください。" >&2
  exit 2
fi
