# 変更・追加ファイル一覧

**最新記録（2026-10-25）**: 追加修正はHuman Reviewで **APPROVE**、Feature 014のG5は **APPROVE_WITH_EXCLUSIONS**。追加fixture・APIテストのimport変更・再検証資料、および今回の判断記録2文書を末尾の一覧に追記した。

以下のM・??は初回実装を記録した時点の状態であり、現在のGit statusを表すものではない。初回一覧を履歴として保持し、末尾の追記と合わせてFeature 014の最終的な変更範囲を示す。

## 初回実装時の一覧（履歴）

2026-10-25。今回のT003〜T030の差分。M=変更、??=追加（未追跡）。Git commit・stageはしていない。

| 状態 | path |
|---|---|
| M | `app/utils/search/cardSearchQueryBuilder.test.ts` |
| M | `app/utils/search/cardSearchQueryParser.test.ts` |
| M | `server/api/cards.get.test.ts` |
| M | `server/api/cards.get.ts` |
| M | `server/utils/cardSearch/search.test.ts` |
| M | `server/utils/cardSearch/search.ts` |
| M | `specs/014-search-catalog-normalization/tasks.md` |
| M | `specs/014-search-catalog-normalization/verification/data-audit.json` |
| M | `types/cards/finderCards.ts` |
| ?? | `server/utils/cardSearch/normalizeCatalogText.fixtures.json` |
| ?? | `server/utils/cardSearch/normalizeCatalogText.test.ts` |
| ?? | `server/utils/cardSearch/normalizeCatalogText.ts` |
| ?? | `specs/014-search-catalog-normalization/verification/acceptance.md` |
| ?? | `specs/014-search-catalog-normalization/verification/check-results.json` |
| ?? | `specs/014-search-catalog-normalization/verification/expected-catalog-results.json` |
| ?? | `specs/014-search-catalog-normalization/verification/final-failures.json` |
| ?? | `specs/014-search-catalog-normalization/verification/preservation.json` |
| ?? | `specs/014-search-catalog-normalization/verification/qds-differences.md` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-build.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-lint-final.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-lint-verified.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-lint.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-typecheck-final.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality-typecheck.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/quality.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/regression-full.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/regression-verified.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/run-check.mjs` |
| ?? | `specs/014-search-catalog-normalization/verification/structure.md` |
| ?? | `specs/014-search-catalog-normalization/verification/us1-green.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us1-red.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us1-verified.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us1.md` |
| ?? | `specs/014-search-catalog-normalization/verification/us2-red.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us2-verified.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us2.md` |
| ?? | `specs/014-search-catalog-normalization/verification/us3-final.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us3-targeted.txt` |
| ?? | `specs/014-search-catalog-normalization/verification/us3.md` |
| ?? | `specs/014-search-catalog-normalization/verification/files-changed.md` |

既存.gitignoreの*.logに該当する以下の生logもverification配下へ保存した。各内容は同名txt（quality.logはquality.txt）にも保持している。

- `specs/014-search-catalog-normalization/verification/us1-red.log`
- `specs/014-search-catalog-normalization/verification/us1-green.log`
- `specs/014-search-catalog-normalization/verification/us1-verified.log`
- `specs/014-search-catalog-normalization/verification/us2-red.log`
- `specs/014-search-catalog-normalization/verification/us2-verified.log`
- `specs/014-search-catalog-normalization/verification/us3-targeted.log`
- `specs/014-search-catalog-normalization/verification/us3-final.log`
- `specs/014-search-catalog-normalization/verification/regression-full.log`
- `specs/014-search-catalog-normalization/verification/regression-verified.log`
- `specs/014-search-catalog-normalization/verification/quality.log`

T001の元監査フィールドは不変、data-audit.jsonにはT012/T017のimplementationVerificationのみ追記した。T002のbaseline・入力JSON・正式QDS・設計資料・依存設定は未変更。生成されたdist/.nuxt等は既存ignore対象。

## Human Review追加修正・最終記録の一覧（2026-10-25追記）

この一覧の追加・変更は作業内容の区分であり、現在のGit追跡状態ではない。初回一覧に含まれるAPIテストと2文書は重複する同一ファイルとして扱う。最終的な変更ファイル一覧は、初回一覧と以下の一覧の和集合である。

### effect_name API baseline正常化（APPROVE）

| 区分 | path | 内容 |
|---|---|---|
| 追加 | `server/api/fixtures/cards-response-baseline.json` | 旧baselineから分離した現行fixture。`c0df4c4c71ae8f6b4a5410761243d38f797e336e`に対応する60箇所だけを訂正し、出典情報を記録 |
| 変更（初回一覧にも記載） | `server/api/cards.get.test.ts` | 旧baselineから現行fixtureへのimport一行だけ。assertion・比較項目は維持 |

Feature 013の旧baselineは履歴証跡として保持し、Feature 014のT002 baselineも更新していない。空文字を正とするHuman Decisionと分離の経緯は[受入記録の追記](acceptance.md)に記載した。

### 追加修正・再検証資料（すべて追加）

以下のpathは`specs/014-search-catalog-normalization/verification/effect-name-baseline/`相対。

| path | 内容 |
|---|---|
| `api-comparison.json` | 現行API応答と16ケースの完全比較 |
| `api-tests.txt` | APIテスト204件成功、終了コード0 |
| `build.txt` | build成功、終了コード0 |
| `commands.txt` | 再検証command・終了コード |
| `failure-comparison.json` | 本体APIの3失敗解消、残存は`.memo`の13件、新規失敗0件 |
| `fixture-diff.json` | 60訂正箇所のpath・card_id・Effect index・修正commit対応 |
| `lint.txt` | lint成功、終了コード0 |
| `preservation.json` | 保持対象79ファイルのhash一致とAPIテストのimportのみ変更を確認 |
| `protected-files-before.json` | 追加修正前の保持対象hash |
| `regression.txt` | 指定回帰935成功・13失敗、終了コード1。本体失敗0、残存13件はすべて`.memo` |
| `results.json` | 再検証結果の構造化記録 |
| `typecheck.txt` | typecheck成功、終了コード0 |
| `review.md` | 追加修正の報告と、その時点での受入記録への追記案 |

これらは初回の検証資料と分離した記録である。review.md/results.json等に残る「Human Review待ち」はその記録時点の状態として保持し、今回の最終判断はacceptance.mdの追記を参照する。既存の実行ログ・baseline・過去の判断を更新していない。

### 今回の最終Human Review結果の記録整理（変更した2文書）

| path | 内容 |
|---|---|
| `specs/014-search-catalog-normalization/verification/acceptance.md` | 追加修正APPROVE、G5 APPROVE_WITH_EXCLUSIONS、根拠・再検証結果・除外範囲を履歴と分けて追記 |
| `specs/014-search-catalog-normalization/verification/files-changed.md` | 本書。追加修正と再検証資料を一覧へ追記し、初回一覧を履歴として保持 |

今回の記録整理ではソース・テスト・fixture・cards.json・既存baseline・実行ログ・`.memo`・依存設定を変更せず、テスト再実行やGit commit・push・branch操作も行っていない。今後のHuman Reviewによる微調整や必要な再検証を妨げない。

## コミット前の確認事項

- 今回の文書差分が上記2ファイルだけであり、過去の本文・検証値・Human Decisionが履歴として残っていること。
- G5の最新判断がAPPROVE_WITH_EXCLUSIONSで、指定回帰の13失敗を成功扱いせず、すべて`.memo`内・本体失敗0件と明記されていること。
- 初回一覧と今回の追加一覧を合わせて、fixture・APIテスト変更と再検証資料を確認できること。履歴のM・??を現在のGit statusと混同しないこと。
- Git差分の空白エラーがなく、保持対象の内容が不変であること。コミット対象・メッセージは必要に応じてHumanが確認すること。本作業ではstage・commit・pushを実行しない。
