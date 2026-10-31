# テスト棚卸しとAssertion移行方針

**調査日**: 2026-10-31。`git ls-files '*.test.ts'`の全29ファイルとapp/server/shared/dev配下の実ファイルを照合した。追加AGENTSなし。既存Vitest設定は`**/*.test.ts`を収集し、`.memo`等を除外する。全行は静的確認済み、実行結果は未検証。

A＝固定入力の振る舞い、B＝固定入力と独立した完全DTO、C＝最新整合性、D＝最新統合。以下の番号は計画上の追跡IDであり、実装時に各describe/it/パラメータ条件/Assertionへ展開する。29は将来の上限ではない。

## 変更候補17ファイル

| ID | 元テスト | 依存・正常更新の影響 | 移行先と保持するAssertion |
|---|---|---|---|
| I01 | `shared/cardSearch/runner.test.ts` | getSourceCards→最新cards。本文/数値/追加/削除で014/015の完全比較・149件が変わる | A/B: 歴史入力。38ケース・全ページ/境界・完全DTO・適用hash・固定ID・集計・149件・非破壊を保持。合成sortは固定base。最新Dを別suiteへ |
| I02 | `server/api/cards.get.test.ts` | dataSource・cards直読・実カードclone。履歴と最新が混在 | A/B: 歴史入力と小規模例。014/015/API16レスポンス、status/error、公開field、kw全ページ、全順序・DTOを保持。最新D/parityは別suiteへ |
| I03 | `server/utils/cardSearch/search.test.ts` | cardsの既知ID・先頭/find素材と境界clone | A: 固定全IDは歴史入力。目的別の小規模Cardでkw/att/数値/通常追加/同一Effect/コスト/欠測/正規化回数を保持 |
| I04 | `server/utils/cardSearch/sort.test.ts` | 実カードbaseをmakeSortFixturesへ渡す | A: 明示固定base。手書きfixtureOrders、0/正負/欠損、unit/equip、rarity未知、同値/同ID、非破壊を保持 |
| I05 | `server/utils/cardSearch/project.test.ts` | 実カードclone由来の入力 | B: 明示Cardと手書き完全DTO。制限値0〜4/null/空、必須欠損、内部field除外を保持。projectCardで期待値を生成しない |
| I06 | `server/utils/cardSearch/normalizeCatalogText.test.ts` | 最新cardsを482件・非空と断定 | A: vector不変、歴史入力で482件/非空も保持。C: 最新全件の存在/string/N₀固定点を同時追加し空値状態を報告 |
| I07 | `app/composables/useCardSearch.test.ts` | loader Mockが実cardsを返し015順序と比較 | A/B: 歴史入力または小規模fixture。6キー×2方向の固定ID、SSR/retry/世代/再取得/初回検索を保持 |
| I08 | `app/components/cards/result/layout/ResultList.test.ts` | loader Mockの実cardsと482件・015固定順 | A/B: sortは歴史入力、単純描画は固定DTO。desktop/mobile操作、page reset/perPage維持、独立ID順を保持 |
| I09 | `app/components/cards/result/list/ItemEffect.test.ts` | projectCard(getSourceCards()[0])の土台DTO | B: 完成済み固定DTOを直接渡す。本文・通常/本文のみ・順序・改行・区切り・ラベルを保持 |
| I10 | `app/components/cards/result/list/ItemHeaderName.test.ts` | 同じ実カード由来DTO | B: 固定DTO。枚数制限とprops更新・表示を保持 |
| I11 | `app/pages/cards/index.test.ts` | 実cards投影→mock state | B: 固定DTO。状態連携・表示・通常API非依存を保持 |
| I12 | `app/utils/cardSearchDataset.test.ts` | fetch Mockのbodyが実cards、482件・順序固定 | A: 固定FinderCards。sourceIndex/全順序/共有cache/失敗/retryを保持。最新JSON受理はDを同時追加 |
| I13 | `app/components/products/ProductTableRow.test.ts` | component→buildProductSearchLocation→PRODUCT_VALUES→productItems.json。22d7e削除で陽性linkが消える | A: 固定商品選択肢Mock。desktop/mobile、pointer/keyboard、名称のみlink、無効値を保持。最新商品連携C/Dを追加 |
| I14 | `app/utils/search/productSearchLocation.test.ts` | 同経路で22d7e/ce193/9f77fの存在を要求 | A: 固定選択肢。同名別ID、pdだけのlocation、入力非破壊、無効値を保持 |
| I15 | `app/utils/search/cardSearchQueryRouter.test.ts` | 商品navigation caseだけ上記membershipへ依存 | A: 固定商品選択肢で既存URL期待値を保持。Unicode/reload/bookmark/大小文字の独立契約は維持 |
| I16 | `app/pages/product-set-navigation.test.ts` | mockData/indexPageの商品全行がrestrictionsにもあると要求 | A: 固定二画面の商品行で共通セットの独立location一致を保持。D: 最新の各画面を個別検査、共通部分の一致を補完。集合包含は008の要求外と記録 |
| I17 | `app/pages/cards/search.test.ts` | 実子component→ITEM_SLOT_OPTIONS→itemSlotItems.json。先頭incrementをmultiと仮定 | A: 該当ケースの固定選択肢Mockでmultiの陽性操作を維持。UI順変更で壊さず、既存push `{is:'multi:1'}` と全URL復元ケースを保持 |

I01〜I12は従来の直接依存群、I13〜I17は今回の追加発見。実装時には問題を確認したAssertionだけを変更する。各ファイル全体を一律Mock化しない。

## 変更不要12ファイルと根拠

| ID | テスト | 確認済みの入力と変更不要理由 |
|---|---|---|
| I18 | `dev/cardsJsonHandler.test.ts` | D: 最新ファイルbytesとhandler応答bytesを比較。GET/405/path/500/retryを含み、過去の全文を期待していない |
| I19 | `app/utils/search/cardSearchQuerySchema.test.ts` | C: items barrel→7種のShort UUID JSONを全件形式検査。固定配列・件数なし。形式の固定正負例も維持 |
| I20 | `app/components/cards/search/shared/SearchSlotSelector.test.ts` | 手書きitems propsで操作検証。実マスター不要 |
| I21 | `app/composables/useCardSearchForm.test.ts` | 手書きform/factory。マスターの観測値に依存するAssertionなし |
| I22 | `app/composables/useQuickSearch.test.ts` | 手書きstateとrouter Mock。マスター依存なし |
| I23 | `app/utils/sample.test.ts` | 算術。検索データ依存なし |
| I24 | `app/utils/search/cardSearchFormFactory.test.ts` | defaultsと独立clone。barrel経由のJSON読込はあるが内容の観測値を固定していない |
| I25 | `app/utils/search/cardSearchQueryBuilder.test.ts` | 手書きformとURL契約。Natural KeyはQDS固定語彙、UUIDは形式契約 |
| I26 | `app/utils/search/cardSearchQueryParser.test.ts` | 同上。有効形式の未知UUIDを保持する正負例もあり最新membershipに依存しない |
| I27 | `app/utils/search/quickSearchQueryBuilder.test.ts` | trimとaliasの手書き期待値。JSON依存なし |
| I28 | `app/utils/search/quickSearchQueryRouter.test.ts` | 手書きqueryのrouter round trip。JSON依存なし |
| I29 | `server/utils/cardSearch/paginate.test.ts` | 合成121要素。20/50/100、clamp、0件境界に最新cards不要 |

「変更不要」は今回の静的判断であり、全体回帰の実行免除ではない。I19の空集合でeveryが成功することを、陽性例の検証や空集合禁止の根拠にしない。

## データ群と間接経路の監査

- cards: dataSource、projectCard、loader Mock、fetch Mock、ファイル直読まで含めI01〜I12/I18を追跡した。
- UUID選択肢: `cardTypeItems/productItems/factionItems/raceItems/illustratorItems/effectActivationTypeItems/resistanceItems.json`の7群。I19が形式検査し、productはI13〜I16がmembershipに依存する。
- その他の選択肢: items/optionsの再公開、Form/Parser/Builder、実子component経由を確認。QDSの固定語彙を保持し、数値候補の観測値と順序を固定しない。順序依存の問題はI17で確認した。
- 商品行: indexPage/restrictionsの2配列をI16が直接使用。restrictionsが読む`rule_restriction.json`の内容は当該Assertionでは未使用。読込経路の存在と検証対象への依存を区別する。
- その他のmockData JSON: rules/about等を含む追加のAssertion依存は今回確認されなかった。新しい品質契約や参照検査を追加する理由にはしない。実装開始時の再探索は省略しない。

## 実装時のAssertion対応表

`verification/assertion-map.md`に次の列を必須とする。上のI番号から元の全Assertionとパラメータ化条件へ展開する。実行前は「未実行」、環境失敗は根拠付きで記録する。

| 列 | 記録内容 |
|---|---|
| 識別 | I番号、元file/describe/it、条件・Assertion位置または一意な説明 |
| 保証 | 元の検証意図、仕様の節/FR、固定契約か観測値か |
| 依存 | 直接/間接の全経路、対象データ群、Mock/cacheの影響 |
| 更新影響 | 正常追加/変更/削除の各影響、連動更新、対象外の根拠 |
| 移行 | A/B/C/D、移行先file/case、入力fixture/最新入力 |
| 維持 | 独立期待値、完全比較、異常系・境界・非破壊、旧atk補正 |
| 判断 | 変更要否・理由。新しい制約を追加していない根拠 |
| 結果 | 対応する実行log、成功/Assertion失敗/環境失敗/未実行 |

完全DTO/hash/固定ID/境界を単に削除して動的件数・parityに置換した行は不適合。テスト件数の一致だけでは移行完了と判定しない。
