# Data Model: Card Search Query Builder

> **整合注記**: 数値 Modifier に関する旧記述は Query Specification 1.1.0 と Feature 010 により更新される。Feature 010 の対象範囲では本書より新しい規則を優先する。

## SearchForm

Mutable UI state owned by `useCardSearchForm`, grouped into basic, origin, unit, equipment, land, effect, and other sections.

### Validation and normalization

- `cardCategory` uses the lowercase UI `CardCategory` vocabulary or `''`.
- Text is trimmed at build time; meaningful internal whitespace and Unicode remain unchanged.
- Collections are copied, deduplicated, and lexically sorted.
- Numeric operands are `number | null`; only finite numbers are valid, and zero is retained.
- Slot entries require a non-empty key and a finite positive count.
- The builder never modifies this entity, its arrays, or nested objects.

## LogicalCardSearchQuery

An ordered collection of unique logical URL parameters. Keys are the stable aliases in the Query Specification; values are strings before framework URL encoding.

| Condition family | Logical format | Presence rule |
|---|---|---|
| Text and primitive | `alias=value` | Trimmed non-empty value; default `landCategory: all` omitted |
| Collection | `alias=v1,v2` | At least one unique valid value, sorted lexically |
| Numeric comparison | `alias=operator:value` | Valid operator and finite operand |
| Filtered comparison | base comparison plus optional modifier alias | `all` omits modifier; `include` / `exclude` may be standalone; `exclude` omits the base comparison from canonical output |
| Pair collection | `alias=k1:v1,k2:v2` | At least one valid entry, keys sorted lexically |
| Logical match | optional modifier alias | Valid pair collection exists; non-default match only |

Parameter aliases and their normative order are defined exclusively by `docs/architecture/query_specification.md`.

### Vocabulary adapters

- UI `defence` maps to transport alias `df`; UI `additionalDefence` maps to `adf`.
- The approved `archetypeText`/`att` parameter has no current `SearchForm` field and is not introduced by this feature.
- Parser behavior for aliases without a current form destination must remain safe; such values cannot be restored into `SearchForm` unless a separate query-domain consumer is deliberately added later.

## Search condition value objects

### NumericCondition

- `operator`: recognized search comparison operator
- `value`: finite number or `null`; zero is meaningful

### FilteredNumericCondition

- `filterType`: recognized search filter; default is `all`
- `operator`: recognized comparison operator
- `value`: finite number or `null`

For the existing numeric presence Modifiers, `include` and `exclude` are valid without a comparison. The Parser may restore a comparison beside `exclude`, while the Builder omits that comparison from the canonical output. Level remains an exception: its Comparison remains valid with `lvm=exclude`.

### SlotCondition

- `match`: recognized logical match; default is `or`
- `slots`: record from slot identifier to numeric count

The logical query retains only valid positive counts. `none` is a meaningful standalone match modifier and does not require a base pair collection. When `none` is selected, Pair values are ignored for canonical output. Pairless `or` / `and` are omitted as unspecified.

## SearchLocation

- Route path is `/cards`.
- An empty meaningful query has no query parameters.
- A non-empty query uses the logical parameters produced by the builder; Vue Router performs URL encoding.
- Reopening a location supplies route-query input to the paired parser.

## Relationships and state transitions

```text
SearchForm
  -- pure normalize/applicability --> LogicalCardSearchQuery
  -- Vue Router encoding ---------> SearchLocation (/cards?...)
  -- route query + parser ---------> restored SearchForm / query consumer
```

1. Editing changes only `SearchForm`.
2. Submission snapshots and normalizes the current state.
3. Inapplicable, default, empty, invalid, and incomplete conditions are omitted.
4. The router navigates to `/cards`, with parameters only when meaningful conditions exist.
5. Parsing begins with `createSearchForm()` and applies only recognized valid conditions.
6. Rebuilding a parsed non-canonical query yields the canonical representation.
