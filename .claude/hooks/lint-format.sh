#!/usr/bin/env bash
# PostToolUse hook: ファイル種別に応じた lint/format を自動実行（編集ファイルのみ）
#
# 出力仕様:
#   - exit 0 のみ: 問題なし
#   - exit 0 + JSON stdout: additionalContext で Claude にフィードバック
#
# ※ set -euo pipefail は使わない。lint 違反検出時に非ゼロで終了するため、
#   コマンド実行失敗と lint 違反を分離してハンドリングしている。

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

# ツール存在チェック
for cmd in biome oxlint jq; do
  if ! command -v pnpm >/dev/null 2>&1; then
    jq -n --arg ctx "pnpm が見つかりません。lint/format をスキップしました。" '{
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: $ctx
      }
    }'
    exit 0
  fi
done

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # Biome: format + organizeImports
    BIOME_OUT=$(pnpm exec biome check --write "$file_path" 2>&1)
    BIOME_EXIT=$?
    if [ $BIOME_EXIT -ne 0 ] && ! echo "$BIOME_OUT" | grep -q 'Checked'; then
      jq -n --arg ctx "Biome 実行エラー: $BIOME_OUT" '{
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: $ctx
        }
      }'
      exit 0
    fi

    # Oxlint: auto-fix + type-aware linting + type-check
    FIX_OUT=$(pnpm exec oxlint --type-aware --type-check --fix "$file_path" 2>&1)
    FIX_EXIT=$?
    if [ $FIX_EXIT -ne 0 ] && ! echo "$FIX_OUT" | grep -q 'Found'; then
      jq -n --arg ctx "Oxlint 実行エラー: $FIX_OUT" '{
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: $ctx
        }
      }'
      exit 0
    fi

    # Oxlint: 残存エラーの検出（型エラー含む）
    DIAG=$(pnpm exec oxlint --type-aware --type-check "$file_path" 2>&1 | head -30)
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
    BIOME_OUT=$(pnpm exec biome format --write "$file_path" 2>&1)
    BIOME_EXIT=$?
    if [ $BIOME_EXIT -ne 0 ] && ! echo "$BIOME_OUT" | grep -q 'Formatted'; then
      jq -n --arg ctx "Biome format 実行エラー: $BIOME_OUT" '{
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: $ctx
        }
      }'
    fi
    ;;
esac

exit 0
