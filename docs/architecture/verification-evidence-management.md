# verification成果物のGit管理方針

対象は `specs/**/verification/` 以下とする。ディレクトリは維持し、既存の正式Spec、テストコード、Fixture、Oracle、Human Decision、保全hashを保護する。

- `.md`、`.ts`、`.json` と、除外対象に指定されていない拡張子は保持する。たとえば `.txt.json` と `.mjs` は除外しない。
- `.log`、`.txt`、`.jsonl`、`.png`、`.jpg`、`.webp` はGit管理から除外し、ローカルに残す。既にコミットされた履歴は変更しない。
- 除外規則はRepositoryルートの `.gitignore` に集約する。除外対象の生成物はローカル保存を許容し、定期的な手動削除・要約・移設を要求しない。
- 過去のログや画像を新たに要約・集約・移設しない。歴史的な参照、Human Decision、Oracle、保全hashを自動で書き換えない。

R25のHuman Decisionにより、既存98ファイルをIndexから除外する。Feature013の画面画像とFeature014・016のログ等へのMarkdownリンク90件は、通常のCloneではリンク先が存在しない既知の制約として受け入れる。保全hashや実行metadataが指すpathについても、Cloneに実体がなければ当時の現物の照合はできない。結果を再検証できると推定しない。

`verification/logs/` を利用するテストや処理は、Clone先でも必要なディレクトリを利用できることを確認する。Feature016の更新シナリオは同ディレクトリに一時JSONを書き込み、読み込み後に削除する。
