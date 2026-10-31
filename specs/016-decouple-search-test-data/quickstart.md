# 検証ガイド: R24

この手順は仕様・Planレビュー後の実装を検証するためのもの。以下のtests配下の新規ファイル・検証記録は実装時に追加する。今回のPlan作成ではテスト・品質検査を実行していない。

## 前提と実行場所

- [human-decisions.md](human-decisions.md)に記録されたQ1〜Q4・HD-C08 Bの承認方針を確認する。US1〜US4は全てP1・完了必須である。今回は設計更新のみで、このガイドの実行・Tasks生成・Implementationへは進まない。Git管理外の作業メモを前提にせず、入力来歴は[research.md](research.md)、manifest設計は[data-model.md](data-model.md)を参照する。
- C08では両画面の公開全商品行を検査し、参照先だけを削除した場合の失敗と、参照元も対応更新・削除した場合の成功を確認する。membershipによる事前除外・例外機構は使わない。固定異常FixtureのUI fail closedも確認する。名称と有効IDの取り違えを自動検出できるとは記録しない。

- Repository root `F:\Projects\monsearch`で実行する。既存package-lockに対応するNode/npmと依存導入済み環境を使う。R24は依存upgradeを要求しない。
- [test-inventory.md](test-inventory.md)を開始時点の全テストへ更新し、Assertion対応表へ展開済みであること。
- 歴史入力・manifestと小規模fixture、C/D suite、正常更新・異常・回帰のシナリオが実装済みであること。
- 最新マスターに検証目的の変更を加えない。Mockとmodule cacheの隔離は[契約](contracts/search-test-data.md)に従う。

作業状態を識別し、tracked/未追跡テストを再列挙する。

```powershell
Set-Location -LiteralPath 'F:\Projects\monsearch'
git branch --show-current
git rev-parse HEAD
git status --short
git ls-files --cached --others --exclude-standard '*.test.ts'
```

Vitest設定が実際に収集する範囲を確認し、node_modules・生成物・既存除外を区別する。29ファイルという過去値で打ち切らない。実装前の同じコマンド群の結果、保全hashと作業ツリーの識別を`verification/`へ記録する。

## 1. 固定資産と元入力の完全性

```powershell
npx vitest run tests/fixtures/cardSearch/fixtureIntegrity.test.ts
```

期待結果は、元bytes SHA-256/長さ、version、482件、入力全ID順と既存Oracleの対応が一致し、毎回fresh cloneが得られること。詳細は[data-model.md](data-model.md)のmanifest定義に従う。通常テストで`git show`やOracle生成スクリプトを動かさない。

## 2. 固定入力の全件回帰・境界・画面

```powershell
npx vitest run shared/cardSearch/runner.test.ts server/api/cards.get.test.ts
npx vitest run server/utils/cardSearch
npx vitest run app/composables/useCardSearch.test.ts app/utils/cardSearchDataset.test.ts app/components/cards/result app/pages/cards/index.test.ts
npx vitest run app/components/products/ProductTableRow.test.ts app/utils/search/productSearchLocation.test.ts app/utils/search/cardSearchQueryRouter.test.ts app/pages/product-set-navigation.test.ts app/pages/cards/search.test.ts
```

014の全38ケース・catalog固定ID、015の6項目×2方向×20/50/100・全ページと0/1件/範囲外、旧APIレスポンスを独立期待値と比較する。完全DTO・適用hash・分類集計・入力非破壊を保持し、015承認済み旧atk補正を継続する。

UI/loaderは元の表示・desktop/mobile操作・page reset・設定保持・SSR・retry・競合・通信回数を検証する。商品リンクの固定IDが最新productItemsに存在することを要求せず、slotの陽性操作を現在の先頭順に依存させない。

## 3. 最新入力の全件検査と統合

```powershell
npx vitest run tests/integration/cardSearchMaster.test.ts tests/integration/searchOptionsMaster.test.ts app/utils/search/cardSearchQuerySchema.test.ts
npx vitest run tests/integration/cardSearchRealData.test.ts dev/cardsJsonHandler.test.ts
```

期待結果は最新入力全件がCの既存契約を満たし、Dで読込・全ページの集合/件数/分類集計・公開DTO・API/CSR parity・配信bytesが整合すること。現在の482件、特定カードの存在、本文全体を期待値にしない。最新の陽性例が消えても0件契約を確認し、固定側の陽性例は維持する。

## 4. 追加・変更・削除、異常、回帰の検出

`masterDataUpdates.test.ts`では次のdescribe名を用い、結果を分類して実行可能にする。

```powershell
npx vitest run tests/integration/masterDataUpdates.test.ts -t '正常更新'
npx vitest run tests/integration/masterDataUpdates.test.ts -t '不正入力'
npx vitest run tests/integration/masterDataUpdates.test.ts -t '回帰検出'
```

| 群 | 実施と期待結果 |
|---|---|
| 正常更新 | 契約の更新表をデータ群ごとに展開し、追加・変更・削除の全3操作を実施。UUID7群を個別に扱う。商品行は片側だけの追加削除、slotは順序変更、Cardは最後の陽性例削除も含む |
| 更新反映 | module Mockは対象moduleのimport前に設定し、必要なcacheを破棄。更新後入力を使って元の依存AssertionとC/Dを再実行。固定A/Bの入力/期待値は変更0、最新の集合・metadataには更新が反映される |
| 不正入力 | 必須欠損・重複card_id・有効な商品参照の不整合を個別注入。Cが対象と違反を特定することをAssertionする。未正規化catalogやcost数量不正等も対応規則で検査 |
| 回帰検出 | テスト側の局所Mockで投影本文欠落、同値順逆転の実行出力を作る。元の独立した完全比較/順序比較がそれぞれ拒否することを検証する。通常のsuiteは「故障を検出した」として成功する構成 |
| 隔離 | 更新・異常の各ケース後も次ケースは原本から開始。最新suiteに固定Mockが漏れない。入力非破壊も別途比較 |

固定語彙のvalue追加削除は仕様変更として対象外と記録する。未使用選択肢・許容空/null・収録カードなし商品を不正扱いしない。単に変更したcloneを検査しただけ、fixtureのhashが変わらないだけ、2経路が同じだけの結果を更新耐性・正解の証拠にしない。

## 5. 全体品質・公開成果物・保全

```powershell
npm run test -- --run
npm run lint
npx nuxt typecheck
npm run generate
```

全体テストの状態と品質検査の状態を対応付ける。変更や未解決失敗がなければ同じ検査を理由なく繰り返さない。

生成直後、実際の公開出力先で以下を確認する。Nuxt設定はNitro staticであり、出力先はその実行結果を正とする。

1. 公開`data/cards.json`と`app/utils/mockData/items/cards.json`のSHA-256/bytesが一致する。
2. 公開ファイル名・JSON・JS/chunk・payloadに、testsのfixture/manifest、既存Oracle原本、歴史入力固有の内容が混入していない。ファイル名検索だけで合格にしない。通常の最新cards.jsonや本来の表示内容をfixture混入と誤判定しない。
3. Productionのimport graphにtestsへの参照がなく、通常CSR検索がAPI通信や追加のJSON取得を行わない既存検証を保持している。
4. 014/015全既存資産、API baseline、N₀ vectorのbefore/after hash集合・bytes長が一致し、削除0・改変0である。
5. 本番マスターに検証目的の差分がない。`git diff --check`も成功する。

## 6. 記録と完了判定

`verification/assertion-map.md`に元の全Assertionと移行先・入力・独立期待値・境界・異常系・実行結果を記録する。`verification/results.md`にはコマンド、exit code、log、対象revision/作業ツリー状態、更新scenario、不正/回帰検出、保全・公開検査、未検証理由をまとめる。

成功基準はspec SC-001〜006。テスト数の増減や主要2ファイルの成功だけで完了にしない。全体のAssertion対応、各群の3更新、異常3種、回帰2種、保全と非公開、同一状態での全体成功が必要。

Sandbox/権限/OS由来の起動不能は、コマンドとエラーを根拠付きで「環境失敗・未検証」と記録する。Assertion失敗や成功へ読み替えず、AGENTSに従って実行方法の変更前にユーザーへ確認する。Plan作成時点ではこれらの実行結果を得ていない。
