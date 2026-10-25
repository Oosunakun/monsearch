# T002 環境エラー調査と変更前baseline取得

2026-10-25。T001を保持し、Human Reviewによる今回の指示に従ってT002だけを再開した。T003以降は未着手。以前のimplementation-stop.mdは停止時点の履歴として保持し、最新状態は本記録とbaseline.jsonを参照する。

## registry拒否の調査結果

- package.jsonのscripts.testは`vitest`のみ。pretest/posttestなし。postinstallの`nuxt prepare`は今回のtest scriptに含まれない。内部のnpx/install呼出もない。
- ローカルnode_modules、node_modules/.bin/vitest.cmd、vitest.ps1、node_modules/vitest/vitest.mjsとdist/cli.jsが存在する。Vitest 4.1.10、Node v22.20.0。
- 起動shimは既存Nodeでローカルvitest.mjsへ引数を渡すだけ。node_modules/.bin/node.exeは存在せず、PATH上のNodeを使う構成。
- 前回コマンドは下記「変更前」のとおり。baseline-output.logは0 byte。baseline.logには実行基盤の`Network access to "registry.npmjs.org" was blocked: domain is not on the allowlist for the current sandbox mode.`があり、プロセス終了コードは取得されていない。
- 読取り可能な標準npm cacheの_logsには2026-10-25のログがなかった。対象test/config内のnpm lifecycle変数利用、npx、registry参照も検索したが該当しなかった。Nuxt設定のGoogle Fonts URLはregistry URLではない。
- **特定できたのは実行基盤がネットワーク要求を拒否したことまで**。npm・子処理・Codex側のどの処理が通信を要求したか、プロセス開始前だったかは残存ログでは確定できない。npm test自体が依存取得を要する構成、または内部npxが取得を試みたという根拠はない。今回の直接実行成功だけで過去エラーの原因をnpmと断定しない。

## 元コマンドとの等価性と一回の実行

変更前:

```powershell
npm test -- --run server/utils/cardSearch server/api/cards.get.test.ts app/utils/search app/composables/useCardSearchForm.test.ts app/pages/cards/search.test.ts
```

今回:

```powershell
node node_modules/vitest/vitest.mjs --run server/utils/cardSearch server/api/cards.get.test.ts app/utils/search app/composables/useCardSearchForm.test.ts app/pages/cards/search.test.ts
```

- npmが解決するローカルVitestと同じentry point・Nodeを使用。runオプションと対象5指定をそのまま維持。Repository rootをcwdとし、既存vitest.config.tsとnuxt.config.tsを使用した。
- pretest/posttestはないため省略するhookなし。スクリプト内の環境変数設定もない。既存環境変数を継承し、npm scriptと同様に子コマンドのPATH先頭へRepositoryのnode_modules/.binを一時追加、実行後に元へ戻した。NODE_ENV/CI/NODE_OPTIONS等を上書きしていない。npm固有のlifecycleメタデータは直接起動では生成されないが、対象ソース・設定にその参照は見つからなかった。
- 依存取得を行うnpm/npxを起動せず、ローカル解決を使用。registryへの要求・拒否は今回の出力にない。これはネットワーク通信全般の監査結果ではない。
- Vitest直接実行は一度だけ。設定変更・exclude追加・失敗期待値の変更・テスト再試行は行っていない。

結果: **exit code 1、30ファイル中25成功・5失敗、424テスト中408成功・16失敗、41.21秒**。baseline-local-output.logに全出力、baseline.logにcommandと終了コードを保存した。今回取得した通常のテスト結果であり、前回の実行基盤エラーとは異なる。

## 変更前から存在する失敗

| 対象 | 件数 | 観測した内容 |
|---|---:|---|
| server/utils/cardSearch/search.test.ts | 1 | `実データのnull full_textでもKeyword結果へ影響しない`がnullを期待。受領JSONの先頭カードは非空stringで失敗（288行） |
| server/api/cards.get.test.ts | 3 | 過去Feature 013の応答比較でsort=id/desc、sort=atk/asc、page=2/perPage=100が失敗。出力差分はeffect_nameの`Effect 1`に対する空文字（37行） |
| .memo/.../workspace/server の複製 | 4 | 上記Unit 1件・API 3件と同じ失敗 |
| .memo/.../workspace/app/pages/cards/search.test.ts | 8 | `Cannot read properties of null (reading 'ce')`。stackにはRepository本体と複製workspaceそれぞれのVue runtimeが現れる。複数runtimeの混在が示唆されるが根因は未確定 |

既存設定のincludeは`**/*.test.ts`で、指定文字列は.memo内の複製にも一致した。複製の収集を今回だけ除外せず、そのまま記録した。Repository本体のフォーム・検索ページ・Parser/Builder等にFAIL行はない。NuxtのuseLayout auto-import衝突警告、VueのSuspense experimental表示も出た。これらを新Featureの実装失敗や今回のSandbox拒否として数えない。期待値・テスト・依存構成は修正していない。

旧kw/att連結契約は現行実装のままであり、この実行を新catalog契約の合格とはしない。既存失敗は4件（本体）、複製込み16件として今後の回帰比較に使う。

## 同一入力による実測baseline

`node specs/014-search-catalog-normalization/verification/capture-baseline.mjs`を実行し、exit code 0。baseline-capture-output.logに結果を保存。

これはverification内の観測用スクリプトで、既存ソース・テストコードの変更や新テスト追加ではない。インストール済みjiti 2.7.0で既存TypeScriptと~~ aliasを読取り解決し、既存APIテストと同じh3のdefineEventHandler/createError/toWebHandlerで実handlerをメモリ内実行した。HTTP server/socket/fetch・npm/npx・依存取得は使わない。Vitest suiteの代用ではなく、suite実行後の応答記録だけを行う。

- 入力: app/utils/mockData/items/cards.json、version 1.0.0、482件。
- SHA-256: `a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca`。T001と一致。観測前後にも確認した。
- catalog条件なし38ケース。nm/rl/etx、collection複数値、数値0、枠、コスト、分類・Token、複合条件、空結果、不正値の既存処理を含む。
- sort=id/rarity/atk × asc/desc × perPage=20/50/100の全18組合せを含む。全371ページとpage=0/999999/brokenの114境界応答を記録。
- 各ケースのUnitの全IDと順序、API全ページを巡回した全IDと順序・totalCount・categoryBreakdown・page/perPage/totalPages・sort・応答項目を保存。各カードのis_token、元categoryと検索上の分類、sourceIndexも保存した。
- 各APIページのitemsはcard_id参照とし、projectedItemsに482件の完全な投影値を一度ずつ保存する。参照を置換すれば完全な応答を復元できる。responseSha256も保存した。これにより表示原文と応答項目を失わず、同じ投影値の大量重複を避けた。
- 各ケースのUnit/APIの全ID集合・件数・重複なし、page境界の内容、criteria・入力カードの不変性をスクリプト内でassertした。旧kw/attの結果や別Featureのbaselineから値を流用していない。

baseline.jsonのstatus=completeは**変更前観測の取得完了**を指す。testRun.exitCode=1と失敗数を併記しており、suite全件成功やFeature実装完了を意味しない。

保存後にAPIやテストを再実行せず、371ページすべての応答復元hash、項目名、全IDの順序・集合・件数・集計合計と入力hashを確認しPASS。結果と16件のFAIL行はbaseline-integrity.jsonに保存した。既存.gitignoreの`*.log`によりlogはGit対象外となるため、同じcommand・出力・終了コードを追跡可能なbaseline-execution.txtにも保存した。ignore設定は変更していない。

## 完了と残る制約

T002の必要な変更前観測と通常のテスト結果が揃ったため、tasks.mdのT002だけを完了に更新した。T001の監査成果物は未変更。ソース・テスト・cards.json・Specification・Plan・設計契約は未変更。

registryのSandbox allowlist制約は解消・変更していない。元のnpm経路の原因と動作は未確定であり、今回npm経路の再実行はしていない。直接ローカル起動では通常の結果を取得できた。npm install、依存更新、Sandbox/UAC/ネットワーク/権限変更、Git commit/push/branch操作、Workflow起動は行っていない。

T003以降へ進まず、今回の成果物をHuman Reviewへ提示して停止する。
