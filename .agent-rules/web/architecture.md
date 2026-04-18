# Web ルール

FSD Lite（Feature-Sliced Design v2.1 簡略版）。

## 依存方向（厳守）

```
app/ → views/ → shared/
```

- 上位レイヤーは下位のみ import 可能。逆方向禁止
- views 同士の cross-import 禁止（共通ロジックは shared/ に置く）

## app/ のルール

- Next.js App Router のファイルのみ置く
- ビジネスロジックやUIコンポーネントの実装を書かない
- views の Public API（index.ts）経由でのみ import する

## views/ のルール

- 各 views スライスは `index.ts` で公開インターフェースを定義する
- 外部からは `index.ts` 経由でのみ import する（内部ファイルを直接 import しない）

## ファイル配置の判断基準

1. **1つのページでしか使わない** → `views/xxx/` に置く
2. **2つ以上のページで使う** → `shared/` に置く
3. 迷ったらまず `views/` に置く。後から `shared/` に抽出すればよい

## データフェッチ

- 初期データ取得: Server Components で API を fetch し、props で Client Component に渡す
- ミューテーション・再フェッチ: TanStack Query + Hono RPC クライアント（`hc<AppType>`）
- useEffect でデータフェッチしない（TanStack Query を使う）

## 現在使わないレイヤー

features/, entities/, widgets/ は現時点では不要。必要になった時に追加する。
