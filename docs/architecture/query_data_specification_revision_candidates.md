# Query Data Specificationに伴う改訂候補

**Status:** [Query Data Specification 1.0.0](query_data_specification.md)に伴う改訂一覧。正式URL仕様・実装の変更は未実施。

[Decision履歴](query_data_specification_note.md)に基づく影響調査。通常・追加イニシアチブへの所持Modifier追加、識別子の照合、コスト検索の公開前提等を扱う。Aliasは未決定であり、この文書では命名しない。

## 合意した意味

- 全13数値条件は非NULLの実数値のみを通常比較する。NULLは「なし」、0は実数値で、相互変換しない。
- 通常・追加のinitiative / charge / defenderは`include`が非NULL（0を含む）、`exclude`がNULL、`all`が有無不問。
- イニシアチブの既存Comparisonを維持し、通常・追加に所持Modifierを追加する。
- 適用対象カードの能力行なしはexcludeに一致し、Comparisonには不一致。所持とComparisonはANDとし、矛盾は0件。複数行は合算せず、各条件を満たす行の存在で判定し、常備能力には同一行制約を課さない（D37〜D40）。

## 影響範囲

| 層 | ファイル | 改訂候補 |
|---|---|---|
| URL Query Specification | [query_specification.md](query_specification.md) | 通常・追加initiativeのModifier行、Alias、canonical順序、default省略規則、版更新を決定する。既存Comparisonは維持する |
| Query Object / UI型 | [search.ts](../../app/types/ui/search.ts) | initiative / additionalInitiativeの数値条件にfilterを追加し、LogicalCardSearchQueryのAlias型を拡張する |
| Query mapping | [cardSearchQuerySchema.ts](../../app/utils/search/cardSearchQuerySchema.ts) | Alias一覧を正式仕様の順序に合わせて拡張する |
| 初期化・reset | [cardSearchFormFactory.ts](../../app/utils/search/cardSearchFormFactory.ts) | 両initiativeのfilter初期値を扱う |
| Builder | [cardSearchQueryBuilder.ts](../../app/utils/search/cardSearchQueryBuilder.ts) | 両initiativeのModifierを出力する。既存putFilteredの比較必須条件を見直し、Modifier単独の出力に対応する |
| Parser | [cardSearchQueryParser.ts](../../app/utils/search/cardSearchQueryParser.ts) | 両initiativeのModifierを復元する。比較成功にModifier適用が依存する構造を見直す |
| 通常initiative UI | [SearchFieldInitiative.vue](../../app/components/cards/search/unit/SearchFieldInitiative.vue) | 所持選択・変更判定・resetに対応する |
| 追加initiative UI | [SearchFieldAdditionalInitiative.vue](../../app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue) | 所持選択・変更判定・resetに対応する |
| 共通filter UI | [SearchFilterWithOperator.vue](../../app/components/cards/search/shared/SearchFilterWithOperator.vue) | 現在はinclude時のみ数値欄を表示する。all / excludeと比較条件の組合せを、後続Decisionと整合させる |
| 検索 | [search.ts](../../server/utils/cardSearch/search.ts) | NULLを数値比較から除外し、現excludeの比較否定を所持判定へ変更する。it / aitも対応する |
| DB由来データ型 | [finderCards.ts](../../types/cards/finderCards.ts) | Abilityの数値型がnumberのみのため、NULLを表現可能にする。Query側null（条件未指定）とは意味を区別する |
| projection・表示 | [project.ts](../../server/utils/cardSearch/project.ts)ほか | nullable型の伝播、APIレスポンス・表示の数値処理を確認する |

## 下位仕様の改訂候補

以下の既存文書には、比較条件なしでModifierを扱わない規則がある。今回の独立した所持条件と整合するよう、置換または旧規則の失効を記録する。

- [002 data-model](../../specs/002-query-builder/data-model.md)
- [002 contract](../../specs/002-query-builder/contracts/card-search-query.md)
- [002 research](../../specs/002-query-builder/research.md)
- [005 data-model](../../specs/005-search-condition-edit/data-model.md)
- [005 contract](../../specs/005-search-condition-edit/contracts/search-condition-edit.md)

[009 backend spec](../../specs/009-backend-card-search/spec.md)の旧検索との同集合維持・新検索規則を追加しない要件は、旧Featureの範囲として扱う。今回の新仕様の意味を旧実装へ合わせる根拠とはしない。

## 検証の改訂候補

対象はfactory / Builder / Parser / fixtures / Router / search page / server search / cards API / projectionと、nullable値を表示する箇所のテスト。

- 両initiativeのModifier単独・Comparison併用・all省略・round-trip。
- 全数値項目のNULL非ヒット、0の通常比較、正負の比較。
- 6能力値のNULL / 0 / 正数 / 負数と所持条件の組合せ。
- 関連行なし・複数行・矛盾した条件をD37〜D40に従って検証する。複数行は現状のゲームデータにはなく、防御的ケースとして扱う。

## mockと実カードの区別

mockの通常initiative335件中243件、追加initiative9件中5件が0である。合意した仕様では、この0はすべて実数値であり「あり」に分類される。ユーザーが説明した実カードの0表記不存在とはデータ上の差がある。

英雄点・charge / defenderにもmockの0が存在するが、検索側でNULLへ変換したり「なし」に読み替えたりしない。実カードとmockの整合性・データ修正は別途確認する。

## 改訂事項と別途決定事項

### UUID受理と空のPair Modifier（D60〜D61）

Parserの選択肢集合による値の削除を見直し、有効な形式の短縮UUIDについて対応Database IDがない場合も条件を保持して非ヒットとする。他のCollection値はORで評価する。D63により形式は16進数字・大小文字を区別しない・所定の文字列長を満たすことが必須。具体的な長さおよび固定長か最低長かは未決定であり、任意長の無条件受理は採用しない。Mapping外のNatural KeyはD62によりParserで除外する。

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

- 新Modifierの具体的Alias、順序、正式URL仕様の改訂版。
- UIの入力・保持規則。検索SemanticsとBuilder / Parserでの矛盾条件の保持はD38で確定済み。

この文書は改訂候補の記録であり、URL仕様改訂の承認・実装変更の完了を示すものではない。本書の元となるDomain SemanticsはQuery Data Specificationで承認済みである。
