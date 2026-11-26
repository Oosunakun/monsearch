# Query Data Specificationに伴う改訂候補

**状態** 当時の改訂候補と、後から確定した規則を記録する。「改訂注記」は現行の扱いを示す。 [現行のQuery Data Specification](query_data_specification.md)

[Decision履歴](query_data_specification_note.md)に基づく影響調査。通常・追加イニシアチブへの所持Modifier追加、識別子の照合、コスト検索の公開前提を扱う。イニシアチブのModifierは通常が `itm`、追加が `aitm` で、対応するComparison `it` / `ait` より先に出力する。

## 合意した意味

> **改訂注記（HD-01）**　通常側は非TokenのUnit、追加側は非TokenのItemのうち `item.item_category_code === 'Equip'` のカードが対象。分類で識別できれば対応詳細や能力行が欠損しても「なし」に一致する。`item` 自体がなくEquipと識別できないItemは対象外。Tokenは `unit`・`item.equip` の存在で各グループの適用を判定する。対象外は「あり」「なし」のどちらにも一致しない。 [正式仕様 §2.3](query_data_specification.md#23-通常能力追加能力の適用対象)

- 全13数値条件は非NULLの実数値のみを通常比較する。NULLは「なし」、0は実数値で、相互変換しない。
- 通常・追加のinitiative / charge / defenderは`include`が非NULL（0を含む）、`exclude`がNULL、`all`が有無不問。Hero Pointも同じModifier語彙を使い、`exclude`時は`is_hero`を参照しComparisonを評価しない。
- イニシアチブの既存Comparisonを維持し、通常・追加に`itm` / `aitm`の所持Modifierを追加する。canonical orderは`itm → it`、`aitm → ait`。
- Modifier単独を有効な条件とする。`include`はComparisonがあれば追加評価し、`exclude`はComparisonを検索評価・Canonical URL出力に使用しない。ParserはForm内にComparisonを保持できる。Levelは`is_instant_summon`とLevel Comparisonを独立評価する例外とする。

## 当時の影響範囲

| 層 | ファイル | 改訂候補 |
|---|---|---|
| URL Query Specification | `docs/architecture/query_specification.md` | `itm` / `aitm`、canonical順序、default省略、exclude時Comparison省略を反映済み。既存Comparisonは維持する |
| Query Object / UI型 | `app/types/ui/search.ts` | initiative / additionalInitiativeの数値条件にfilterを追加し、LogicalCardSearchQueryのAlias型を拡張する |
| Query mapping | `app/utils/search/cardSearchQuerySchema.ts` | Alias一覧を正式仕様の順序に合わせて拡張する |
| 初期化・reset | `app/utils/search/cardSearchFormFactory.ts` | 両initiativeのfilter初期値を扱う |
| Builder | `app/utils/search/cardSearchQueryBuilder.ts` | 両initiativeのModifierを出力する。既存putFilteredの比較必須条件を見直し、Modifier単独の出力に対応する |
| Parser | `app/utils/search/cardSearchQueryParser.ts` | 両initiativeのModifierを復元する。比較成功にModifier適用が依存する構造を見直す |
| 通常initiative UI | `app/components/cards/search/unit/SearchFieldInitiative.vue` | 所持選択・変更判定・resetに対応する |
| 追加initiative UI | `app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue` | 所持選択・変更判定・resetに対応する |
| 共通filter UI | `app/components/cards/search/shared/SearchFilterWithOperator.vue` | 現在はinclude時のみ数値欄を表示する。all / excludeと比較条件の組合せを、後続Decisionと整合させる |
| 検索 | `server/utils/cardSearch/search.ts` | NULLを数値比較から除外し、現excludeの比較否定を所持判定へ変更する。it / aitも対応する |
| DB由来データ型 | `types/cards/finderCards.ts` | Abilityの数値型がnumberのみのため、NULLを表現可能にする。Query側null（条件未指定）とは意味を区別する |
| projection・表示 | `server/utils/cardSearch/project.ts`ほか | nullable型の伝播、APIレスポンス・表示の数値処理を確認する |

## 下位仕様の改訂候補

当時のBuilderと条件編集の設計には、比較を伴うときだけModifierを扱う規則があった。以下の5文書は、所持Modifierを単独でも扱えるようにする際の改訂候補だった。

| 当時の対象文書 | 位置付け |
|---|---|
| `specs/002-query-builder/data-model.md` | 数値条件とModifierを保持するデータモデル |
| `specs/002-query-builder/contracts/card-search-query.md` | Builder・ParserによるModifierの出力と復元の契約 |
| `specs/002-query-builder/research.md` | 比較を伴う場合にだけModifierを出力する旧設計の判断根拠 |
| `specs/005-search-condition-edit/data-model.md` | URLから編集フォームへ条件を復元し、再検索のQueryを生成するデータモデル |
| `specs/005-search-condition-edit/contracts/search-condition-edit.md` | 検索結果から編集画面へ移動し、条件を復元して再検索する際の契約 |

`specs/009-backend-card-search/spec.md` にある旧検索と同じ結果集合を維持し、新しい検索規則を追加しないという要件は、バックエンド移行当時の範囲に適用された。後続の検索意味論を旧実装に合わせるための要件ではない。

> **改訂注記**　現行仕様では `include` / `exclude` をComparisonなしでも評価する。 [正式仕様 §5.2](query_data_specification.md#52-所持modifier)

## 検証の改訂候補

対象はfactory / Builder / Parser / fixtures / Router / search page / server search / cards API / projectionと、nullable値を表示する箇所のテスト。

- 両initiativeのModifier単独・Comparison併用・all省略・round-trip。
- 全数値項目のNULL非ヒット、0の通常比較、正負の比較。
- 6能力値のNULL / 0 / 正数 / 負数と所持条件の組合せ。
- 関連行なし・複数行・`exclude + Comparison` を今回の Modifier semantics に従って検証する。`exclude` は値なしを評価し、Comparisonを検索評価に使用しない。複数行は現状のゲームデータにはなく、防御的ケースとして扱う。

## mockと実カードの区別

mockの通常initiative335件中243件、追加initiative9件中5件が0である。合意した仕様では、この0はすべて実数値であり「あり」に分類される。ユーザーが説明した実カードの0表記不存在とはデータ上の差がある。

英雄点・charge / defenderにもmockの0が存在するが、検索側でNULLへ変換したり「なし」に読み替えたりしない。実カードとmockの整合性・データ修正は別途確認する。

## 改訂事項と別途決定事項

### UUID受理と空のPair Modifier（D60〜D61）

当時の候補では、選択肢集合だけによる値の削除を見直し、有効形式でも対応Database IDがない短縮UUIDは条件に残して非ヒットとした。他のCollection値はORで評価する。形式には16進数字・大文字小文字を区別しない照合・所定長を求め、具体的な長さと固定長か最低長かは保留した。Mapping外のNatural Keyは検索条件から除外する。 [D60〜D63の経緯](query_data_specification_note.md#残るmappingと入力の境界)

> **改訂注記**　Short UUIDはASCII 16進固定5文字に確定した。受信は大文字小文字を区別せず、小文字をcanonical表記とする。 [正式仕様 §4.2](query_data_specification.md#42-短縮uuid)

Pairを伴わない`or / and`は検索条件にせず、再構築時にも省略する。`none`単独は保持する。Builder / Parserと契約・テストをこの区別へ整合させる。

### affinity分類軸の不整合（D56）

mockはcategory=`Resistance`、modifier type=`DamageDecrease`である一方、Schema CHECKは`Resistance / Weakness`をmodifier側、`DamageIncrease / DamageDecrease / DamageBlock`をcategory側で参照する。分類軸の正しい配置と修正対象は別途データモデルとして確認する。検索SemanticsはID照合で確定しており、どちらの配置を採るかには依存させない。

現検索のcategory絞り込み・名称等による照合は、`re / are`の短縮UUIDによる`affinity_id`照合へ整合させる改訂候補。`affinity_value`は条件に含めない。

### コスト検索の公開前提（D52）

Domain SemanticsはQuery Data Specificationに定義し、構造化・Schema変更・migration・解析・人手確認・公開制御は別途設計する。必要な構造化と検証の完了まで公開対象としない。部分解析検索・解析不能なら非ヒットというfallbackは採用しない。

現状の改訂候補：

- `app/components/cards/search/layout/SearchFormEffect.vue`と3つの`SearchFieldCost*.vue`：未公開中の入力・送信を制御する。
- `server/api/cards.get.ts`：既存URLや直接APIからコスト条件が指定された場合の未提供時の扱いを設計する。
- `app/composables/useCardSearch.ts`、`app/pages/cards/index.vue`：未評価条件を適用済み結果として見せない応答・表示を設計する。
- UI / URL / APIの各入口と、公開後のDomain Semanticsを検証する。

URL語彙の定義自体を削除することは決定していない。構造化方式・公開完了基準・未提供時応答・fallbackは未決定で、検索中の暗黙の非ヒット処理とは区別する。

### 数値・所持条件

> **改訂注記**　対象7項目のComparison単独URLは直接開くと比較を評価する。編集フォームに復元した `all` で再検索すると両Aliasを省略する。`include` に切り替えると保持したComparisonをModifierとともに出力する。`exclude` はModifierのみを出力し、受信時も比較を評価しない。数値・演算子は同じフォーム内に保持する。`lvm` と `lv` は独立し、`hem=exclude` は英雄点の比較を評価しない。 [正式仕様 §5.2・§5.3](query_data_specification.md#52-所持modifier)

この文書は改訂候補の記録であり、URL仕様改訂の承認・実装変更の完了を示すものではない。本書の元となるDomain SemanticsはQuery Data Specificationで承認済みである。
