---
description: "R24 検索テストと更新可能なマスターデータの依存関係解消の実装タスク"
---

# タスク: monsearch R24 — 検索テストと更新可能なマスターデータの依存関係解消

**最終状態（HD-R24-ACCEPTANCE）**: 機能ACCEPTED・例外付き受入れ。SC-006は未達、T041は未完了。T045/T046はHuman例外に基づく文書整理完了であり、全Gate PASSではない。性能課題は別管理。詳細は[final-review.md](final-review.md)。

## 過去の進捗・停止記録（履歴）

最新追記: Human機能受入れ済み。独立した品質/公開/保全検証を完了しT042〜T044を完了。T041/T045/T046は未完了、標準Gateは未達。下の時刻付き状態は履歴として保持する。詳細はverification/results.md末尾とperformance-followup-plan.md。

**最新の実装状態（2026-10-31 20:03 JST）**: T001〜T040完了。T041の全体実行は1166成功/1失敗（既存画面テストの5秒タイムアウト）。画面単独20/20、追加5ファイル136/136は成功。実行条件を変更せずHuman判断待ちで停止し、T041〜T046は未完了。R24完了ではない。以下のSetup停止記録は過去の状態として保持する。詳細は [results.md](verification/results.md) 末尾を参照。

**Setup再開状態（2026-10-31 16:45 JST）**: 既存のstaged成果物を保持。T001は4ファイル122位置の意味規則・依存・移行先まで追記したが、残り406位置等は未完了。T002の180ファイルと開始時29テストのhash不変を確認し、既存記録は上書きしていない。T003は通常の`npm --version`が同じEPERMでexit code 1となり停止。品質検査は未実行、T004以降は未着手。今回完了チェックの追加なし。下の実装開始状態は初回記録として保持する。

**実装開始状態（2026-10-31）**: T001は29ファイルの列挙・Assertion位置抽出までで未完了。T002の保全hash取得のみ完了。T003の変更前テストはnpm起動時の `EPERM: lstat 'C:\'` で環境失敗となり、実行方法変更前の確認待ち。後続Phaseは未着手。[実行記録](verification/results.md) を参照。

**入力**: `specs/016-decouple-search-test-data/` の [plan.md](plan.md)、[spec.md](spec.md)、[research.md](research.md)、[data-model.md](data-model.md)、[契約](contracts/search-test-data.md)、[棚卸し](test-inventory.md)、[quickstart.md](quickstart.md)、[承認記録](human-decisions.md)

**前提**: `.specify/memory/constitution.md` と承認済みQ1〜Q4・HD-C08 Bを継承する。当初のTasks生成を経て、Human承認に基づきImplementationを再開した。承認済みSpec/Planにある「Tasks生成未着手」「今回は設計更新のみ」は設計承認時点の記録として保全し、本書とresultsで実装後の状態を管理する。過去の実行結果を今回の成功として扱わない。

**テスト**: 本Featureはテスト移行・検証能力の保持を明示的に要求するため、テスト作成・移行・実行を含む。新規検査・更新シナリオは対応する実装より先にAssertionを記述し、不適合入力や未実装の責務を検出できることを確認する。既存テストの期待値更新、skip追加、完全比較の縮小で成功させない。

**構成**: US1〜US4はすべてP1・完了必須。同優先度内では検査移設の空白を防ぐためUS3 → US2 → US1 → US4の依存順に配置する。共通の調査・保全はSetup、共通fixtureはFoundational、最終品質・証跡は横断工程に置く。Story番号はspec.mdと同じで、並び順によって変更しない。

## 形式とパス

- `- [ ] Tnnn [P?] [USn?] 説明と正確なファイルパス` を使う。実施・検証したタスクだけを `[X]` にする。
- `[P]` は、記載した前提完了後に同じ実行群の別ファイルのタスクと並行可能であることを示す。自動的なagent起動の指示ではない。
- パスはRepository root基準。`tests/` は既存Vitestの収集範囲内かつProduction自動取込の外とし、依存追加・upgradeや設定変更を前提にしない。
- A＝固定入力の振る舞い、B＝固定入力と独立した完全DTO、C＝最新入力の整合性、D＝最新入力の統合。各変更と実行結果を `specs/016-decouple-search-test-data/verification/assertion-map.md` に随時反映する。
- Productionコード・検索意味・UI・公開Schemaは原則変更しない。必要性が判明した場合は根拠・最小案・影響を提示し、承認済み設計からの逸脱を独断で実施しない。

## Phase 1: Setup — 開始状態と全依存の確定

**目的**: 移行前の保証・入力依存・保全対象・実行状態を記録する。既報の13/29/17ファイルを範囲の上限にしない。

- [X] T001 `vitest.config.ts` の実収集範囲と `git ls-files --cached --others --exclude-standard '*.test.ts'`、実ファイルを照合し、`specs/016-decouple-search-test-data/test-inventory.md` を開始時点へ更新する。全テストの直接/間接import、再export、共有helper、Mock、cache、ファイル読込からmockData・検索JSON・選択肢まで追跡し、全Assertion/パラメータ条件を同ディレクトリの `verification/assertion-map.md` へ展開する。I番号・仕様根拠・固定契約/観測値・3操作の影響・A/B/C/D・移行先/変更不要理由・独立期待値・境界/異常系・結果欄を埋め、未確認を識別する。
- [X] T002 `specs/016-decouple-search-test-data/verification/protected-files-before.json` に `specs/014-search-catalog-normalization/`、`specs/015-search-result-sorting/` の全既存ファイル、`server/api/fixtures/cards-response-baseline.json`、`server/utils/cardSearch/normalizeCatalogText.fixtures.json` とT001で判明した全本番マスターのpath/SHA-256/byteLengthを保存する。未追跡の保全対象も含め、以後の生成物を既存資産と取り違えない。
- [X] T003 `specs/016-decouple-search-test-data/verification/results.md` と `verification/logs/` を作り、revision・作業ツリー・時刻・Node/npm・コマンド・exit code・log pathを記録する。変更前の `npm run test -- --run`、`npm run lint`、`npx nuxt typecheck`、`npm run generate` を記録し、Assertion失敗/環境失敗/未実行を区別する。環境起因ならエラー根拠を残し、実行方法変更前にAGENTS.mdに従って確認する。

**チェックポイント**: 全テストと依存Assertionを追跡でき、変更前の保全集合・実行結果が存在する。T001の新発見は対応する後続タスクと正常更新matrixへ追加する。

## Phase 2: Foundational — 再現可能な固定入力

**目的**: 全Storyで共有する入力を最新マスターから独立させる。このPhase完了前にStory実装を開始しない。

- [X] T004 `tests/fixtures/cardSearch/fixtureIntegrity.test.ts` に歴史入力の元bytes/hash/長さ/version/482件、014 classificationsの全ID順とprojectedItems集合、015参照集合、API `currentInput` とmanifestの対応を検査するテストを先に記述する。cloneの変更が次ケースや原本へ漏れず、SourceCardのsourceIndexが入力順になることも検証する。Oracleを再生成せず、通常テストでGit履歴・ネットワークを呼ばない構成にする。
- [X] T005 `tests/fixtures/cardSearch/historical/014-015/cards.json` にrevision `27209dfd0d5fb35cf0900aaa1d0cbcd8391e05e5` の `app/utils/mockData/items/cards.json`（blob `8fc90b208e4a2fefe9577fb54d234e934cdd405d`）を一度だけbinary streamで保存し、SHA-256 `a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca`、2,283,572 bytesを照合する。同階層の `manifest.json` にdata-model.mdの全fieldと既存Oracle相対path・対応metadata・015旧atk補正を記載する。PowerShellテキストredirectやJSON再serializeで原本bytesを変えない。
- [X] T006 [P] `tests/fixtures/cardSearch/cards.ts` に明示的な型付きCard/Effect/FinderCardsと完成済み表示DTOを用意し、`tests/fixtures/cardSearch/projection-expected.json` に仕様から手書きした完全DTOを保存する。最新/歴史カードのfirst/findやProduction投影を素材・期待値生成に使わず、数値0/正負/値なし/親なし、unit/equip、未知rarity、同値/同ID、通常/追加能力、同一/別Effect、本文のみ/複数/改行、cost alternatives/any/none/unknown、0/1件を明示する。
- [X] T007 `tests/fixtures/cardSearch/sources.ts` に既存型を使うfresh clone取得と `{ card, sourceIndex }` 化だけのhelperを実装する。matcher/sort/projectやOracle生成を含めず、T004の完全性・隔離テストを成功させる（T005・T006完了後）。
- [X] T008 [P] `tests/fixtures/searchOptions/products.ts` に固定SearchOption、有効値Set、共通/片側だけ/同名別ID/無効参照を持つ二画面の商品行を明記する。`22d7e/ce193/9f77f` はテスト値として保持し、最新productItemsへの存在を要求しない。固定異常入力と正常な最新商品行を区別する。

**チェックポイント**: 原本bytesとOracleの対応、独立DTO、fresh cloneが検証できる。T006・T008はT005後に並行でき、T007はT006後に実施する。

## Phase 3: User Story 3 — 最新データの不整合と統合上の問題を検出する（P1）

**目標**: 移行前に最新C/Dを設置し、固定fixtureへ切り替えた後も最新入力の契約と配信を検証できる状態にする。

**独立したテスト**: `cardSearchMaster.test.ts`、`searchOptionsMaster.test.ts`、`cardSearchRealData.test.ts`、既存schema/dev handler suiteを実行する。最新全件がC01〜C08を満たし、必須欠損・重複ID・商品参照切れを診断し、Dの読込・全ページ集合/集計・公開DTO・配信bytesを確認する。

### テストを先に定義する

- [X] T009 [P] [US3] `tests/integration/cardSearchMaster.test.ts` に最新cards全件のC01〜C06と検査器の正負例を定義する。必須欠損・重複card_id・未正規化/欠損catalog・不正cost quantity/range/構造化欠損のruleIdと対象をAssertionし、許容された空文字/null、本文のみ効果、既知cost-free、不明cost、`spell:any` を区別する。最新の固定件数・全文・一律非空を要求しない。
- [X] T010 [P] [US3] `tests/integration/searchOptionsMaster.test.ts` にC07/C08の正負例を定義する。7種Short UUID・SearchOption型・固定Mapping・両画面の公開全商品行とrow.id一意性を検査し、参照先だけの削除を必ず拒否する。membershipで対象を除外せず、未使用選択肢・片側だけの行・共通集合0を正常例に含め、名称一致や例外機構を追加しない。

### 検査と統合を実装する

- [X] T011 [US3] `tests/helpers/masterDataValidation.ts` に `unknown` から絞り込むC01〜C08の全件検査とValidationIssue/Reportを実装する（T009・T010後）。dataset・recordId/index・fieldPath・ruleId・reason・basisと観測統計を返し、入力を補修しない。型・012 cost契約・N₀固定点・QDS/011の既存規則だけを適用し、検索期待値や本文再解析器を作らない。
- [X] T012 [P] [US3] `tests/integration/searchOptionsMaster.test.ts` を最新 `app/utils/constants/search/items/` の7群・数値/固定語彙、`app/utils/mockData/indexPage.ts`、`app/utils/mockData/restrictions.ts` に接続する（T011後）。各画面の全行から独立して商品locationを検証し、共通行がある場合だけ一致を補完する。`app/utils/search/cardSearchQuerySchema.test.ts` の最新形式検査と固定正負例を保持し、最新suiteへ固定option Mockを継承しない。
- [X] T013 [P] [US3] `tests/integration/cardSearchRealData.test.ts` に実loaderのfetch→SourceCard、実dataSource→runner/APIを使う最新Dを実装する（T011後）。6 sortキー×両方向×20/50/100の全ページ、clamp/0件、入力全IDの重複欠落0、元入力由来の総件数/分類集計と出現順、公開field whitelist・effects原文/順序・制限値・内部field非公開、API/CSR完全DTO parityを検証する。単純条件の全ID期待集合は原fieldと仕様の独立predicateで求め、Production matcherを使わず、最新に陽性例がない場合は0件契約を検証する。
- [X] T014 [US3] `tests/integration/cardSearchRealData.test.ts` の最新loader受理・失敗/retry・Mock/cache分離と既存error契約を確認し、`dev/cardsJsonHandler.test.ts` の最新元ファイルbytes一致・GET/405/path/500/retryを実行して維持する。変更不要の既存Assertionは理由なく書き換えず、loader/正規化/商品検査を固定側へ移す前に最新側の同等検査が存在することを対応表に記録する（T012・T013後）。
- [X] T015 [US3] `specs/016-decouple-search-test-data/verification/results.md` にquickstart §3の最新C/D・schema/dev handler実行結果、3種不正入力の診断、許容空値/未使用選択肢の正例を記録する。`verification/assertion-map.md` に最新検査の移設先を対応付け、有効商品ID同士の意味的取り違えは未保証と明示する。

**チェックポイント**: US3のC/Dが単独実行でき、最新の件数・特定ID・全文に固定しない。ここで最新入力に既存契約違反が判明しても、本番データの検証目的の変更や検査の緩和で解消しない。失敗と根拠を記録する。

## Phase 4: User Story 2 — データ更新から独立して検索・表示の不具合を検出する（P1）

**目標**: 変更候補17ファイルの問題Assertionを固定A/Bへ移し、独立Oracle・完全DTO・境界・異常系を保持する。US3設置後に実施し、最新C/Dを同時に残す。

**独立したテスト**: quickstart §1〜2に従いfixture、Runner/API、search/sort/project/N₀、composable/loader/UI、商品navigationを実行する。014全38ケース、015の6×2×3と全ページ/境界、API16ケースの独立比較が成功し、実行出力への本文欠落・同値順逆転を固定比較が拒否する。

### 既存テストの固定入力への移行

次のT016〜T032は共通fixtureとUS3完了後に別ファイルで並行可能。既存テストの保証を先に対応表へ記録し、入力だけを差し替える。新しい境界が必要ならAssertionを先に追加する。共通fixtureの変更が必要になった場合は、その変更を完了してから並行作業を再開する。

- [X] T016 [P] [US2] `shared/cardSearch/runner.test.ts` のgetSourceCards依存を歴史入力と明示sort baseへ移す。014の38ケース・catalog固定ID・完全DTO・適用hash・149件・入力非破壊、015の6キー×2方向×20/50/100・全ページ/0/1件/範囲外・集計・旧atk補正を保持し、最新DはT013へ対応付ける。
- [X] T017 [P] [US2] `server/api/cards.get.test.ts` の固定比較を歴史入力/小規模fixtureとbeforeEachのdataSource spyへ移す。API16ケース・014/015の全ページ/DTO/hash/順序・kw・status/500/CARD_SEARCH_FAILED・公開fieldを保持し、afterEachでrestoreする。0/1件はMock前にlocal保持したfresh sourceからsliceし、Mock済みgetSourceCardsから元配列を取り直さない。
- [X] T018 [P] [US2] `server/utils/cardSearch/search.test.ts` の固定ID集合を歴史入力へ、first/find由来の合成素材を明示Cardへ移す。kw/att、数値/欠測、通常/追加能力、同一/別Effect、cost、catalog欠測の全境界と正負例を保持する。fixture準備をnormalizer spyより前に済ませ、走査前各1回のquery正規化Assertionを維持する。
- [X] T019 [P] [US2] `server/utils/cardSearch/sort.test.ts` のmakeSortFixturesへ小規模fixtureの明示baseを渡し、既存fixtureOrdersと0/正負/欠損/親なし、unit/equip、未知rarity、同値/同ID、入力非破壊の独立期待値を保持する。`specs/015-search-result-sorting/verification/sort-fixtures.ts` 原本を変更しない。
- [X] T020 [P] [US2] `server/utils/cardSearch/project.test.ts` を明示Cardと `tests/fixtures/cardSearch/projection-expected.json` の手書き完全DTO比較へ移す。制限値0〜4/null/空、必須欠損、内部field非公開を保持し、projectCardや同形変換helperで期待値を生成しない。
- [X] T021 [P] [US2] `server/utils/cardSearch/normalizeCatalogText.test.ts` の482件/全catalog非空を歴史入力へ接続し、既存N₀ vector・全幅172文字/ASCII26文字・冪等性を保持する。T009〜T015の最新全件C04がある状態でのみ元の最新入力接続を切り替え、検査欠落を作らない。
- [X] T022 [P] [US2] `app/composables/useCardSearch.test.ts` の実cardsを返すloader Mockを歴史/小規模fixtureへ移し、6キー×2方向の固定ID、SSR、retry、世代競合、離脱、初回検索・再取得0回・query/state非破壊を維持する。ケースごとのMock解除とfresh sourceを徹底する。
- [X] T023 [P] [US2] `app/components/cards/result/layout/ResultList.test.ts` のsort検証は歴史入力、単純描画は固定DTOに移す。482件等の歴史的期待値と015独立ID順、desktop/mobile操作、page reset/perPage維持を残し、最新loader Mockへの暗黙依存を除く。
- [X] T024 [P] [US2] `app/components/cards/result/list/ItemEffect.test.ts` のprojectCard(getSourceCards()[0])を完成済み固定DTOに置換し、通常効果/本文のみ・効果順・改行・区切り・ラベル・本文表示の全Assertionを維持する。
- [X] T025 [P] [US2] `app/components/cards/result/list/ItemHeaderName.test.ts` の実カード由来DTOを完成済み固定DTOへ移し、枚数制限・props更新・表示の全Assertionを保持する。
- [X] T026 [P] [US2] `app/pages/cards/index.test.ts` の実cards投影によるmock stateを完成済み固定DTOへ移し、状態連携・表示・通常検索でAPI通信を行わない既存検証を維持する。
- [X] T027 [P] [US2] `app/utils/cardSearchDataset.test.ts` のfetch bodyを固定FinderCardsへ移し、全入力順/sourceIndex、document内Promise共有、失敗後retry・cache reset・再検索の追加JSON取得0回を保持する。最新JSON受理はT013〜T014のDへ対応付け、固定Mockを最新suiteへ漏らさない。
- [X] T028 [P] [US2] `app/utils/search/productSearchLocation.test.ts` を固定商品選択肢へ接続し、`22d7e/ce193/9f77f`、同名別ID、pdだけのlocation、無効値、入力非破壊の独立期待値を保持する。PRODUCT_VALUES生成前に対象option moduleをMockし、必要な場合だけresetModules/動的importを使う。
- [X] T029 [P] [US2] `app/components/products/ProductTableRow.test.ts` の陽性membershipを固定商品選択肢で保証し、desktop/mobile・pointer/keyboard・名称のみlink・無効値のfail closedを保持する。最新商品行の参照検査はT012のC08に残す。
- [X] T030 [P] [US2] `app/utils/search/cardSearchQueryRouter.test.ts` の商品navigation caseに限って固定option moduleを注入し、既存pd URL期待値を保持する。Unicode/reload/bookmark/大小文字等の独立契約を維持し、ファイル全体を不要にMock化しない。
- [X] T031 [P] [US2] `app/pages/product-set-navigation.test.ts` を固定二画面の商品行と選択肢へ接続し、共通セットの陽性location一致と同名別IDを保持する。最新home集合がrestrictionsに包含されるというAssertionは既存008の要求外である根拠を対応表に残し、各画面個別と共通部分の最新検査をT012へ対応付ける。
- [X] T032 [P] [US2] `app/pages/cards/search.test.ts` の先頭incrementをmultiと見なすcaseに固定itemSlot選択肢を注入し、実子componentでの陽性操作とpush `{ is: 'multi:1' }`、全URL復元ケースを維持する。最新slot表示順を操作対象のidentityにしない。

### 回帰検出とStory検証

- [X] T033 [US2] `tests/integration/masterDataUpdates.test.ts` にdescribe「回帰検出」を作り、テスト側の局所Mockで実行出力から効果本文を落とす故障と同値sourceIndex順を逆転する故障を個別注入する（T016〜T020後）。元の独立完全DTO/順序比較と同じ期待値・比較条件がそれぞれの出力を拒否することをAssertionし、正常出力は受理する。期待JSONだけの改変やProduction編集で代用せず、Mockを解除する。
- [X] T034 [US2] `specs/016-decouple-search-test-data/verification/assertion-map.md` にT016〜T033の移行先・保持する全比較/境界・変更理由を反映し、quickstart §1〜2と `npx vitest run tests/integration/masterDataUpdates.test.ts -t '回帰検出'` のlogを `verification/results.md` に記録する。014/015/API既存期待値の修正0と、ケース変更後も原本から再開することを確認する。

**チェックポイント**: 既存A/Bは最新マスターから素材や期待値を取得せず、US3の最新C/Dも維持される。回帰2種は「故障を検出できた」テストとして成功する。

## Phase 5: User Story 1 — 正常なデータ更新を検索回帰と混同せずに確認する（P1）

**目標**: 固定A/Bを修正せず、各可変データ群の正常な追加・変更・削除と最新C/Dへの反映を証明する。US2とUS3完了を前提とする。

**独立したテスト**: `masterDataUpdates.test.ts` の「正常更新」「不正入力」を実行する。各対象群の3操作・最後の一致例削除後も固定A/Bが成功し、更新された最新入力の集合/metadataをC/Dが検証する。参照元を伴わない商品参照先削除は不正として検出する。

### 更新matrixを先に定義する

- [X] T035 [US1] `tests/integration/masterDataUpdates.test.ts` にdescribe「正常更新」「不正入力」を追加し、契約 §5とT001で発見した各依存Assertionをscenarioへ対応付ける。cards、UUID7群を個別に、各可変数値UI選択肢、home商品行、restrictions商品行の追加/変更/削除を列挙し、固定語彙/slotのvalue追加削除は仕様変更として対象外理由を記録する。slotが先頭multiでない並び替え、商品行の片側だけの増減、連動参照更新と参照先だけ削除の違い、最後の陽性例削除の期待条件を先に定義する。

### 更新入力と実行経路を接続する

- [X] T036 [US1] `tests/helpers/masterDataScenarios.ts` にLatestMasterBundleのfresh cloneからUpdateScenarioを作る型付きhelperを実装する（T035後）。scenarioId・operation・targetDataset・basis・invariants・連動更新を持たせ、cards本文/catalog/数値、7種UUID選択肢、数値候補、二画面商品行、固定語彙のlabel/color/順序を扱う。必要な参照更新を完了した入力だけを正常例とし、必須欠損・重複ID・商品参照切れの不正入力を別に作る。本番原本や歴史fixtureは書き換えない。
- [X] T037 [US1] `tests/integration/masterDataUpdates.test.ts` でT036の各scenarioを元の依存AssertionとC/Dの実行境界へ接続する。optionのSet生成前Mock・必要なmodule reset、API dataSource spy、loader fetch body、商品行export、dev handlerのworkspace内テスト専用入力を使い、更新後の識別子集合/metadata/配信bytesが実際に使われることを検証する。固定A/Bは同じ入力・独立期待値で再実行し、clone検査やhash不変だけで耐性を証明しない。既存比較が共有可能ならテスト専用helperへ最小限抽出し、全呼出元を対応表で追跡する。
- [X] T038 [US1] `tests/integration/masterDataUpdates.test.ts` に失敗/更新ケース後のfresh原本・Mock解除・module/cache隔離・入力非破壊を確認するAssertionを完成させ、正常更新と不正入力のsuiteを実行する。`specs/016-decouple-search-test-data/verification/results.md` と `verification/assertion-map.md` にデータ群×3操作の結果、対象外根拠、最新反映、最後の一致例削除後の0件契約、固定側の陽性/陰性維持を記録する。

**チェックポイント**: 対象可変データ群の正常3操作に不要な失敗0、固定入力/期待値の更新0。最新入力の参照不整合は失敗し、連動して整合させた更新は成功する。新発見のデータ群も同じ基準で完了させる。

## Phase 6: User Story 4 — 検証能力を維持した移行をレビューする（P1）

**目標**: 全テストと全依存Assertionの保証を説明でき、未移行・未検証・環境失敗を識別できる。US1〜US3の結果を使ってレビューし、最終合否はPhase 7で確定する。

**独立したテスト**: 開始時/完了時の全テスト集合と対応表を照合し、依存Assertionの100%に根拠・移行先または変更不要理由・保持する異常系/境界・実行結果があることを確認する。検査件数の一致だけで完了としない。

- [X] T039 [US4] `specs/016-decouple-search-test-data/test-inventory.md` と `verification/assertion-map.md` を完了時のtracked/未追跡テスト・Vitest収集範囲へ再照合する。追加テストと新発見依存も記載し、元の全Assertion/パラメータ条件から移行先への1対多対応、変更不要の根拠、未確認0を確認する。問題のない既存テストは変更せず全体実行の対象にする。
- [X] T040 [US4] `specs/016-decouple-search-test-data/verification/assertion-map.md` をUS1-A〜D、US2-A〜E、US3-A〜E、US4-A〜CおよびFR-001〜012/SC-001〜006と照合し、完全DTO/hash/固定ID/分類集計/順序/境界/異常系/非破壊/表示/読込/配信の欠落0を確認する。`verification/results.md` に正常3操作・異常3種・回帰2種の根拠logと未検証を整理し、parityや動的期待値への不適切な置換、skip/除外追加、根拠のない新制約がないことをレビューする。

**チェックポイント**: Story固有の保証と実行証跡が追跡できる。US4-CおよびR24の完了には、以下の横断検証まで必要。

## Phase 7: 最終品質・公開成果物・保全

**目的**: 同一作業状態でSC-001〜006を立証し、US4の完了報告を確定する。

- [ ] T041 `package.json` の既存コマンドに従い `npm run test -- --run`、`npm run lint`、`npx nuxt typecheck` を最終作業状態で実行し、`specs/016-decouple-search-test-data/verification/logs/` と `verification/results.md` にexit code・対象revision/作業ツリーを記録する。対象2ファイルだけや過去logの成功を全体成功に読み替えず、修正後は影響する検査を再実行する。
- [X] T042 `nuxt.config.ts` の既存static設定で `npm run generate` を実行し、実際の公開出力先と `data/cards.json` のSHA-256/bytesが `app/utils/mockData/items/cards.json` と一致することを `specs/016-decouple-search-test-data/verification/results.md` に記録する。環境制約による起動失敗は根拠付きの未検証とし、無断で権限や実行方法を変更しない。
- [X] T043 T042の実公開出力のJSON/JS chunk/payloadとProduction import graphを調査し、`tests/fixtures/cardSearch/historical/014-015/cards.json`・manifest・小規模fixture・既存Oracle原本/固有内容の混入0を確認して `specs/016-decouple-search-test-data/verification/results.md` に証拠を残す。ファイル名だけで合格にせず、最新公開cards.jsonや本来のUI文字列と区別し、通常CSRのAPI通信0/追加JSON取得0の既存検証も対応付ける。
- [X] T044 `specs/016-decouple-search-test-data/verification/protected-files-after.json` をT002と同じ対象集合で作成し、path集合・SHA-256・byteLengthから014/015全既存資産/API baseline/N₀ vectorの削除0・改変0、本番マスターの検証目的の変更0を確認する。生成したbefore/after自体を元保全集合へ混ぜず、`git diff --check` とProduction/マスター差分も確認して `verification/results.md` に記録する。
- [X] T045 `specs/016-decouple-search-test-data/verification/results.md` に最終のSC-001〜006判定、Story別結果、同一状態の全体品質・公開/保全検査、対象scenario/Assertionとlog、未実行/環境失敗/実不具合の区別、商品名と有効IDの意味的対応の検証限界をまとめる。全Storyと全成功基準を満たした場合だけ実装完了とし、未検証を成功へ変換しない（T039〜T044完了後）。
- [X] T046 `specs/016-decouple-search-test-data/tasks.md`、`test-inventory.md`、`quickstart.md` と `verification/assertion-map.md`・`verification/results.md` のパス/件数/実装後手順/状態を照合し、実際に完了したタスクだけをチェックする。前工程の承認記録や014/015原本を上書きせず、最終文書のリンクと `git diff --check` を確認する。検査後に実装変更が生じた場合は必要な最終検証を更新する。

## 依存関係と実行順序

```text
Phase 1: T001 → T002 → T003
                 ↓
Phase 2: T004 → T005 → {T006, T008} → T007 → fixture検証
                 ↓
Phase 3 / US3: {T009, T010} → T011 → {T012, T013} → T014 → T015
                 ↓
Phase 4 / US2: {T016〜T032} → T033 → T034
                 ↓
Phase 5 / US1: T035 → T036 → T037 → T038
                 ↓
Phase 6 / US4: T039 → T040
                 ↓
Phase 7: T041 → T042 → T043 → T044 → T045 → T046
```

- 全StoryはFoundational完了が必要。US3は他Storyなしで実装・検証できる。
- US2の最新検査移設はUS3完了が必要。US2内の既存テスト移行は別ファイル単位で並行できる。回帰検出T033は少なくともT016〜T020を前提とする。
- US1は固定A/Bを提供するUS2と更新後C/Dを提供するUS3が必要。`masterDataUpdates.test.ts` をT033とT035〜T038で同時編集しない。
- US4はUS1〜US3の結果を必要とし、最終品質・公開・保全を含めて完了する。対応表の更新自体は各タスクで継続する。
- 最新検査を外す前に移設先を設置する。異常系・固定期待値の保持を独立に検査し、異なる経路の一致だけで正解としない。
- 実行logと集約資料は同時書込を避ける。検証を実行するタスクは原則逐次にし、同一作業状態を追跡する。

## 並行実行例

以下は実装時の作業分割例であり、このTasks生成でagentや実装を起動するものではない。

### 共通基盤

T005完了後、T006（Card/DTO）とT008（商品選択肢/二画面）を並行する。T007はT006を待ち、Phase 2全体のfixture検証を完了してからStoryへ進む。

### US3

```text
実行群A（Phase 2後）:
  T009 tests/integration/cardSearchMaster.test.ts の正負例
  T010 tests/integration/searchOptionsMaster.test.ts の正負例
実行群B（T011後）:
  T012 tests/integration/searchOptionsMaster.test.ts の最新接続
  T013 tests/integration/cardSearchRealData.test.ts の最新統合
```

### US2

```text
実行群（US3後、別ファイル）:
  T016 shared/cardSearch/runner.test.ts
  T017 server/api/cards.get.test.ts
  T018 server/utils/cardSearch/search.test.ts
  T020 server/utils/cardSearch/project.test.ts
  T024 app/components/cards/result/list/ItemEffect.test.ts
  T028 app/utils/search/productSearchLocation.test.ts
```

T019/T021〜T023/T025〜T027/T029〜T032も同じ前提で並行できる。共有fixture追加が必要なら先に統合してから再開する。

### US1

T035〜T038は正常更新matrix・helper・同一test file・実行記録の依存があるため逐次実行する。US1内に独立した並行実装群は設けない。

### US4

T039の全体照合後にT040で保証をレビューする。共有するAssertion対応表とresultsへの書込競合を防ぐため逐次実行し、最終検証も同一状態で行う。

## 実装戦略

### 最初の検証可能な増分

SetupとFoundationalを完了し、最初にUS3の最新C/Dを設置する。これを移行開始のチェックポイントとし、最新検査の空白を作らずUS2へ進む。既存の未移行テストが失敗している途中状態をR24の完了としない。

### 段階的な実装

1. 開始時の全Assertionと保全hash、実行結果を確定する。
2. 歴史入力・明示fixture・独立DTOと隔離helperを完成させる。
3. US3で最新C/Dを用意し、異常3種と許容例を検査する。
4. US2で既存A/Bをファイル単位で移行し、回帰2種の検出を確認する。
5. US1で各可変群の正常3操作を元の依存Assertionへ接続し、固定不変と最新反映を確認する。
6. US4の全体対応をレビューし、全体品質・公開・保全検査と最終記録を完成させる。

**MVP範囲**: R24の受入可能な最小範囲はUS1〜US4のすべてとSC-001〜006。US1だけ、または最初のUS3増分だけをMVP完了として扱わない。

## 要件対応と集計

| 要件 | 主なタスク |
|---|---|
| FR-001/002/011、SC-001 | T001、T039〜T040、各移行の対応表更新 |
| FR-003/006/007、SC-003/005 | T002、T004〜T008、T016〜T034、T044 |
| FR-004/012、SC-002 | T035〜T038、T045 |
| FR-005、SC-003 | T016〜T034、T040 |
| FR-008/009、SC-004/006 | T009〜T015、T035〜T038、T041〜T043 |
| FR-010、SC-005 | T004/T007、T014、T017、T022〜T032、T038、T043〜T044 |
| FR-012、SC-006 | T003、T041〜T046 |

| 区分 | タスク | 件数 |
|---|---|---:|
| Setup | T001〜T003 | 3 |
| Foundational | T004〜T008 | 5 |
| US1（P1） | T035〜T038 | 4 |
| US2（P1） | T016〜T034 | 19 |
| US3（P1） | T009〜T015 | 7 |
| US4（P1） | T039〜T040 | 2 |
| 最終横断工程 | T041〜T046 | 6 |
| 合計 | T001〜T046 | 46 |

`[P]` は23件（基盤2件、US3 4件、US2 17件）。Story固有タスク32件、共通/横断タスク14件。全タスクに連番IDと具体的なファイルパスを付与し、Storyフェーズのみ `[USn]` を必須とする。
