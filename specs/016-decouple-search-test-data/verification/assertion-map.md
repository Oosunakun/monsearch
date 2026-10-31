# Assertion対応表（開始時の草稿）

状態: T001作業中。29ファイルの列挙と開始時の構文抽出まで完了。移行は未実施、実行結果はnpm起動時の環境失敗。下記I番号は [棚卸し](../test-inventory.md) を継承する。

再開時の追記: 下記「再開時の意味レビュー」でI01/I02/I05/I06の計122位置を規則・依存・移行先へ対応付けた。残り25ファイル406位置と全体のパラメータ展開照合は未完了。T001は未完了のまま維持する。既存表と開始時抽出記録は保持する。

[assertion-index-before.json](assertion-index-before.json) の `files[].file` と各 `assertionSites[].line` を組み合わせ、開始revision `c0d63bd27c407da81a5c7a5dea55f7bb68b24765` の元Assertionを特定する。`contexts` にケース宣言・パラメータ化/ループ・import・Mock/cache・ファイル読込等の周辺を保持する。保存したSHA-256で元ファイルを識別できる。

この構文抽出はAssertion単位の意味レビューを代替しない。各位置に対する仕様根拠、3操作の個別影響、固定契約/観測値、A/B/C/D、移行先、独立期待値、境界/異常系、結果の確定は継続作業。全件確認済み・未確認0とは記録しない。以下は前工程から継承した予定であり、移行後の実績ではない。

完全DTO/hash/固定ID/境界の削除・縮小、Oracleの修正、skip/除外追加は未実施。本文欠落・同値順逆転、必須欠損・重複ID・商品参照切れ、正常3操作は未実装・未検証。全行の実行結果は [results.md](results.md) の変更前テストに対応し、テスト未検証。

| ID | 元テスト | 開始時に継承した依存・更新影響 | 移行予定・保持対象（未実施） |
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

## 再開時の意味レビュー（2026-10-31）

開始時indexを上書きせず、実ファイルのhashが全29件一致することを確認して位置を再利用した。以下は静的な意味レビュー・移行予定であり、移行済み・テスト成功の記録ではない。元Assertionは後続の位置表からindexのcodeと照合する。行範囲の途中で続く複数行式も、式全体と周辺ケースを読んで分類した。

### 仕様根拠と共通規則

- R24: [spec FR-003〜010 / US2〜3](../spec.md)、[契約A/B/C/D](../contracts/search-test-data.md)。固定完全比較は縮小せず、最新入力検査を同時に用意する。
- F014: [受入G2〜G4](../../014-search-catalog-normalization/contracts/acceptance-evidence.md)。catalog固定ID、表示原文、全ページ/境界、query正規化回数、入力非破壊。
- F015: [ソート契約](../../015-search-result-sorting/contracts/search-result-sorting.md)。6キー×2方向、20/50/100、数値group/欠損/sourceIndex、全件集合/DTO/集計、旧atk補正。
- F013: [枚数制限仕様](../../013-deck-restriction-display/spec.md)。0/1/2表示・制限値の投影。0〜4/null/空文字の既存ケースを減らさない。
- F012: [効果コスト契約](../../012-effect-cost-search/contracts/effect-cost-search.md)。同じ効果内の構造化cost、数量・none/unknown等の区別。
- HTTP: [API実装](../../../server/api/cards.get.ts)、[runner](../../../shared/cardSearch/runner.ts)、[clientQuery](../../../shared/cardSearch/clientQuery.ts)。既存エラー/status・個別補正・transport保持。

以下の規則表の「影響」は、**追加／変更／削除**の順。歴史入力や手書き固定値そのものは不変であり、影響の記述は現行テストが最新入力を使う問題について示す。文字数や実行ケース数ではなく開始時expect含有位置の集計である。各規則の結果はすべて「静的確認、移行未実施・実行未検証」。

| 規則 | 検証意図・条件展開 | 依存と3操作の影響 | 固定契約/観測値・変更要否 | 責務・移行先・独立期待値と維持する境界 |
|---|---|---|---|---|
| R01 | I01:014の38ケース、各pages/boundaries。非atkのみresponseFields/hash、atkは015補正 | dataSource→cards、014 baselineと015 helper。追加で集合/ページ、変更でDTO/検索、削除で集合/ページが不一致 | 検索処理は固定契約、現在のDTO/ID集合は観測値。入力変更が必要 | A/B:同runner.testの歴史sources。既存baseline全DTO/hash、015補正を保持（F014/F015） |
| R02 | I01:catalog.realCasesすべて、perPage100で全ページを連結 | cardsの専用catalog。追加でhit集合、変更でhit、削除で集合が変わる | 固定IDは当時入力の観測値。入力変更 | A:同runner.testの歴史sources＋既存catalog Oracle。期待IDのid昇順、件数を維持（F014） |
| R03 | I01:kw=ダメージ149件と検索前後の入力同一性 | cards。追加hitで件数増／catalog変更で増減／削除hitで減 | 149は観測値、非破壊は固定契約。入力変更 | A:歴史sourcesで149も保持。最新Dでは特定語の陽性存在を固定しない（F014） |
| R04 | I01:6キー×2方向、reverseした合成9行、prepared/query/source非破壊 | makeSortFixtures(getSourceCards()[0])。追加で先頭素材変更の可能性／非上書きfield変更／空集合化で素材消失 | 手書き順は固定契約。base取得のみ変更 | A:明示Cardをbaseに渡しfixtureOrdersを保持。preparedのJSON比較は関数内容検証ではない限界も保持（F015） |
| R05 | I01:6×2×3の全ページ、連結集合/重複、999clamp、0/1件 | cards＋固定全ID/projected。追加で全件/ページ、変更で順/DTO、削除で集合が不一致 | 期待順規則は契約、全ID/DTOは観測値。入力変更 | A/B:歴史sources。期待DTOは014、順序は015。reference由来metadata比較を独立集計の代わりにしない。最新Dも追加（F015/R24） |
| A01 | I02:6×2の合成sort、status200・手書き順・CSR parity | API dataSource spy＋実カードbase。追加/変更/削除でbase取得が揺れる | sort/statusは契約、素材は可変。base変更 | A/B:同API testの固定base＋fixtureOrders。parityだけで正解としない（F015/HTTP） |
| A02 | I02:6×2×3、全ページ＋999、0/1件、全DTOとCSR parity | 実cards＋014 DTO/015 IDs。追加でページ/集合、変更でDTO/順、削除で集合が変化 | 全DTO/IDは観測値。入力注入を変更 | A/B:歴史sourcesをlocal保持してslice。afterEach restore、mock済getSourceCardsで元入力再取得しない（F015） |
| A03 | I02:expectAllCatalogPages共通helper。kw/attのrealCases・fixtureCases・boundariesで使用 | realはcards、合成も実カードfind/clone。追加/変更でhit/素材、削除でhit/素材が消失 | helperのstatus/page計算は契約、固定IDsは入力対応。callerの入力変更 | A:realは歴史入力、合成/欠測/literalは明示base。helper内7位置が全callerに適用されることを保持（F014） |
| A04 | I02:count=0/1/7/101×kw/att/両方/空条件/空白の5組、getter時点の正規化回数 | makeCatalogCardsが実カードfind。追加/変更/削除で素材選択が揺れる | 各有効queryを走査前1回は固定契約。素材変更 | A:固定catalog base。準備後にnormalizer spy設定、配列作成・getter・dataSource・HTTP応答時点の回数を維持（F014 G4） |
| A05 | I02:014の38ケース全ページ・境界、status/完全DTO/metadata非公開/非atk hash/field順/allIds | 実cardsと固定Oracle。3操作でDTO/集合/順序のいずれかが変わる | 入力更新が原因の不一致。固定入力へ | A/B:歴史入力。旧atk補正分岐・responseFields・非公開field・連結全順を削除しない（F014/F015） |
| A06 | I02:kw=対象×6×2×20/50/100、全ページ・分類集計・全DTO | catalog固定IDと014 DTO。追加でhit、変更でDTO/hit/順、削除でhit減 | 固定399件等は観測値。入力変更 | A/B:歴史入力＋catalog broad-keywordの独立IDs、014分類とDTO・015順。最新Dの不変条件を追加（F014/F015） |
| A07 | I02:catalogのkw/att AND＋token合成A、cc=unitでは非hit | makeCatalogCardsの実カードbaseのみ可変。3操作で素材が揺れる | 合成Aの原文/集計/非公開/非破壊は固定契約。base変更 | A/B:明示base＋既存fixtureCards。Unit集計とtoken検索の違い、空結果、非破壊を維持（F014） |
| A08 | I02:catalog付きdataSource throw→500とerror body | throw Mockのみ。3操作の影響なし | errorは固定契約。Assertion変更不要 | A:既存API testを維持。CARD_SEARCH_FAILED/statusCode/messageを保持（HTTP） |
| A09 | I02:API baseline16ケースのstatusとdeck制限除外後の完全レスポンス | 実cards＋訂正済API fixture、atkのみ015/014補正。3操作で結果変化 | 観測値の固定比較。入力変更 | A/B:歴史入力。sourceBaseline/currentInputを区別し既存fixture・atk分岐を保全（F013/F015） |
| A10 | I02:同名21行、id両方向とpage2/20、制限0/1/2/null | 実先頭カードclone。追加/変更/削除でbase変化 | 名前が同じでもIDと値が対応する契約。base変更 | B:明示Cardで21行を構成。同名・null・ページ境界を保持（F013） |
| A11 | I02:実カード5例の制限値・公開field・modification非公開 | 特定name/reference存在。追加で同名候補、変更で名前/制限、削除で対象消失 | 特定カード存在は観測値。固定例と最新対応へ分離 | B:固定5例の0/1/2/nullを保持。D:最新全IDで元modificationとの対応、特定名非依存（F013/R24） |
| A12 | I02:実データにない3/4/nullを注入し実handlerで投影 | 実先頭baseのみ可変、3操作で素材が揺れる | 投影契約。base変更 | B:明示base、実handler/status/1件/値の完全な対応を保持（F013） |
| A13 | I02:一般dataSource障害→500/CARD_SEARCH_FAILED | throw Mock。3操作影響なし | 固定error契約。変更不要 | A:既存API test、例外を成功にしない（HTTP） |
| A14 | I02:parser graceful/既定page、server filter→projectionの構造 | source readFile＋手書きquery、データ内容の読取なし。3操作影響なし | 固定経路契約。変更不要 | A:既存構造Assertion保持。Production source文字列はデータOracleではない（HTTP） |
| A15 | I02:trash:1の陽性・未filterより少ない・filter元との一致 | 実cards＋同じmatchesCardSearchで期待値生成。追加/変更/削除で陽性/差が消え得る | 存在仮定は観測値。入力変更、独立正解の補完要 | A:明示hit/nonhitで既存数量・件数・経路Assertionを保持。matcher由来expectedは経路整合の補完であり唯一の正解にしない（F012/R24） |
| A16 | I02:HTTPとCSR完全DTO parity、代表16query | 両方が同じ実cards。3操作で応答は変わるが両経路一致の保証は適切 | Dとして必要、固定正解ではない。suite分離 | D:tests/integration/cardSearchRealData.test.tsへ。queryの陽性を暗黙に要求せず、正解は固定A/Bで別保証（HTTP/R24） |
| A17 | I02:null/undefined/配列/空/記号/constructor等4queryのtransport | echo handler＋手書きquery。データ非依存、3操作影響なし | 固定HTTP表現契約。変更不要 | A:既存API testのufo/h3を独立比較元として維持（HTTP） |
| P01 | I05:制限0〜4/null/空文字/null改訂情報の8組 | 実カードclone。追加で先頭変更／field変更／全件削除で素材消失 | 投影・非破壊は契約。素材変更 | B:明示Card＋独立完全DTO、既存値とmodification非公開/元入力不変を維持（F013/R24） |
| P02 | I05:新object、search_support/tags/errata/flavor_text非公開、product_nameのみ | 実先頭Card。3操作で素材変化 | 公開fieldは固定契約。素材変更 | B:明示Cardと手書きDTO。product期待値のinput参照だけで完全投影保証としない（R24） |
| P03 | I05:name空ならundefined | 実カードcloneのみ可変、3操作で素材変化 | 必須field欠損の契約。素材変更 | B:固定正常Cardからnameだけ空にし既存除外Assertionを保持（R24） |
| N01 | I06:固定vector全例の変換/冪等性、172幅文字・ASCII26文字の全数 | 独立vectorのみ、3操作影響なし | 件数172/26は仕様の範囲で観測値ではない。変更不要 | A:vectorと既存全数Assertion保全（F014 G2） |
| N02 | I06:482件とfull_textの存在/string/非空/N₀固定点 | 実cards。追加で件数増／空文字変更／削除で件数減 | 482/非空は歴史入力の観測値、型/固定点は契約。分離 | A:歴史入力で全Assertion保持。C:最新全件の存在/string/N₀固定点と空値報告を同時追加（R24 C04） |
| N03 | I06:482件とarchetype_textの存在/string/非空/N₀固定点 | N02と同じ経路。追加/変更/削除で同様に変化 | N02と同じ | A/C:N02と同じ責務分離。最新非空という新Gateを追加しない（F014/R24 C04） |

### Assertion位置ごとの対応

次の表は開始時indexの各位置を上の意味規則へ展開したもの。元codeはindexで保持し、式を再生成・書換えしていない。各行は規則表の仕様根拠・依存/3操作・変更要否・移行先/期待値・境界と共通の未検証結果を継承する。規則表の条件展開は静的に確認した範囲であり、Vitestの実収集・全実行ケース数は未確認。

<!-- resume-assertion-sites -->

| 元ファイル | 開始時行 | 意味規則 | 静的レビュー／実行 |
|---|---:|---|---|
| `server/api/cards.get.test.ts` | 46 | A01 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 47 | A01 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 48 | A01 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 49 | A01 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 62 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 63 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 64 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 67 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 68 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 74 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 75 | A02 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 104 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 105 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 106 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 107 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 108 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 109 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 113 | A03 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 168 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 173 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 180 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 181 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 182 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 183 | A04 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 195 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 198 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 199 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 201 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 202 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 206 | A05 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 229 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 230 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 231 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 232 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 234 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 237 | A06 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 249 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 250 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 251 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 252 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 253 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 254 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 255 | A07 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 262 | A08 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 263 | A08 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 271 | A09 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 278 | A09 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 302 | A10 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 303 | A10 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 305 | A10 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 307 | A10 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 322 | A11 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 323 | A11 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 325 | A11 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 326 | A11 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 327 | A11 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 337 | A12 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 338 | A12 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 339 | A12 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 345 | A13 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 346 | A13 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 353 | A14 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 354 | A14 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 355 | A14 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 358 | A14 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 360 | A14 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 366 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 367 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 384 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 385 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 386 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 387 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 388 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 389 | A15 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 402 | A16 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 404 | A16 | 確認済み／未実行 |
| `server/api/cards.get.test.ts` | 416 | A17 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 8 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 9 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 15 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 16 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 17 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 18 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 19 | N01 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 26 | N02 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 28 | N02 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 30 | N02 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 31 | N02 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 32 | N02 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 37 | N03 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 39 | N03 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 41 | N03 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 42 | N03 | 確認済み／未実行 |
| `server/utils/cardSearch/normalizeCatalogText.test.ts` | 43 | N03 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 18 | P01 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 19 | P01 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 20 | P01 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 21 | P01 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 26 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 27 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 28 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 29 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 30 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 31 | P02 | 確認済み／未実行 |
| `server/utils/cardSearch/project.test.ts` | 36 | P03 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 21 | R01 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 25 | R01 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 36 | R02 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 40 | R02 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 44 | R03 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 46 | R03 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 60 | R04 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 61 | R04 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 62 | R04 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 63 | R04 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 64 | R04 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 73 | R05 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 76 | R05 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 77 | R05 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 78 | R05 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 81 | R05 | 確認済み／未実行 |
| `shared/cardSearch/runner.test.ts` | 82 | R05 | 確認済み／未実行 |
