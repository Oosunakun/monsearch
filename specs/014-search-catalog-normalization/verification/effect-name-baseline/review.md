# effect_name API baseline正常化・再検証結果

2026-10-25。Human Reviewで承認された追加修正。Feature 014の実装コード・過去の検証証跡は変更していない。今回の結果を最終Human Reviewへ提示して停止する。

## 変更内容と差分検証

- `server/api/fixtures/cards-response-baseline.json`を新規作成。Feature 013の旧baselineを複製し、対象card_idとEffect indexをキーに、コミット`c0df4c4c71ae8f6b4a5410761243d38f797e336e`の修正と対応する60箇所だけを空文字へ訂正した。一律置換ではない。
- 新fixtureの出典情報は`sourceBaseline`（旧path・commit・入力hash）、`dataCorrectionCommit`、`currentInput`（現行path・入力hash）に分離した。16ケースのquery・response構造は維持している。
- `server/api/cards.get.test.ts`はimport一行だけを変更。assertion・比較項目・deck_restriction_count除外・effect_name比較は未変更であることを、HEADとの差の完全比較で確認した。

| query | 訂正箇所 |
|---|---:|
| sort=id&order=desc | 4 |
| sort=atk&order=asc | 14 |
| page=2&perPage=100 | 42 |
| 合計 | 60 |

40カード・46効果への訂正で、同一効果が複数ケースに現れるため出現箇所は60。旧値はEffect 1が52箇所、Effect 2が8箇所。Git修正コミットから作った106効果のcard_id/index別対応表に照合し、現行入力で空文字が保持されていることも確認した。

旧fixtureのcasesと新fixtureのcasesを再帰比較し、配列・object keyを含む構造と、訂正対象以外の全値の同一性を確認した。差分60件の全path・card_id・整理番号・Effect index・旧値・新値はfixture-diff.jsonに保存した。メタデータの出典情報追加とresponse内の60訂正を区別している。

既存テストと同じdeck_restriction_count除外後の実handler応答をメモリ内で完全比較し、16/16一致。api-comparison.jsonに記録した。

## 実行結果

commandとexit codeはcommands.txt、構造化した結果はresults.jsonに保存。

| 実行 | exit code | 結果・出力 |
|---|---:|---|
| 指定APIテスト（.memo除外） | 0 | 204/204成功。api-tests.txt |
| quickstartと同じ指定回帰（.memo含む） | 1 | 935成功・13失敗、948テスト/31ファイル。regression.txt |
| npm run lint | 0 | PASS。lint.txt |
| npx --no-install nuxt typecheck | 0 | PASS。typecheck.txt |
| npm run build | 0 | PASS。build.txt |

APIテストは指定どおりローカルVitestを直接起動した。指定回帰も同方式で、対象範囲・設定を変更せず実行した。通常品質検証はquickstartに記載されたコマンドを使用した。既存のuseLayout重複警告、buildのplugin timings警告は残るが、新しい環境エラーはない。

## 失敗の分類

前回のregression-verified.txtのFAIL行と比較し、本体APIの既存3件が解消、継続13件、新規0件を確認した。継続する失敗はすべて.memo配下で、旧baselineのeffect_name差3件、旧null full_text期待1件、旧helper名への構造期待1件、Vue runtimeの描画失敗8件。failure-comparison.jsonに全FAIL名を保存した。複製は未修正で、指定回帰全体を成功扱いにはしていない。

## 保持確認・変更ファイル

旧Feature 013 baseline、Feature 014のT002 baseline・既存検証記録、cards.json、Feature 014実装、正式QDS、Specification・Plan・契約・依存設定等、開始時に記録した79ファイルのhashがすべて一致。preservation.jsonに結果を保存した。T002 baselineの再生成・上書き、既存ログの更新はしていない。

実質変更は次の2ファイルだけ。

1. `server/api/fixtures/cards-response-baseline.json`（追加）
2. `server/api/cards.get.test.ts`（import一行）

今回の追加検証記録は本ディレクトリのapi-comparison.json、api-tests.txt、build.txt、commands.txt、failure-comparison.json、fixture-diff.json、lint.txt、preservation.json、protected-files-before.json、regression.txt、results.json、typecheck.txt、本review.md。

## Feature 014受入記録への追記案（未適用）

> Human Review追加修正として、正常なeffect_name空文字に合わせた現行API fixtureを分離した。Feature 013の歴史的baselineとFeature 014のT002記録は保持。訂正は修正コミットと対応する60箇所のみで、現行APIの16ケースが完全一致した。APIテスト204件成功、指定回帰935件成功・.memo内13件失敗。lint・typecheck・buildはすべて終了コード0。本体の旧API失敗3件は解消し、新規失敗・環境失敗はない。Feature 014の実装・FR/SC・G1〜G4の自動確認結果は維持され、G3/SC-003に関する既存API fixtureの残課題が解消した。G5は今回修正を含む最終Human Review待ち。

上記は実際に再検証を終えた結果に基づく追記案であり、既存acceptance.mdや過去の結果は書き換えていない。残課題は.memoの13失敗と既存警告、最終Human Review。Feature外の修正へは進まない。Git commit/push/branch操作、Workflow起動、依存追加・更新、Sandbox/allowlist/権限変更、公開・deployは行っていない。
