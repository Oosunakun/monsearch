# Query Data Specification

**Version:** 1.1.0
**Status:** Approved — Domain Semantics（下記の未決定事項・公開前提を含めて合意済み）  
**Scope:** Repository Internal Specification

## 1. 目的と責務

本書は、Query Parameterとカードデータの対応、および検索条件にカードが一致する意味を定義する。対話で確認したshared understandingを正式仕様として統合したものであり、現実装の挙動を追認する文書ではない。

URLのParameter名・構文・順序・重複解決・encodingは、採用済みの[URL Query Specification 1.1.0](query_specification.md)を正とする。本書はその未規定のデータ対応・検索意味論を補う。

本書の承認は、Schema変更・migration・実装・データ整備・機能公開の完了を意味しない。具体的SQL、検索の最適化、UI設計、コストの解析方式は本書の対象外である。

### 1.1 承認済みの意味と未決定事項

| 項目 | 状態 |
|---|---|
| データ対応・一致条件・組合せ・NULL・数量 | 本書の規則で確定 |
| 短縮UUIDの文字種・大小文字・所定長を必要とすること | 確定。具体的長さ、固定長か最低長かは未決定 |
| 通常・追加イニシアチブの所持Modifier | `itm` / `aitm`、順序 `itm → it` / `aitm → ait` として確定。default `all` は省略 |
| コストの構造化・Schema・migration・解析・人手確認 | 別設計。必要な構造化・検証の完了までコスト検索を公開しない |
| Schemaとmockの不整合、実装差分 | 本書への整合が必要。修正は別作業 |

未決定事項を任意長UUIDの受理、推測したAlias、部分的なコスト検索などで埋めてはならない。

## 2. 検索対象と条件の結合

### 2.1 カード単位

検索対象は`cards`の1レコードとする。同名でもレコードが異なれば別の対象であり、別カードの収録セット・能力・効果等を持ち寄って一致させない。

関連するtrait / stat / feature / catalogは対象カードの`card_id`で対応付ける。Effectsは`feature_effects.effect_id → effects.effect_id`、コストは`effects.effect_cost_id → effect_costs.effect_cost_id`で対応付ける。これは論理的な関連であり、現Schemaに全整合制約が実装済みであることを保証しない。

### 2.2 基本結合

- 異なるParameterの条件は原則ANDとする。Modifierは対応する条件の判定方法を定める。
- 通常のCollection内はORとする。
- Pair Collection内は§6の`or / and / none`に従う。
- 未指定の条件は絞り込まない。
- Effects関連の条件は、いずれか1つの同一Effectがすべて満たす必要がある（§7）。

例：`el=fire,water&ra=<短縮UUID>`は、火または水属性を持ち、かつ指定種族を持つカードに一致する。

### 2.3 通常能力・追加能力の適用対象

| 対象 | 抽出するデータ |
|---|---|
| `Unit` | ユニットの数値、通常能力・所持枠・耐性 |
| `Item`かつアイテム分類`Equip` | 装備品の追加数値・追加能力・追加枠・追加耐性 |
| `Land` | リミット・地形分類 |
| `Token` | 実際に存在する対応データに基づいて判定 |

Tokenは任意のカードの体裁を取り得て、欠損した情報や既存の基本分類に当てはまらない用途も含む。Tokenという分類自体から能力・statの適用範囲を制限しない。通常／追加featureは共通テーブルからカード分類・アイテム分類および対応データに応じて抽出する。

適用対象のカードで能力行がなければ能力なしと判定できるが、適用対象外のカードを「能力なし」の検索に含めない。数値Comparisonは対象の値がない場合に一致しない。

通常能力はユニット自身の能力、追加能力は装備品が装備先へ与える能力を指す。効果テキストによる一時的・条件付きの変更は効果検索で扱う。

## 3. ParameterとDatabaseの対応

以下はデータの参照先と意味の対応表である。URLのcanonical順序はURL Query Specificationに従う。`UUID`はDatabaseの完全IDに対する短縮UUID照合（§4.2）、`code`はMapping変換後の完全一致（§4.1）を示す。

### 3.1 基本・分類・文字列

| Query Object Property | Alias | 形式 | Databaseの対象 | 判定 |
|---|---|---|---|---|
| name | `nm` | Primitive | `cards.name` | 部分一致 |
| cardCategory | `cc` | Primitive | `cards.card_category_code`、必要時`stat_item.item_category_code` | 分類Mapping |
| elements | `el` | Collection | `trait_elements.element_code` | code |
| cardTypes | `ct` | Collection | `trait_card_types.card_type_id` | UUID |
| keyword | `kw` | Primitive | `card_search_catalog.full_text` | 部分一致 |
| products | `pd` | Collection | `cards.product_id` | UUID |
| factions | `fa` | Collection | `trait_factions.faction_id` | UUID |
| blocks | `bl` | Collection | `trait_blocks.block_code` | code |
| moveTypes | `mt` | Collection | `stat_unit.move_type_code` | code |
| races | `ra` | Collection | `trait_races.race_id` | UUID |
| landCategory | `lc` | Primitive | `stat_land.land_category_code` | code、`all`は絞り込みなし |
| rarities | `rt` | Collection | `cards.rarity_code` | code |
| illustrators | `il` | Collection | `cards.illustrator_id` | UUID |
| referenceLabel | `rl` | Primitive | `cards.reference_label` | 部分一致 |
| archetypeText | `att` | Primitive | `card_search_catalog.archetype_text` | 部分一致 |

### 3.2 数値と所持・属性Modifier

| Query Object Property | 数値Alias | Databaseの対象 | Modifier Alias | Modifierの意味 |
|---|---|---|---|---|
| level | `lv` | `stat_unit.level` | `lvm` | `stat_unit.is_instant_summon` |
| heroPoint | `he` | `stat_unit.hero_point` | `hem` | `stat_unit.is_hero` |
| attack | `at` | `stat_unit.attack` | — | — |
| defense | `df` | `stat_unit.defense` | — | — |
| initiative | `it` | `feature_abilities.initiative`（通常） | `itm` | 所持 |
| charge | `ch` | `feature_abilities.charge`（通常） | `chm` | 所持 |
| defender | `de` | `feature_abilities.defender`（通常） | `dem` | 所持 |
| additionalAttack | `aat` | `stat_item_equip.attack` | — | — |
| additionalDefense | `adf` | `stat_item_equip.defense` | — | — |
| additionalInitiative | `ait` | `feature_abilities.initiative`（追加） | `aitm` | 所持 |
| additionalCharge | `ach` | `feature_abilities.charge`（追加） | `achm` | 所持 |
| additionalDefender | `ade` | `feature_abilities.defender`（追加） | `adem` | 所持 |
| limit | `lm` | `stat_land.land_limit` | — | — |

数値はComparison、ModifierはModifier形式である。既存のfilter propertyは各数値条件の`.filterType`に対応する。`initiative` / `additionalInitiative` の Modifier alias はそれぞれ `itm` / `aitm` とする。

### 3.3 所持枠・耐性

| Query Object Property | Alias | 形式 | Modifier Alias | 対象 |
|---|---|---|---|---|
| abilityItemSlots | `is` | Pair Collection | `ism` | 通常Item枠 |
| abilitySpellSlots | `ss` | Pair Collection | `ssm` | 通常Spell枠 |
| additionalAbilityItemSlots | `ais` | Pair Collection | `aism` | 追加Item枠 |
| additionalAbilitySpellSlots | `ass` | Pair Collection | `assm` | 追加Spell枠 |
| resistances | `re` | Collection | — | 通常の`feature_affinities.affinity_id` |
| additionalResistances | `are` | Collection | — | 追加の`feature_affinities.affinity_id` |

枠の種類は`feature_ability_slots.ability_slot_type_code`、数量は`slot_count`で判定する。match Modifierは各枠条件の`.match`に対応する。

`re / are`はUUIDによるID照合のみとする。追加の`affinity_category_code = Resistance`条件も`affinity_value`条件も付与しない。例えば同じ「耐性：ALL(N減)」のIDなら、Nが異なっても種類の条件に一致する。

### 3.4 Effects・コスト

| Query Object Property | Alias | 形式 | Modifier Alias | 対象 |
|---|---|---|---|---|
| costItemSlots | `cis` | Pair Collection | `cism` | アイテムコスト |
| costSpellSlots | `css` | Pair Collection | `cssm` | スペルコスト |
| costOtherEntities | `coe` | Pair Collection | `coem` | その他コスト |
| effectTypes | `eft` | Collection | — | `effects.effect_type_code`（code） |
| effectActivationTypes | `eat` | Collection | — | `effects.effect_activation_type_id`（UUID） |
| effectActivationCategories | `eac` | Collection | — | `effects.effect_activation_category_code`（code） |
| effectText | `etx` | Primitive | — | `effects.effect_text`（部分一致） |

`eat`は「普通」「対抗」「条件」等を対象とする。別列`effect_activation_timing_id`は検索対象に含めない。

コストのmatch Modifierは各コスト条件の`.match`に対応する。現Schemaの原文は`effect_costs.effect_cost_text`だが、この列への単純な文字列照合を正式な検索方式とはしない。構造化後に§7の意味を満たすことが必要であり、構造化データの物理的な格納先は別設計とする。

## 4. 識別子・Mapping

### 4.1 Natural Key

URL値を下記のMappingで変換し、Databaseのcodeと完全一致させる。表示名やID末尾等による代替照合は行わない。

| Parameter | URL値 | Database値 |
|---|---|---|
| `cc` | `unit / spell / land / ritual / summoner / token` | `Unit / Spell / Land / Ritual / Summoner / Token` |
| `cc` | `item-consume / item-equip / item-bullet` | カード分類`Item` AND アイテム分類`Consume / Equip / Bullet` |
| `el` | `fire / water / earth / air / holy / curse` | `Fire / Water / Earth / Air / Holy / Curse` |
| `rt` | `circle / triangle / rhombus / star` | `Basic / Common / Uncommon / Rare` |
| `rt` | `club / spade / heart / crescent / hexagram` | `SuperRare / Special / Promotion / DragonJr / Summoner` |
| `lc` | `none / ritual` | `None / Ritual` |
| `lc` | `all` | 絞り込みなし |

次のcodeはURL値とDatabase値が同じである。

| Parameter | code |
|---|---|
| `mt` | `Walk`, `LongFly`, `Fly` |
| `bl` | `Anniversary`, `Deus`, `GodEater`, `Block1`, `Block2`, `Block3`, `Block4`, `Block5`, `Block6`, `Legend`, `Infinity`, `SixKingdom`, `EldLore` |
| `eft` | `SacrificeSkill`, `ActionSkill`, `FlipSkill`, `HandSkill`, `PassiveSkill`, `DeclareSkill`, `TriggerSkill` |
| `eac` | `Battle`, `Deck`, `Field` |

Mapping外のNatural KeyはParserで除外する。`el=fire,unknown`は`fire`のみ残し、`cc=unknown`は分類条件を除外する。Databaseに他のcodeが存在しても、Mappingを推測して自動追加しない。

上表はURL値とDatabaseのcodeの対応を定義する。現行アプリのParserが受理する値は、UIが提供する選択肢（`lc=all`を含む）に基づく。Mappingに含まれる値でも、UIで提供していない値は手入力のURLで指定されても条件から除外する。たとえば、`mt=LongFly`と`rt=spade`は条件から除外され、`mt=Fly,LongFly`と`rt=triangle,spade`ではそれぞれ`Fly`と`triangle`が残る。

### 4.2 短縮UUID

対象は`ct / pd / fa / ra / il / eat / re / are`。URL値を、各Parameterが対応するDatabase IDの末尾と照合する。

- 有効形式には16進数字であることと、所定の文字列長を満たすことが必要。照合では大文字小文字を区別しない。
- 所定長の具体値、固定長か最低長かは未決定。空でない任意長の16進数字列を無条件に受理しない。
- 短縮値の生成・長さ決定・衝突チェックはParameter作成側の責務。検索側は衝突確認済みの値を受け取る前提で後方一致する。
- 衝突を確認する名前空間はParameterごとであり、異なるParameter間の同一短縮値を許容する。
- 有効形式だが対応IDがない場合は条件を保持し、その値を非ヒットとする。Collectionの他のIDは通常のORで評価する。
- 不正形式はURL仕様の不正値処理に従う。形式の検証とDatabase IDの存在確認を混同しない。

既存選択肢にある8文字を固定長として採用していない。3〜5文字等の候補を含む長さの検討は生成側の別途決定事項である。

## 5. 数値・所持・属性条件

### 5.1 共通数値比較

全13項目に共通して、NULLは「なし」、0は実数値0とする。NULLを検索時に0へ変換しない。

検索値は0・正数・負数の整数を受け付け、現在のカード値やUIの選択肢に限定しない。これはDatabaseに保存するゲームデータの値域を広げる意味ではない。

| 演算 | 非NULLの保存値xと検索値n | NULL・値の不存在 |
|---|---|---|
| `eq:n` | x = n | 非ヒット |
| `lte:n` | x ≤ n | 非ヒット |
| `gte:n` | x ≥ n | 非ヒット |

実カードに現時点で英雄点・initiative・charge・defenderの0表記がなくても、0を「なし」とは定義しない。mockの0も検索時にNULLへ読み替えない。

### 5.2 所持Modifier

initiative / charge / defender / additionalInitiative / additionalCharge /
additionalDefender に共通する。Hero Point は同じ Modifier 語彙を使用するが、
存在性の参照先は `is_hero` である。

| 値 | 条件 |
|---|---|
| `include` | 対象数値が非NULL。0も含む。Comparisonがあれば追加で評価する。Comparisonなしでも条件として成立する |
| `exclude` | 対象数値がNULLまたは値なし。Comparisonは検索評価に使用しない |
| `all` | 値の有無で絞り込まない（default）。Comparisonがあれば評価する |

Modifierは数値Comparisonなしでも意味を持つ。`include` と Comparison は AND で評価する。
`exclude` と Comparison が併記されても、Comparisonは検索評価に使用しない。
Parserは両方をSearchFormへ保持してよいが、Builderは`exclude` ModifierだけをCanonical URLへ出力する。

Hero Pointの`exclude`は`is_hero`を参照し、Hero Point Comparisonを検索評価に使用しない。

### 5.3 boolean属性Modifier

`lvm`は`is_instant_summon`を対象とする。`lvm`単独でも条件として有効で、
`lv` Comparisonとは独立した条件である。したがって、
`lv=gte:3&lvm=exclude`はレベル3以上かつ即時召喚不可を意味し、
`lvm=exclude`でもLevel Comparisonを評価する。

Hero Pointの`hem`は§5.2の存在性Modifier semanticsに従い、
`is_hero`を参照する。`hem=exclude`ではHero Point Comparisonを検索評価に
使用しない。`hem`をLevelと同じ「ComparisonがあればAND」の例外規則として
扱ってはならない。

### 5.4 複数能力行

各Comparisonはいずれかの非NULL値が条件を満たせば一致し、値を合算しない。異なる能力条件は同一行に限定しない。行Aにinitiative=2、行Bにcharge=3があれば、両方の下限条件を満たせる。

これは現状のゲームデータに複数行があることを意味せず、防御的な定義である。Effectsの同一Effect制約を常備能力に適用しない。

## 6. Pair Collection・所持枠

### 6.1 数量とModifier

Pairの数量は1以上の整数に限定し、上限を現UIに固定しない。0・負数・小数は有効な個数条件ではない。

| Modifier | 意味 |
|---|---|
| `or` | いずれかのPair条件が成立（default） |
| `and` | すべてのPair条件が成立 |
| `none` | 対象種類の枠・コストが一切存在しない。指定Pairの否定ではない |

`none`はPairを使用せず、併記されていても捨てる。`ss=fire:2&ssm=none`の再構築結果は`ssm=none`。Pairなしの`or / and`は条件未指定として絞り込まず、再構築時にも省略する。`none`だけは単独で保持する。

### 6.2 所持枠Mapping

| 対象Parameter | URLキー | `ability_slot_type_code` |
|---|---|---|
| `is / ais` | `multi / consume / bullet` | `ItemMulti / ItemConsume / ItemBullet` |
| `ss / ass` | `fire / water / earth / air / holy / curse / multi` | `SpellFire / SpellWater / SpellEarth / SpellAir / SpellHoly / SpellCurse / SpellMulti` |

指定種類の`slot_count`が指定個数以上ならPair条件が成立する。指定していない種類が存在しても妨げない。同じ種類の行が複数あっても合算せず、各行の数量で判定する。

所持枠は種類そのものを照合する。`ss=fire:1`は火枠が対象で、`＊`枠だけでは一致しない。支払い可能性を照合するコスト検索とは区別する。

`none`は、適用対象カードの対象種類について正の数量を持つ行が1つもないことを要求する。通常は枠なしなら行自体がないが、仮に数量0の行があっても所持数0としてnoneに一致する。ステータスの能力値0とは意味が異なる。

## 7. Effectsとコスト

### 7.1 同一Effect

`eft / eat / eac / etx`とコスト条件は、いずれか1つの同一Effect内ですべて満たす必要がある。Effect AのタイプとEffect Bのテキストを持ち寄って一致させない。

関連する`effects`が存在するものを対象とする。未抽出の`feature_effects.effect_raw_text`へfallbackしない。`etx`は`effects.effect_text`だけを検索する。

Effect自体が存在しないカードは、コストnoneだけの指定にも一致しない。

### 7.2 コストMappingと数量

| Parameter | URLキー | 支払うコストの表記 |
|---|---|---|
| `cis` | `multi / consume / bullet` | `■ / □ / 弾` |
| `css` | `fire / water / earth / air / holy / curse / multi` | `火 / 水 / 土 / 風 / 聖 / 魔 / ＊` |
| `coe` | `hand / deck / trash / power` | `手札 / 山札 / 捨札 / ▼` |

検索対象は支払うコストとして記載された要素であり、文字の出現だけで決めない。`手札1枚破棄(「錬金弾のカード」または戦闘スペルカード)`の「弾」はカード条件の一部で、`cis=bullet:1`に一致しない。

記号反復による個数は同じキーワードの連続数で判定する。`fire:3`に対し「火火火」「火火火火」は一致、「火火または火▼」は非ヒット。「火火火または水」は一致する。選択肢をまたいで個数を合算しない。

`hand / deck / trash`は「手札2枚」等の数字を数量として扱い、指定個数以上なら一致する。説明・条件中の数字を支払う数量と混同しない。

### 7.3 選択・範囲・同時支払い

いずれかの許された選択で条件を満たせば一致する。数量範囲も同様で、「山札1～2枚破棄」は`deck:2`に一致し、`deck:3`に一致しない。

異なるコストParameterはAND。同一Parameter内部はmatchに従う。正のコスト条件全体を同一Effectの同一選択肢で満たす必要がある。「アイテム1個 または 火1個」に対し両種類を指定した場合は非ヒット。

「任意のスペル枠1～3つ消費」は、指定枠を実際に支払いに使えるため`fire:1`にも`multi:1`にも一致する。ANDでは各Pairを同時に満たす支払い方が必要で、同じ枠を複数Pairに重複計上しない。

| 任意スペル枠1〜3つに対する条件 | 結果 |
|---|---|
| `css=fire:2,water:1&cssm=and` | 一致（計3枠） |
| `css=fire:2,water:2&cssm=and` | 非ヒット（計4枠必要） |
| `css=fire:2,water:2&cssm=or` | 一致（いずれか2枠） |

任意枠と原文に明示された選択肢を超える一般代替払い規則は、本書では導入しない。Repositoryでその根拠は確認できていない。

### 7.4 コストnone

`cism=none`はアイテムコスト、`cssm=none`はスペルコスト、`coem=none`はその他コストが全選択肢にわたり一切存在しないことを要求する。他種類の存在は、その種類のnoneを妨げない。

「火または手札1枚」は`cssm=none`に非ヒット。スペルを使わない選択肢があることと、スペルコスト自体がないことを区別する。

`effects.effect_cost_id = NULL`は確定した「コストなし」であり、不明を意味しない。そのEffectは3種類のnoneすべてに一致する。

「このユニット行動完了」等、現検索キーで個別指定できないコストもその他コストとして存在するため`coem=none`に一致しない。全種類のコストなしは3つのnoneのANDで表し、行動完了等も含め何も支払いが発生しないEffectを対象とする。

### 7.5 公開前提

必要なコストの構造化・検証が完了するまで、コスト検索は公開対象としない。

原文構造化、Schema変更、migration、解析方式、人間による確認、検証完了基準、公開制御は別設計とする。解析できた部分だけでの検索や「解析不能なら非ヒット」というfallbackを正式採用しない。未解析・未定義を「なし」と同一視しない。

現Repositoryでは入力UI・URL送信・API受理がある一方、検索本体はコストを評価していない。既存URL・直接APIを含む未提供時の応答と公開制御が必要であり、条件未適用の結果を適用済みとして扱わない。具体的な制御方式は未決定である。

## 8. 自由記述検索

`nm / etx / rl / att / kw`は、検索語全体を1つのリテラルな文字列として部分一致させる。単語分割・正規表現・ワイルドカード検索は導入しない。空白による単語分割は将来Featureとする。

照合時の検索語と対象文字列にだけ、次の限定的な正規化を適用する。

| 対象 | 同一視する範囲 |
|---|---|
| 全半角英数字・記号 | Unicode上の対応する全半角表記。例：`Ａ / A`、`１ / 1`、`＆ / &`、`＊ / *` |
| 全半角カナ | 対応するカナと濁点・半濁点の組合せ。例：`ｶﾞ / ガ` |
| 空白 | 全角空白と半角空白 |
| 英字 | 大文字と小文字 |

幅変換はUnicode 16.0.0のUnicodeDataにある`<wide> / <narrow>`対応のうち、次の集合に限定する。変換先の文字をさらに互換分解しない。

| 入力範囲・文字 | 照合用の変換先 |
|---|---|
| U+FF01〜U+FF5E（全角ASCII） | 対応するU+0021〜U+007E（code pointから0xFEE0を減算） |
| U+FF61〜U+FF9F（半角カナ・句読点・濁点等） | 各文字の`<narrow>`対応先。例：U+FF76→U+30AB、U+FF9E→U+3099 |
| U+3000（全角空白） | U+0020 |
| `￠ / ￡ / ￢ / ￣ / ￤ / ￥ / ￦`（U+FFE0〜U+FFE6） | `¢ / £ / ¬ / ¯ / ¦ / ¥ / ₩` |
| `￨ / ￩ / ￪ / ￫ / ￬ / ￭ / ￮`（U+FFE8〜U+FFEE） | `│ / ← / ↑ / → / ↓ / ■ / ○` |

幅変換後、カナとU+3099 / U+309Aの結合列をUnicodeの正規合成に従って合成する（例：`カ`＋U+3099→`ガ`）。英字A〜Zはa〜zへ揃えて照合する。上記以外の文字に互換分解・幅変換を広げず、NFKC一律適用は行わない。例えばU+FFE3はU+00AFへ変換するだけで、空白と結合記号へ分解しない。

丸数字と通常数字、ローマ数字と英字、ひらがなとカタカナを区別する。内部空白は削除・圧縮しない。入力値・URL Query・保存原文・表示値そのものを、この照合用正規化で書き換えない。

`kw`は`card_search_catalog.full_text`のみ、`att`は`archetype_text`のみを対象とする。検索時に別項目を連結したり、カード全体の文字列化にfallbackしたりしない。対象行・対象値がない場合、その文字列条件には一致しない。

## 9. 代表例と確認観点

| 条件・状況 | 結果 |
|---|---|
| 同名の別cardsレコードに必要条件が分散 | 別レコードの情報を合算しない |
| `at=eq:0`、保存値0 / NULL | 0は一致、NULLは非ヒット |
| `chm=include`、保存値0 | 一致 |
| `chm=exclude&ch=gte:2` | chargeの値なしだけを評価し、Comparisonは検索評価に使用しない |
| 適用対象カードに能力行なし、所持exclude | 一致。Comparisonには非ヒット |
| 同種枠の数量1の行が2つ、指定個数2 | 非ヒット。合算しない |
| 枠の数量0のみ、対象枠none | 一致 |
| `ssm=none`に`ss`も併記 | Pairを無視し、再構築でも削除 |
| `ssm=and`だけ | 条件未指定、再構築で省略 |
| Effect Aだけがタイプ、Bだけがテキストに一致 | 同一Effectで全条件が成立せず非ヒット |
| Effectなし、コストnone | 非ヒット |
| 未抽出のEffect原文にだけ検索語がある | `etx`には非ヒット |
| 有効形式の短縮UUIDに対応IDなし | 値を保持して非ヒット。他のCollection値はOR |
| `cc=unknown` | 未対応Natural Keyとして除外 |
| `re / are`に対応IDあり、affinity_valueが異なる | 値の大小を条件にせずIDで一致 |
| `etx`に`①`指定、対象には`1`だけ | 同一視しない |
| `kw / att`のcatalog行なし | 非ヒット。fallbackなし |

この表は実装完了のテスト報告ではなく、今後の実装を確認するための仕様例である。

## 10. 改訂候補・依存事項

| 対象 | 扱い |
|---|---|
| UUIDの所定長 | 生成側で別途決定。決定前に任意長を有効とみなさない |
| initiative / additionalInitiative Modifier | `itm` / `aitm` と順序 `itm → it` / `aitm → ait` を正式URL仕様へ反映済み |
| Modifier単独・exclude時Comparison | 既存Modifier語彙で正式化。`include` / `exclude` は単独成立、`exclude` はComparisonを検索評価・Canonical URL出力から除外。ParserはForm保持可 |
| 未知UUIDを選択肢集合だけで削除するParser | 形式検証とID存在確認を分離し、D60・D63へ整合 |
| 数値型・検索・UI | NULLと0、比較と所持の分離、単独Modifierに対応する本Featureの設計・実装対象 |
| affinityの分類軸 | mockとSchema CHECKの不整合を別途修正。ID検索へcategory条件を追加して解決しない |
| コスト構造化・検証・公開 | §7.5を満たす別設計が必要 |
| mockの0と実カード表記の差 | データ整備として確認。検索中に0をNULLへ変換しない |
| `stat_unit.attack / defense`のNOT NULL | 未記載の保存が必要ならSchemaと整合させる |

現行URL仕様・実装・データがすでに本書を満たすとは主張しない。改訂の具体的影響は[改訂候補一覧](query_data_specification_revision_candidates.md)を参照する。

## 11. Decisionと根拠

| 本書の範囲 | Decision |
|---|---|
| 責務・カード単位・基本結合 | D1〜D7、D27、D40 |
| 数値・所持・複数行 | D8、D28、D30〜D43（数値の最終方針はD33〜D40） |
| ID・Mapping | D14、D20、D26、D54〜D60、D62〜D63 |
| Pair Collection | D12〜D13、D19、D30、D41〜D42、D61 |
| コスト | D9〜D11、D16〜D18、D25、D32、訂正後D44、D46〜D53、D64 |
| 文字列 | D15、D22〜D24（D21のNFKC一律案を置換） |

- [Decision履歴](query_data_specification_note.md)：撤回・更新を含む対話記録。現在の規範は本書を参照する。
- [コスト原文調査](query_cost_notation_research.md)：mockの305非空コスト・90種類を調査した範囲と限界。
- [改訂候補一覧](query_data_specification_revision_candidates.md)：本書の意味を実現するための別作業。
- [用語集](../../CONTEXT.md)：Domain用語。
- [ADR: コスト検索の公開前提](../adr/0001-cost-search-publication-prerequisites.md)：構造化・検証を公開前提とした理由。

意味を変える変更は新たなDecisionとして記録し、本書とURL仕様の責務境界を維持する。
