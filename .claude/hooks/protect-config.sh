#!/bin/bash
# PreToolUse hook: リンター/フォーマッター設定ファイルの改竄を防止

FILE_PATH=$(jq -r '.tool_input.file_path // empty' < /dev/stdin)

PROTECTED="biome.json oxlint lefthook.yml tsconfig.json"
for p in $PROTECTED; do
  if echo "$FILE_PATH" | grep -qF "$p"; then
    echo "設定ファイル ($p) の変更は禁止されています。変更が必要な場合はユーザーに確認してください。" >&2
    exit 2
  fi
done

exit 0
