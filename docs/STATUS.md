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

## 進行中

### Phase 1: デザイン
- [x] pencil.devで全画面のデザイン作成（ホーム、タスク一覧、タイマー、カレンダー）
  - デザインファイル: `designs/todo-app.pen`
  - テーマ変数でカラー管理（$primary, $card, $text 等）
  - 再利用コンポーネント: Button, Check, Badge, Filter, TabBarItem, SectionHeader, TaskCard, NextTaskHero, CalendarCell
  - モバイル4画面 + PC1画面
- [x] カレンダー改善
  - Google Calendar風にセル内にタスク名表示（長いテキストは切り捨て）
  - CalendarCellコンポーネント化（日付 + タスク2行スロット）
  - 枠線追加（border-collapse方式: gridBodyにfill=$border + gap:1）
  - 「作業記録」として位置付け変更（完了+作業中タスクを同列表示）
  - 日の詳細で完了/作業中をチェックアイコンで区別
- [ ] **ユーザーフロー設計**（未設計の操作フロー）
- [ ] フローに基づくUI調整

#### 未設計のユーザーフロー（次セッションで対応）

以下の操作フローが未定義。大まかなフロー案を作成し、ユーザーの確認を得た上でUIに反映する。

1. **タスク追加**: 追加画面/UIが未設計
2. **「次やる」設定**: どの画面でどう操作して「次やる」マークを付けるか
3. **作業開始**: 「次やる」以外のタスクから作業を始める手段がない
4. **作業中→完了**: 始めた作業を完了ステータスにする操作
5. **作業中→中断**: 終わらなかった作業を中断する操作
6. **タイマーとの連携**: 作業開始でタイマーに遷移？タイマー終了時の選択肢は？

## 未着手

### Phase 2: 実装
- [ ] タスクCRUD（追加・編集・削除・一覧）
- [ ] 「次やる」マーク機能 + ホーム画面
- [ ] ローカルストレージによるデータ永続化
- [ ] タイマー機能（カウントダウン、継続/完了/中断選択）
- [ ] カレンダー機能（作業記録：完了+作業中タスクの日別一覧）

### 将来対応
- [ ] PIPタイマー（Picture-in-Picture）: タスク作業中に右上等にフローティング表示。ブラウザのPIP APIまたはフローティングウィンドウで実現

## 次にやること

1. **ユーザーフロー設計**: タスクのライフサイクル（追加→次やる設定→作業開始→完了/中断）の大まかなフロー案を作成
2. フロー確定後、UIデザインを調整（`designs/todo-app.pen`）
3. **Phase 2**: taktで実装に入る
