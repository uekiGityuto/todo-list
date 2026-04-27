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
    echo "スキップ: $rel_path（メインリポジトリに存在しない）"
    continue
  fi

  if [ -f "$dest" ]; then
    echo "スキップ: $rel_path（既に存在する）"
    continue
  fi

  ln -s "$src" "$dest"
  echo "リンク作成: $rel_path -> $src"
  linked=$((linked + 1))
done

echo "完了: ${linked}件のシンボリックリンクを作成しました"
