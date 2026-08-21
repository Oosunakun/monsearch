# Data Model: Card Search Query Builder

## SearchForm

Mutable UI state owned by `useCardSearchForm`. Existing fields remain grouped as basic, origin, unit, equipment, land, effect, and other conditions.

### Validation and normalization

- `cardCategory` uses the lowercase `CardCategory` option type or `''`.
- Text fields are trimmed at build time; internal whitespace and Unicode are preserved.
- Arrays may contain duplicates or incidental ordering in UI state; the builder deduplicates and sorts copies.
- Numeric values are `number | null`; finite zero is valid.
- The builder never mutates this entity or clears inapplicable sections.

## CardSearchQuery

Canonical, transport-ready internal representation.

| Field | Type | Presence rule |
|---|---|---|
| `v` | literal `1` | Always present in a non-empty query |
| `name`, `keyword`, `effectText`, `referenceLabel` | `string` | Present after trimming only when non-empty |
| `cardCategory` | `CardCategory` | Present when selected |
| `elements`, `cardTypes`, `products`, `factions`, `blocks`, `moveTypes`, `races`, `resistances`, `additionalResistances`, `effectTypes`, `effectActivationTypes`, `effectActivationCategories`, `rarities`, `illustrators` | sorted unique string arrays | Present when non-empty and applicable |
| `attack`, `defence`, `initiative`, `additionalAttack`, `additionalDefence`, `additionalInitiative`, `limit` | `NumericQueryCondition` | Present with a finite number and when applicable |
| `level`, `heroPoint`, `charge`, `defender`, `additionalCharge`, `additionalDefender` | `FilteredNumericQueryCondition` | Present with a finite number and when applicable |
| `abilityItemSlots`, `abilitySpellSlots`, `additionalAbilityItemSlots`, `additionalAbilitySpellSlots`, `costItemSlots`, `costSpellSlots`, `costOtherEntities` | `SlotQueryCondition` | Present when at least one valid slot exists and section is applicable |
| `landCategory` | non-default `LandCategory` | Present when not `all` and land section applies |

The field order above is normative within each family and the complete order is fixed by [the query contract](contracts/card-search-query.md).

## Search condition value objects

### NumericQueryCondition

- `operator`: `gte | eq | lte`
- `value`: finite number, including zero

### FilteredNumericQueryCondition

- `filterType`: `all | include | exclude`
- `operator`: `gte | eq | lte`
- `value`: finite number, including zero

All three properties are required together.

### SlotQueryCondition

- `match`: `or | and | none`
- `slots`: object keyed by canonical slot identifier, with keys sorted lexically and finite positive numeric counts

The condition is omitted if no valid slot entries remain.

## URL Query

- The card-list route contains either no query parameters for an empty detailed search or canonical URL query parameters generated from `CardSearchQuery`.
- The URL query representation is defined by the Query Specification (`docs/architecture/query_specification.md`).
- Framework-specific URL encoding and decoding are delegated to Vue Router.

## Relationships and transitions

```text
SearchForm
    --build (pure normalization/applicability)-->
CardSearchQuery
    --Query Builder-->
Canonical URL Query
    --Vue Router-->
/cards

/cards
    --Vue Router-->
Canonical URL Query
    --Query Parser-->
SearchForm / Query Consumer
```

State transitions:

1. Editing changes only `SearchForm`.
2. Submission snapshots and normalizes it into a new query object.
3. An empty query navigates to `/cards`; otherwise it navigates with canonical URL query parameters defined by the Query Specification.
4. Parsing starts from `createSearchForm()` and applies only valid, recognized conditions.
