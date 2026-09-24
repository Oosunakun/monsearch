# Data Model: 効果コスト検索

本書では検索に使う論理モデルを記述する。URL上の名前・値・並び順は[Query Specification](../../docs/architecture/query_specification.md)、一致意味は[Query Data Specification](../../docs/architecture/query_data_specification.md)を正とする。

## Search Cost Condition

詳細検索の`SlotCondition`を再利用する。

| Field | Type | Rule |
|---|---|---|
| `slots` | `Record<CostKey, number>` | Pair数量は1以上の整数。0、負数、小数、不正値は有効条件として出力しない |
| `match` | `or \| and \| none` | 既存Modifier意味。default `or`は省略し、`none`ではPair値を使わない |

### CostKey mapping

| Condition | URL Pair key | Search cost `type` | Search cost `value` |
|---|---|---|---|
| `costItemSlots` | `multi`, `consume`, `bullet` | `item` | 同じkey |
| `costSpellSlots` | `fire`, `water`, `earth`, `air`, `holy`, `curse`, `multi` | `spell` | 同じkey |
| `costOtherEntities` | `hand`, `deck`, `trash`, `power` | `other` | 同じkey |

URL aliasはそれぞれ`cis/cism`、`css/cssm`、`coe/coem`。

`search_cost`のSpell `value: "any"`は任意Spell枠を表す内部Projection専用値であり、Query SpecificationのURL Pair valueではない。既存Query Builder/ParserのURL語彙には追加しない。

## Effect Search Cost

既存検索データの各Effectに属するoptional/nullableな構造化値。実装時に現データのnullable表現を確認し、unknownをnullへ畳み込まない。

| Field | Logical type | Meaning |
|---|---|---|
| `alternatives` | ordered collection of Cost Alternative | 支払い選択肢。各alternative内だけで条件を評価 |
| `costs` | collection of Search Cost Component | 種類・key・支払可能quantityを表す。別Pairに同じ資源を二重充当しない |
| `type` | `item \| spell \| other` | QDSで定義する効果コスト分類 |
| `value` | mapping-specific key | 上表のPair key、または内部Spell value `any` |
| `quantity` | positive integer (exact) | alternativeが要求数量以上を支払える場合に一致 |
| `min`, `max` | positive integer range (range) | 許可範囲内に検索要求数量以上を支払える値がある場合に一致 |
| `has_other_cost` | boolean | 個別keyを持たない支払いコストが存在する場合、`coe=none`を妨げる |

同じalternative内の複数Pairを満たすために`spell:any`のcapacityを配分する場合、共有capacityを二重充当しない。たとえば任意Spell枠1～3に対して`fire:2`と`water:1`は合計3枠で一致し、`fire:2`と`water:2`は合計4枠を要するため一致しない。

## Search Semantics

- **Card**: 1検索対象レコード。別CardのEffectを合算しない。
- **Effect**: 同一Effectに指定された正条件が全て成立すること。
- **Alternative**: 許された支払い方の1つ。条件は同一alternativeで成立する。
- **Null/unknown**: QDSの確定した`effect_cost_id = NULL`状態はcost-free。欠損・未解析・未定義は不明であり、noneに一致しない。
- **Effect absence**: Effectが存在しないCardはcost `none`条件に一致しない。
- **Negative condition**: 各`none`は対象分類だけの不存在を評価する。異なるcost aliasesはAND。
- **Publication prerequisite**: 対象`search_cost`の人手Mapping、生成時の網羅性検証、変換後データレビューはFeature開始前に完了している。runtimeで`effect_cost_text`を解析しない。

## Relationships

`Card 1 ── * Effect 1 ── * Cost Alternative 1 ── * Search Cost Component`

`Effect.effect_cost_id`は元コストの識別と確定nullの由来を識別する手がかり。`search_cost`はその原文の検索用構造化データであり、原文そのものを解析・照合する用途ではない。
