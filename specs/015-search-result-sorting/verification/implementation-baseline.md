# 実装開始基準

- branch: feature/search-result-sorting
- HEAD: dc8736e8595767a7e391fc0fed0499eba57d2c62
- 開始差分: 未追跡の tasks.md のみ。ユーザーの明示的な implement 依頼により実装開始。
- 保全hash: protected-files-before.json（正本、lock、設定、Schema、旧API fixture、Feature 014全ファイル）。
- 既存 node_modules/.bin/vitest.cmd と .nuxt/tsconfig.json あり。依存追加・再インストール不要。
- ignore: .gitignore はNode/Nuxt/OS/IDE/envの必須項目を網羅。ESLint flat configも必須ignoreあり。private packageのため.npmignore不要。Docker/Prettier/Terraform/Helmなし。
- runner.test.ts: baseline.casesの全ページ・境界・完全DTO・responseSha256を照合。atk6ケースのみ015固定ID順でページを再構成し、旧DTO/集計を使用する。
- cards.get.test.ts: approvedBaseline同様。catalog付きテスト内の unit.attack ?? 0 を015期待値へ移行。id/rarityのhash・完全応答は維持する。
- 隔離generate: F:/Projects/monsearch/.cache/015-sort-generation （既存成果物を上書きしない新規出力）。既存CLIを調査し、NITRO_OUTPUT_DIRの対応が確認できなかったため、generate-isolated.mjsから同じNuxt CLI generate処理にbuildDir/output.dirだけをoverrideする。設定ファイルは変更しない。
