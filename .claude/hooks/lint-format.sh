#!/usr/bin/env bash
# PostToolUse hook: ファイル種別に応じた lint/format を自動実行（編集ファイルのみ）
#
# 出力仕様:
#   - exit 0 のみ: 問題なし
#   - exit 0 + JSON stdout: additionalContext で Claude にフィードバック
#
# ※ set -euo pipefail は使わない。lint 等は違反検出時に非ゼロで終了するため、
#   || true で個別にハンドリングしている。

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # Biome: format + organizeImports
    pnpm exec biome check --write "$file_path" >/dev/null 2>&1 || true

    # Oxlint: auto-fix + type-aware linting + type-check
    pnpm exec oxlint --type-aware --type-check --fix "$file_path" >/dev/null 2>&1 || true

    # Oxlint: 残存エラーの検出（型エラー含む）
    DIAG=$(pnpm exec oxlint --type-aware --type-check "$file_path" 2>&1 | head -30) || true

    if echo "$DIAG" | grep -qE 'Found [1-9]'; then
      jq -n --arg ctx "$DIAG" '{
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: $ctx
        }
      }'
    fi
    ;;
  *.css|*.json|*.md|*.yml|*.yaml)
    # Biome: format のみ
    pnpm exec biome format --write "$file_path" >/dev/null 2>&1 || true
    ;;
esac

exit 0
