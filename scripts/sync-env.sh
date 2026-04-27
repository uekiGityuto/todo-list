#!/bin/bash
# worktree 環境にメインリポジトリの .env ファイルをシンボリックリンクするスクリプト
# 使い方: bash scripts/sync-env.sh

set -euo pipefail

# メインリポジトリのルートを取得（worktree からでも本体からでも動く）
main_root="$(git worktree list --porcelain | head -1 | sed 's/^worktree //')"
current_root="$(git rev-parse --show-toplevel)"

# メインリポジトリでは何もしない
if [ "$main_root" = "$current_root" ]; then
  exit 0
fi

# シンボリックリンク対象のファイル
env_files=(
  "apps/api/.env"
  "apps/web/.env.local"
)

linked=0
for rel_path in "${env_files[@]}"; do
  src="$main_root/$rel_path"
  dest="$current_root/$rel_path"

  if [ ! -f "$src" ]; then
    echo "スキップ: ${rel_path}（メインリポジトリに存在しない）"
    continue
  fi

  if [ -L "$dest" ]; then
    linked_target="$(readlink "$dest")"
    if [ "$linked_target" = "$src" ]; then
      echo "スキップ: ${rel_path}（既に正しいリンクが存在する）"
      continue
    fi

    echo "スキップ: ${rel_path}（別のシンボリックリンクが存在する）"
    continue
  fi

  if [ -e "$dest" ]; then
    echo "スキップ: ${rel_path}（既に存在する）"
    continue
  fi

  if ln -s "$src" "$dest" 2>/dev/null; then
    echo "リンク作成: ${rel_path} -> ${src}"
    linked=$((linked + 1))
    continue
  fi

  if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
    echo "スキップ: ${rel_path}（並列実行中に正しいリンクが作成された）"
    continue
  fi

  echo "スキップ: ${rel_path}（リンク作成に失敗した）"
done

echo "完了: ${linked}件のシンボリックリンクを作成しました"
