#!/usr/bin/env bash

# Codex Stop hook:
# - format/lint only changed files in the worktree
# - limited to file types already covered by this repo's toolchain
# - runs after a turn because current Codex hooks do not intercept Edit/Write

set -u

emit_ok() {
  printf '{"continue":true}\n'
}

emit_message() {
  jq -Rn --arg message "$1" '{continue: true, systemMessage: $message}'
}

emit_block() {
  jq -Rn --arg reason "$1" '{decision: "block", reason: $reason}'
}

for cmd in git jq pnpm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    emit_message "Codex stop hook skipped: required command not found."
    exit 0
  fi
done

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$PROJECT_ROOT" ] || [ ! -d "$PROJECT_ROOT" ]; then
  emit_ok
  exit 0
fi

cd "$PROJECT_ROOT" || {
  emit_message "Codex stop hook skipped: failed to enter repository root."
  exit 0
}

tracked_changed=()
while IFS= read -r line; do
  [ -n "$line" ] && tracked_changed+=("$line")
done < <(git diff --name-only --diff-filter=ACMR HEAD --)

untracked_changed=()
while IFS= read -r line; do
  [ -n "$line" ] && untracked_changed+=("$line")
done < <(git ls-files --others --exclude-standard)

changed_files=()
if [ "${#tracked_changed[@]}" -gt 0 ]; then
  changed_files+=("${tracked_changed[@]}")
fi
if [ "${#untracked_changed[@]}" -gt 0 ]; then
  changed_files+=("${untracked_changed[@]}")
fi

if [ "${#changed_files[@]}" -eq 0 ]; then
  emit_ok
  exit 0
fi

biome_files=()
web_oxlint_files=()

for file_path in "${changed_files[@]}"; do
  [ -f "$file_path" ] || continue

  case "$file_path" in
    .*|*/.*)
      continue
      ;;
  esac

  case "$file_path" in
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.css|*.json|*.md|*.yml|*.yaml)
      biome_files+=("$file_path")
      ;;
  esac

  case "$file_path" in
    apps/web/*.ts|apps/web/*.tsx|apps/web/*.js|apps/web/*.jsx|apps/web/*.mjs|apps/web/*.cjs)
      web_oxlint_files+=("${file_path#apps/web/}")
      ;;
  esac
done

if [ "${#biome_files[@]}" -gt 0 ]; then
  if ! pnpm exec biome check --write "${biome_files[@]}" >/dev/null 2>&1; then
    emit_message "Codex stop hook: Biome failed on changed files."
    exit 0
  fi
fi

if [ "${#web_oxlint_files[@]}" -gt 0 ]; then
  FIX_OUT=$(
    (
      cd "$PROJECT_ROOT/apps/web" &&
        pnpm exec oxlint --type-aware --type-check --fix "${web_oxlint_files[@]}"
    ) 2>&1
  )
  FIX_EXIT=$?
  if [ $FIX_EXIT -ne 0 ] && ! printf '%s' "$FIX_OUT" | grep -q 'Found'; then
    emit_message "Codex stop hook: Oxlint failed while fixing changed web files."
    exit 0
  fi

  DIAG=$(
    cd "$PROJECT_ROOT/apps/web" &&
      pnpm exec oxlint --type-aware --type-check "${web_oxlint_files[@]}" 2>&1
  )
  DIAG_EXIT=$?
  DIAG=$(printf '%s\n' "$DIAG" | head -30)
  if [ $DIAG_EXIT -ne 0 ]; then
    emit_block "Changed web files still have Oxlint errors. Fix them before ending the turn. Relevant output:\n$DIAG"
    exit 0
  fi
fi

emit_ok
