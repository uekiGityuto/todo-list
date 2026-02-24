# devcontainerのKnowledge

## Setup

[SETUP.md](/docs/SETUP.md)

## 注意点

### ファイアウォール

`.devcontainer/allowed-domains.txt` にドメイン追加後、rebuild せずに反映するには `/usr/local/bin/` へのコピー + `sudo init-firewall.sh` が必要（rebuildすれば自動反映）。
また、冪等にしておかないと失敗するので注意（詳細はinit-firewall.shのコメント参照）

### GitHub認証

SSHキー未マウント。`gh auth login`（HTTPS）+ `gh auth setup-git` で対応。rebuildごとに再ログインが必要

### pencil.dev

現状、pencil.devがdevcontainerで使えない（おそらく今後対応すると思われる）
