# Language Requirement

- ユーザーとの対話、Spec Kitが生成する仕様・設計・タスク・レビューコメントは日本語で記述してください。
- コード、CLIコマンド、設定値、ファイル名、識別子、一般的な技術用語は原表記を維持してください。
- ユーザーが明示的に別言語を指定した場合は、その指示を優先してください。

# Execution Environment

- 実行環境に起因する可能性が高いエラー（Sandbox・権限・OS制約など）と判断した場合は、実装失敗として扱わず、判断根拠を示した上でユーザーへ確認する。
- ユーザーの承認によって制約を解除できる可能性がある場合は、代替手段を試して停止する前に、理由を説明して承認を求めてください。
- 権限昇格やSandbox外実行など、実行方法を変更する場合は、実行前に必ずユーザーへ確認してください。
- 環境制約による失敗であると判断した場合は、その根拠を示してください。

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/002-query-builder/plan.md
<!-- SPECKIT END -->
