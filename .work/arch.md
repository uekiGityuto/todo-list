これまでの会話（Harnesses Engineering視点でのフロントエンド + バックエンドアーキテクチャ検討）を、**Coding Agent前提** で整理します。

### 1. 全体の前提・目標
- **Coding Agentにほぼ全てのコーディングを任せる**（人間はハーネス役）。
- **Harnesses Engineering**（Martin Fowlerの考え方）：  
  - **Feedforward**（事前誘導）：構造・規約・AGENTS.mdでAgentが正しい場所に正しく書けるようにする。
  - **Feedback**（早期検知）：Lint、構造チェック、テスト（Shift-Left重視）で即座に違反を検知・修正。
- 重視ポイント：**テストの書きやすさ**、**責務の明確さ**、**Shift-Left（早い段階での問題検知）**。
- 規模：**そこまで大きくない**（小〜中規模）。
- 追加要件：**モバイル対応の可能性あり** → サーバロジックをWebとモバイルで共有したい。

### 2. フロントエンド（Web）側の結論
- **フレームワーク**：Next.js（App Router） + TypeScript（strict）。
- **アーキテクチャ**：**Feature-Sliced Design (FSD) v2.1 + Pages-first**。
  - 理由：Agent向けスキル（feature-sliced/skills）が充実。レイヤー（shared → entities → features → widgets → pages → app）で依存方向が明確。Pages-firstはNext.js App Routerと相性が抜群で、機能単位でコードをまとめやすい。
  - ディレクトリ：`src/pages/xxx/`（ui / model / apiなど）中心に垂直にまとめる。
  - Server側：**Server Components + Server Actionsは最小限**（モバイル対応を考慮して避ける方向）。
- **ハーネス強化**：AGENTS.md + Steiger（FSD専用リンター） + ESLint（境界チェック） + テスト（Playwrightなど）。

**FSDの特徴**：レイヤーによる依存制御 + スライス（機能単位） + セグメント（ui/modelなど）。フロントエンドの大規模化・長期保守を意識した体系的な方法論。

### 3. バックエンド（API）側の結論
- **フレームワーク**：**Hono**（軽量・柔軟・Edge対応が良い）。
- **アーキテクチャ**：**Vertical Slice（垂直スライス）中心**（シンプル版）。
  - 理由：小規模なので、Hono公式の`app.route()`を使った「機能ごと垂直にまとめる」アプローチがフィット。ボイラープレートが少なく、責務が明確。
  - 推奨構造（apps/api/src/）：
    ```
    routes/
    └── user/                  # 垂直スライス（1機能 = ほぼ1フォルダ）
        ├── index.ts           # ルートまとめ
        ├── handler.ts         # 薄いHTTP層（検証 → service呼び出し）
        ├── service.ts         # ビジネスロジック + DBアクセス
        └── schema.ts          # Zod
    ```
    - グローバル：middleware/、lib/prisma.ts、sharedパッケージ（共通Zod/schema/entities）。
- **DB**：Prisma（予定）。
  - DBアクセス：基本的に**service.tsから直接Prisma**（シンプル）。
  - 複雑なスライスだけRepositoryパターンを部分導入（依存性逆転）。

**Vertical Sliceの特徴**：機能（use case）ごとに垂直に切る（API〜ロジック〜DB）。スライス内でアーキテクチャの厚さを柔軟に変えられる。FSDの「スライス」部分と思想が近いが、レイヤー制御は緩め。

### 4. FSD vs Vertical Slice の違い（整理）
- **共通点**：どちらも「機能（feature）中心」で、従来の水平レイヤー（技術ごと）より変更の局所性が高い。
- **違い**：
  - **FSD**：レイヤー（依存方向厳格） + スライス + セグメントのハイブリッド。フロントエンド向けに体系化され、Agentスキルが充実。
  - **Vertical Slice**：純粋に「機能ごとに垂直にまとめる」。シンプルで柔軟。スライスごとにアーキテクチャの厚さを変えやすい（小規模に最適）。
- **あなたのプロジェクトでの使い分け**：
  - Web → FSD（Pages-first）で構造をしっかり。
  - API → Vertical Slice（シンプル）で軽く。
  - 全体として「機能単位で考える」思想を共有。

### 5. テスト戦略（Shift-Left重視）
- **純粋ビジネスロジック**（validate、計算、ルールなど）：**単体テストを厚めに**（DB非依存で高速）。
- **DBアクセスを含む部分**：**統合テスト中心**（Hono testClient + テストDB使用）。Prismaは外部モジュールとして信頼し、実DBに近いテストを重視。
- **全体**：コミットフック（Huskyなど）で単体 + 統合を両方回す。モックは最小限（純粋ロジックのみ）。
- 理由：小規模ではフル依存性逆転（Onionスタイル）のオーバーヘッドより、統合テストの信頼性とシンプルさが勝る。Agent生成コードの「実際に動くか」を早く検知しやすい。

### 6. 全体構成（モノレポ推奨）
- Turborepo / pnpm workspacesなどで：
  - `apps/web/`：Next.js + FSD
  - `apps/api/`：Hono + Vertical Slice
  - `apps/mobile/`：React Native（将来的）
  - `packages/shared/`：共通Zod schema、entities、utils
- 型安全：Hono RPC / oRPCなどでWeb ↔ APIの型共有。
- Server Actions：ほぼ使わず、すべてHono APIで統一（モバイル対応を考慮）。

### 7. AGENTS.mdの役割（ハーネスの核）
- Web：FSDスキル適用 + Pages-firstルール + 「Server Actionsは最小限」。
- API：Vertical Sliceルール + 「新機能はroutes/xxx/にまとめて」「Handlerは薄く、serviceでロジック」「純粋ロジックは単体テスト厚め、DBは統合テスト」。
- 共通：Shift-Left徹底、Zod必須、Lint/構造チェック強制。

### まとめ（おすすめの方向性）
- **Web**：FSD（Pages-first）でしっかり構造化 → Agentが迷いにくい。
- **API**：Hono + Vertical Slice（シンプル）で軽く → 小規模にフィットし、テスト・責務が明確。
- **トレードオフ**：Vertical Sliceはコード重複リスクがあるが、小規模なら問題少なく、後で必要に応じて抽出可能。
- **モバイル対応**：API統一で共有ロジックをpackages/shared/に集約 → 将来的にスムーズ。

この整理で全体像がつかめましたか？  
別のAgentに聞くときにコピーしやすいよう、要点だけ簡潔にまとめたバージョンも必要なら作ります。  
または、特定の部分（例：テスト戦略の詳細、ディレクトリ例、AGENTS.mdサンプル）を深掘りしたい点があれば教えてください。  

これをベースにさらに洗練させていきましょう！
