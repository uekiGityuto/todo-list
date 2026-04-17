# CLAUDE.md

共通ルール（プロジェクト概要・コマンド・ドキュメント・開発フロー）は **[AGENTS.md](AGENTS.md)** を参照。

## アーキテクチャ

FSD Lite（`.agent-rules/architecture.md` 参照）

## Claude Code 固有の注意事項

Bash tool はサンドボックス上で実行されるため、ファイルアクセスやネットワーク接続がエラーになることがある。
そのような状況では、ユーザーに指示を仰ぐこと。
