# 契約: 検索テストの入力・最新データ検証

本契約はR24の移行設計。URL、検索意味、DTO、UI、配信方式を変更しない。正本はQuery Specification、Query Data Specification（QDS）、008/011/012/014/015の既存契約。データ提供工程やDB migrationは対象外。

承認方針は[human-decisions.md](../human-decisions.md)、入力来歴は[research.md](../research.md)と[data-model.md](../data-model.md)で追跡する。C08はHD-C08のB承認に従う。設計更新のみで実装・実行検証は未実施。

## 1. A/B: 固定入力と独立した正解

1. 歴史入力はmanifestの元bytes/hashに一致し、通常テストでGit履歴・外部取得を要求しない。
2. 014の38ケース、catalog固定ID、完全DTO、適用対象hash、015の6項目×2方向×20/50/100件・全ページ/境界、既存APIレスポンス比較を保持する。
3. 015承認済みの旧atk補正を継続し、014の旧順序/hash原本は変更しない。
4. 小規模入力は必要属性を明示し、最新マスター・歴史入力のfirst/findから素材を取得しない。015 makeSortFixturesには明示固定baseを渡す。
5. 期待値は既存Oracleまたは仕様から手書きした値。検索・sort・project自身の出力、最新入力からの自動Oracle更新、parityだけで正解を判定しない。
6. 完全DTO比較を部分比較に縮小しない。既存skip/除外を追加せず、元の陽性・陰性・異常系・入力非破壊を移行する。

## 2. 入力注入と隔離

| 境界 | 入力方法 | 隔離条件 |
|---|---|---|
| Runner/search/sort/project | 既存引数へfresh Card/SourceCard | cloneとsourceIndexは入力順に従う。呼出前後の入力非破壊も比較 |
| API | 既存dataSource.getSourceCardsのspy | 固定suiteのbeforeEachで設定、afterEachでrestore。0/1件の元配列をlocal保持 |
| composable/ResultList | 既存loader Mock | 歴史入力と目的別fixtureを明示。遅延/世代/離脱/SSRの境界を保持 |
| loader | fetchのbodyへ固定FinderCardsまたは最新入力 | module Promise cacheを必要なケースでreset。失敗後再試行とdocument内共有を維持 |
| 商品リンク/選択肢 | 対象option moduleの固定Mock | Set生成前に設定。必要な範囲だけresetModulesと動的import。最新suiteへ漏出させない |
| 商品二画面 | 固定行配列、または最新exportのclone | 共通行の固定陽性例と、最新の片側だけの行を区別 |
| dev配信 | 本来の元ファイル、更新scenarioではテスト専用ファイルpath | 本番ファイルを書き換えない。元ファイルと応答のbytes比較を保持 |

fixture準備はnormalizer spyより前に完了させ、準備中の呼出を走査回数へ混ぜない。APIのerror用throw Mock、loaderの失敗/retry、query/stateの不変を残す。

## 3. C: 最新入力の整合性

ProductionにRuntime全件validatorを追加せず、テストhelperで全レコードを検査する。

| rule | 検査 | 根拠・例外 |
|---|---|---|
| C01 root | version/generated_atがstring、cardsが配列 | FinderCards、既存loader。最新の固定値・件数は要求しない |
| C02 必須情報 | card_id/reference_label/name/card_category_code/card_category_name/product.product_nameの存在・必要な非空、使用する配列/ネスト型 | Card型とprojectCard。任意fieldを一律非空にしない |
| C03 識別子 | card_id一意、既存ID fieldの型、UUID選択肢の所定形式 | R24 FR-008、011。reference_label/名称の一意は追加しない |
| C04 catalog | full_text/archetype_textの存在・string・N₀固定点、空値状態の報告 | 014 G1、SearchSupport。最新全般の非空は要求せず、歴史入力で既存非空検査を保持 |
| C05 Effect | 参照するfieldの型、effects順序を保持 | Effect型と投影。空type/activation/condition/targetや本文のみ効果を許容 |
| C06 cost | 既存search_costの既知/不明/null、alternatives/costs/has_other_cost、component type/value、正整数または正整数range | 012契約。quantityとmin/maxの混在、min>max、非空costの構造化欠損を検出。本文再解析はしない |
| C07 選択肢 | SearchOptionの型、UUID7群の5桁ASCII hex・canonical規則、固定Natural Key/枠/コストMapping | 011とQDS。表示名/color/順序・件数は固定しない。選択肢に実カードがなくてもよい |
| C08 商品参照（B承認済み） | `/`と`/restrictions`の公開全商品行のsearchValueがproductItems.jsonに存在し、各一覧のrow.idが一意 | HD-C08 B。PRODUCT_VALUESは参照先Setとして使用できるが、membershipで対象行を事前除外しない。例外設定・除外リストなし。固定異常入力のUI fail closedも維持。二画面の集合包含は要求しない |

C06の既知cost-freeは、既存判定どおりeffect_cost_idがnullまたは空、effect_cost_textが空、search_costがnullの組。欠損/不明を「なし」に畳み込まない。type空だけをコスト検査の免除条件にしない。spell:anyは内部値として認め、URL語彙へ追加しない。

C08の参照方向は行→許可済み商品値。[008 data-model §2](../../008-open-card-set-results/data-model.md#2-product-row)のmembershipはnavigation可否の基準であって、意図的無効と参照切れの区別には使えない。検査対象を`PRODUCT_VALUES.has(searchValue)`やbuilderの成功結果で絞り込まない。空値・形式不正もそれだけで検査対象外にしない。

対象は[HD-C08 B](../human-decisions.md#承認済み-hd-c08-商品行の参照検査対象)により公開全商品行で確定した。意図的無効行は現時点で存在せず、例外設定・除外リスト・将来用機構を実装しない。将来必要になった場合、その時点で要件・除外条件・管理方法をHuman Reviewする。

公開商品行の参照先だけを削除した不正例がC08で必ず失敗することを確認する。正常更新では参照元も対応更新・削除する。固定異常入力ではUIのfail closedを別に保証し、UIが安全に表示できることを根拠に参照切れを見逃さない。

商品名とIDの意味的対応は[research §5](../research.md#5-最新入力の契約と参照方向)の確認結果に従う。008は表示名をidentityにせず、現行データにも省略名がある。名称一致・部分一致・row.idからの推定という根拠のない制約は追加しない。存在する別商品のsearchValueとの取り違えはmembershipだけでは検出できないことを検証限界として明記する。

カードの全UUIDが選択肢で網羅されること、選択肢→カード存在、異なるParameter間の短縮値重複禁止、名称の外部キー、各カテゴリ件数>0は新設しない。複数のfull IDが同じ短縮値となる場合の生成側の責務をRuntime機能へ広げない。

検査結果はdataset、recordId/index、fieldPath、ruleId、理由、仕様根拠を返す。必須欠損・重複ID・有効商品参照切れを各1つ以上注入し、対応規則が失敗を診断することを確認する。悪い入力を作っただけ、例外をcatchして成功とするだけでは検出実績にしない。

## 4. D: 最新入力の統合と公開契約

- 実loaderのfetch→SourceCard化、実dataSource→runner/API、dev handlerの元bytes配信を継続する。最新suiteは固定入力Mockを継承しない。
- 無条件検索の全ページ連結は最新入力の全card_idをちょうど1回含む。totalCountは入力数、分類別件数は元入力の分類集計、totalPagesはmax(1,ceil(totalCount/perPage))。categoryBreakdownの順序は元の出現順という既存契約に従う。
- 全6 sortキー/両方向で集合・DTO・集計を維持する。20/50/100、clamp・0件処理を確認する。独立した固定全順序はAで保証し、Dのparityへ置換しない。
- nm/rl/kw/att/カテゴリ等の単純な代表条件は、原fieldと仕様から得た独立predicateで全ID集合を検査できる。Production matcherを期待値に使わず、cost等の複雑な実装を丸ごと複製しない。
- 最新に陽性例がなければ0件契約を検証し、陽性確認済みとは記録しない。陽性・陰性はAで必ず残す。最新データの特定カード名・検索語の存在を固定しない。
- DTOは公開field whitelist、元カードのeffects順序/原文、枚数制限等の対応と内部field非公開を検証する。API/CSRの完全DTO parityは追加の統合保証とする。500/CARD_SEARCH_FAILED等の既存errorも保持する。
- 商品行は各画面を独立検証し、同じsearchValueが両方にあればlocation一致を補完する。共通部分が空でも正常。固定fixture側には共通行の陽性例を残す。
- 配信bytesの比較元は最新の配信元ファイル。static成果物のdata/cards.jsonも同じ元bytesに一致する。

## 5. 正常更新シナリオ

すべてテスト専用clone/Mock/一時入力で実施する。本番データと歴史入力・独立期待値は変更しない。対象依存Assertionを再実行し、C/Dが更新後入力を実際に使用した証拠（入力の識別、集合/metadataの変化）を残す。cloneのhash不変だけでは更新耐性の証明にしない。

| データ群 | 正常追加 | 正常変更 | 正常削除 |
|---|---|---|---|
| cards.json | 型付きの新ID Card。必要な参照を維持 | effects本文・正規化catalog・数値。cost変更時は構造化値も更新 | 任意Cardと、代表条件の最後の一致Card。固定陽性例は不変 |
| UUID7群 | 各JSONに正規valueの未使用optionを追加 | label/color/並び順。ID変更時は契約上必要な参照元を対応更新 | 各群の未使用option。productの使用値を消すなら商品行も更新/削除 |
| 数値UI選択肢 | 型・既存UI契約に沿う候補を追加 | 表示labelと順序等 | 仕様上必須でない候補を削除。検索数値を候補内だけに制限しない |
| home商品行 | 有効参照のrowを片方だけに追加 | 表示情報・有効searchValueを変更 | 片方だけから削除 |
| restrictions商品行 | 同上。homeの包含を要求しない | 同上 | 同上 |
| 固定語彙/slot | value追加は仕様変更で対象外 | label/color/順序。multiが先頭でない例を含む | value削除は仕様変更で対象外 |

UUID7群はcardType/product/faction/race/illustrator/effectActivationType/resistanceを個別scenarioへ展開する。slot/code等の対象外理由も対応表に残し、3操作を実施したと偽って計上しない。追加で依存が判明したmockData/search JSONは同じ基準で表へ追加する。

## 6. 回帰検出・保全・完了

本文を投影出力から落とす誤りと、同値sourceIndex順を逆転する誤りをテスト側の局所Mockで与え、対応する既存固定比較が拒否することを確認する。比較対象JSONを単に変えただけの検査で代用せず、故障を与えた実行出力と元の独立期待値を比較する。Productionファイルは編集しない。

014/015の全既存資産、API baseline、N₀ vectorを実装前後のbytes hashで照合する。マスターデータに検証目的の変更がないこと、Production importにfixtureがないこと、生成した公開ファイルにfixture/manifest/Oracle原本がないことも確認する。

全体テストと品質検査を同一作業状態で成功させ、Assertion対応表・更新3種・異常3種・回帰2種・保全・非公開・未検証事項を検証記録へ集約する。途中段階、未実行、環境起因の不能を完了としない。
