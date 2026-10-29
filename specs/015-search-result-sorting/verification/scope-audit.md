# Scope監査

- protected-files-before.json と protected-files-after.json の77ファイルをSHA-256再照合し、全件一致。
- 正本JSON、Schema、lock、nuxt.config.ts、public/_headers、旧Feature 014の全Artifact、旧API fixtureは不変。
- 本体変更は計画どおり3ファイルのみ: shared/cardSearch/types.ts、shared/cardSearch/sort.ts、app/components/cards/result/layout/ResultList.vue。
- 関連テスト5ファイルを拡張。その他の追加はFeature 015のタスク・独立期待値・再現スクリプト・検証記録のみ。
- runner、composable、controls、parser/matcher、loader、server re-export本体の変更なし。検索条件、URL永続化、API公開、新依存の追加なし。
- generateは既存CLIへbuildDir/output.dirだけをoverrideし、既存出力・設定ファイルを変更しない。生成物はgitignore対象.cache内。
- git diff whitespace検査はCRLFを考慮して終了code 0。未実施のHuman確認はPASSとしていない。
