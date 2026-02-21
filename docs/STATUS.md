# プロジェクト進捗

## 完了済み

### Phase 0: 開発環境構築
- [x] devcontainer構築（ファイアウォール、Node.js、pnpm等）
- [x] Next.js 16 + TypeScript + Tailwind CSS セットアップ
- [x] shadcn/ui 初期化
- [x] takt export-cc
- [x] Skills導入（vercel-react-best-practices, ui-ux-pro-max）
- [x] GitHub認証（gh auth login、HTTPS）
- [x] PR作成・マージ済み

### 環境構築時の注意点
- ファイアウォール: `.devcontainer/allowed-domains.txt` にドメイン追加後、rebuild せずに反映するには `/usr/local/bin/` へのコピー + `sudo init-firewall.sh` が必要（rebuildすれば自動反映）
- GitHub認証: SSHキー未マウント。`gh auth login`（HTTPS）+ `gh auth setup-git` で対応。セッションごとに再ログインが必要な場合あり
- Claude Code permissions: ユーザー設定の `deny`/`ask` はプロジェクト設定の `allow` で上書き不可

## 未着手

### Phase 1: デザイン
- [ ] pencil.devで全画面のデザイン作成（ホーム、タスク一覧、タイマー、カレンダー）

### Phase 2: 実装
- [ ] タスクCRUD（追加・編集・削除・一覧）
- [ ] 「次やる」マーク機能 + ホーム画面
- [ ] ローカルストレージによるデータ永続化
- [ ] タイマー機能（カウントダウン、継続/完了/中断選択）
- [ ] カレンダー機能（日付ごとの完了タスク一覧）

## 次にやること

1. **Phase 1**: pencil.devで画面デザイン作成
2. デザイン完成後、**Phase 2**: taktで実装に入る
