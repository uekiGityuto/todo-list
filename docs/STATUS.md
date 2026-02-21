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
- ファイアウォール: `allowed-domains.txt` にドメイン追加後、`/usr/local/bin/` にもコピーして `sudo init-firewall.sh` が必要
- GitHub認証: SSHキー未マウント。`gh auth login`（HTTPS）+ `gh auth setup-git` で対応
- Claude Code permissions: ユーザー設定の `deny`/`ask` はプロジェクト設定の `allow` で上書き不可

## 未着手

### Phase 1: コア機能実装
- [ ] pencil.devで画面デザイン作成（ホーム、タスク一覧、タイマー、カレンダー）
- [ ] タスクCRUD（追加・編集・削除・一覧）
- [ ] 「次やる」マーク機能
- [ ] ローカルストレージによるデータ永続化

### Phase 2: タイマー機能
- [ ] カウントダウンタイマー
- [ ] 終了時の継続/完了/中断選択

### Phase 3: カレンダー機能
- [ ] 日付ごとの完了タスク一覧表示

## 次にやること

1. **pencil.devで画面デザイン**を作成（Phase 1の全画面）
2. デザイン完成後、**taktでコード生成→ロジック実装**の流れで進める
