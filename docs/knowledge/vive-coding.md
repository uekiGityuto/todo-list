# vive-codingのKnowledge

## 前提

今回、自分では実装せず、Claude Codeに実装してもらったので、そのときのポイントやコツをまとめる。

## 要件定義

1. Notionのプロダクトデザインのテンプレートを使って、超簡易にまとめた。ターゲットや現状の課題、解決策の方向性などをざっくりと。
   https://www.notion.so/30d579901b7d801fb198dc2e41490db1?source=copy_link

2. Desktop版のClaudeにそれを読ませて、要件定義書を作りたいので、協力してとお願いした。Claudeからの質問に答える形で、要件をブラッシュアップ。最終的にMarkdown形式でドキュメント化してもらった。技術スタックもこの段階で決めた。
   https://claude.ai/share/d8321fca-0894-4cd5-8a18-e08531d262a8

作成してもらったドキュメントがこれ（作業しながら修正したので、最初の状態からは少し変わっている）
[task-management-plan.md](docs/task-management-plan.md)

## セットアップ

基本的にはこのドキュメントの内容通りにセットアップ。
[SETUP.md](/docs/SETUP.md)

試しにdevcontainerを立ち上げたけど、pencil.devが使えなかったので、結局実装はローカル環境（ホスト環境）でやったので、意味なかった。
skillsのui-ux-pro-maxとvercel-react-best-practicesを入れてみた。

## デザイン

[pencil.md](/docs/knowledge/pencil.md)参照

## コーディング

1. 共通定義（スタイル定義や共通コンポーネント）を実装
   - ショーケースページを作って目視確認すると良い
   - lint・ビルド・best practicesチェックもこの段階で
2. デザインからページごとの実装仕様書を作成
   - コンポーネント構成、状態、インタラクション、データ要件を整理
   - ディレクトリ構成やデータアクセスの方針も先に決めておく
3. ドメインモデルを洗い出して、型定義を実装
4. ページごとに実装
