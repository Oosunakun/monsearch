# Data Model: バックエンドによるカード検索

## CardSearchRequest

HTTP queryから生成するimmutableな検索要求。

| Field | Type | Rule |
|---|---|---|
| criteria | `NormalizedSearchCriteria` | Query Specificationの全aliasを受理。未知・不正部分を無視 |
| page | positive integer | default 1。不正値はdefault、最終page超過はclamp |
| perPage | `20 \| 50 \| 100` | default 20。不正値はdefault |
| sort | `'id' \| 'rarity' \| 'atk'` | default `id`。不正値はdefault |
| order | `'asc' \| 'desc'` | default `asc`。不正値はdefault |

検索aliasのprimitive、collection、comparison、pair collection、modifier、およびduplicateの解釈は `docs/architecture/query_specification.md` に従う。API制御parameterは検索criteriaに含めない。

## NormalizedSearchCriteria

既存`SearchForm`相当のcanonical内部条件。未知alias、invalid value、空文字、不完全comparison、不正collection itemを除いた結果であり、条件が一つも残らない状態も有効。Server検索中は変更しない。

## SourceCard

`app/utils/mockData/items/cards.json` 内の既存`types/cards/finderCards.ts#Card`。検索predicateは現行Browser検索と同じfieldとcategory applicabilityを利用する。data sourceはread-onlyで、DB entityや永続stateは新設しない。

## CardSearchResultItem

現在の結果componentが描画・装飾に使うsnake_case fieldだけを`SourceCard`からcopyする明示的公開projection。

- 基本: `card_id`, `reference_label`, `name`, `card_category_code`, `card_category_name`
- category detail:
  - `unit`: level、instant/hero、hero point、move type name、attack/defense、elements、races、ability
  - `spell`: elements
  - `item`: item category name、consume/equip/bulletの種別、equipのattack/defense/ability
  - `land`: land limit
  - `ritual`: category存在を示す空objectまたはnull
  - `summoner`: arcana、secondary name
- traits: 表示用の`card_types`、`blocks`、`factions`
- ability: initiative、charge、defender、表示用ability slots、表示用affinities
- effects: effect type/activation/name/timing/cost/target/textの表示field
- metadata: `rarity_code`, `rarity_name`, `illustrator_name`, `product.product_name`

`search_support`、tags、errata、flavor text、illustrator ID、productの未使用field、effect/trait/masterの未使用内部ID、source fileのversion/generated_atは返さない。projection必須fieldを作れないrecordは除外する。

## CardSearchResultPage

| Field | Type | Rule |
|---|---|---|
| items | `CardSearchResultItem[]` | filter/sort後の適用pageだけ |
| totalCount | non-negative integer | pagination前の全一致件数 |
| page | positive integer | clamp後の適用page。0件は1 |
| perPage | `20 \| 50 \| 100` | 適用値 |
| totalPages | positive integer | `max(1, ceil(totalCount / perPage))` |
| sort | `{ key, order }` | 適用されたsort |
| categoryBreakdown | `{ categoryCode, count }[]` | pagination前の全一致結果の非ゼロcategory件数 |

sortは現在のUIと同じく、idは`card_id`のlocale比較、rarityは既存rarity順位、atkは`unit.attack`の欠損を0として比較する。同値時はsource orderを維持する。

## CardSearchFailure

| Field | Type | Rule |
|---|---|---|
| statusCode | `500` | 検索・data取得を完了できない単一failure |
| code | `CARD_SEARCH_FAILED` | Browser分岐用のstable code |
| message | string | 利用者向け。内部例外やstackを含めない |

未知parameter、invalid value、invalid pagination/sortはfailure entityを生成せず、Graceful Parsing/default適用後に200を返す。

## Relationships and state

```text
HTTP query -> graceful parse/default -> CardSearchRequest
cards JSON -> SourceCard[] -> filter -> sort -> count/breakdown -> paginate -> projection
                                                            -> CardSearchResultPage
runtime/data failure --------------------------------------> CardSearchFailure

Browser: loading -> success (items >= 0) | error
         error -> loading (same request retry)
```
