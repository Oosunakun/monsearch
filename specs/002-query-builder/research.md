# Phase 0 Research: Card Search Query Builder

> **整合注記**: 数値 Modifier の旧設計（比較がある場合のみ Modifier を出力）は Feature 010 と Query Specification 1.1.0 により superseded される。

## Canonical transport representation

- **Decision**: Emit a Vue Router-compatible logical query object whose keys, formats, ordering, modifiers, and omission rules follow `docs/architecture/query_specification.md` version 1.1.0. Do not add a version parameter.
- **Rationale**: The approved repository-internal Query Specification is authoritative and explicitly assigns stable aliases such as `nm`, `cc`, and `lv`. Vue Router owns UTF-8 percent encoding when constructing the location.
- **Alternatives considered**: A single JSON payload and raw form-state transport were rejected because they conflict with the approved compact, human-readable parameter contract. A `v=1` parameter was rejected because version 1 explicitly omits version information from the URL.

## Typed transformation boundary

- **Decision**: Build a new logical query object from `SearchForm` through a pure TypeScript utility, and parse route-query input through a paired defensive utility. Align `SearchForm.cardCategory` with the lowercase UI `CardCategory` vocabulary.
- **Rationale**: Pure transformations are independently testable, do not mutate reactive form state, and keep framework navigation out of domain normalization. The UI options distinguish item subcategories that the current master-card code type cannot express.
- **Alternatives considered**: Building parameters directly inside `search.vue` was rejected because it couples normalization to navigation. Using the uppercase master-card category code was rejected because it does not match current control values.

## UI-to-transport vocabulary adapters

- **Decision**: Explicitly map UI `defence` and `additionalDefence` to the authoritative `df` and `adf` transport aliases (whose mapping-table logical properties use `defense` spelling). Do not add `archetypeText` merely because the approved query vocabulary reserves `att`; the current detailed-search form does not expose that field.
- **Rationale**: Stable transport identifiers are independent of internal names, while the feature requires all currently exposed fields and explicitly excludes adding fields. Local adapters preserve both contracts without revising the approved document.
- **Alternatives considered**: Renaming existing UI state was rejected as unnecessary brownfield churn. Adding an archetype form field was rejected as out of scope. Editing aliases or inferring replacements for editorial naming inconsistencies was rejected because the mapping table is authoritative.

## Deterministic canonicalization

- **Decision**: Visit parameters in the Query Specification mapping-table order; trim surrounding text; copy, deduplicate, and lexically sort collections; sort pair-collection keys; emit each alias once.
- **Rationale**: Semantically equivalent form states then generate the same logical query and final URL regardless of selection or object insertion history. Copying before normalization preserves input immutability.
- **Alternatives considered**: Preserving selection order was rejected because incidental UI history would change bookmark URLs. A generic recursive canonicalizer was rejected as unnecessary for a fixed typed schema.

## Optional and compound conditions

- **Decision**: Keep finite numeric values including zero. Emit comparison and pair-collection values only when complete. Omit default `all` modifiers. Existing numeric `include` / `exclude` modifiers may be standalone; `exclude` suppresses its Comparison in canonical output while Parser may retain it for UI restoration. Level remains an exception.
- **Rationale**: Explicit presence checks preserve meaningful false-like values, while the established Modifier semantics distinguish standalone existence filters from Comparison values.
- **Alternatives considered**: Truthiness checks were rejected because they lose zero. Partial compounds and unconditional default modifiers were rejected because they violate specification omission rules.

## Category applicability

- **Decision**: Shared basic, origin, effect, and other conditions always apply. Unit conditions apply with no selected category or `unit`/`token`; equipment conditions with no category or `item-equip`/`token`; land conditions with no category or `land`/`token`. Retained state from ineligible hidden sections is omitted without modifying the form.
- **Rationale**: This mirrors the existing `v-show` page behavior and prevents hidden stale values from affecting a search while preserving reversible UI state during editing.
- **Alternatives considered**: Clearing fields on category changes was rejected because it mutates and loses user input. Including all retained values was rejected because hidden conditions would silently alter results.

## Parser and route integration

- **Decision**: The search page pushes `{ path: '/cards', query }`, or `/cards` with no query when empty. The parser accepts Vue Router query input, ignores unknown/invalid values, implements the specification's duplicate rules, and restores defaults through `createSearchForm()`.
- **Rationale**: This produces bookmarkable URLs, isolates routing, and supports canonical rebuilds from non-canonical or untrusted input without breaking page rendering.
- **Alternatives considered**: Manual URL string concatenation was rejected because framework encoding is explicitly delegated. Throwing on the first malformed parameter was rejected because the specification requires graceful parsing.

## Testing strategy

- **Decision**: Use table-driven Vitest coverage for all field families and aliases, plus canonical order, omission, zero, category applicability, duplicate parsing, Unicode/reserved-character round trips, immutability, and a small navigation integration test. Run lint and production build as final gates.
- **Rationale**: Pure unit tests provide fast exhaustive semantic coverage, while a narrow integration test protects the router handoff and empty-form behavior.
- **Alternatives considered**: End-to-end-only and snapshot-only testing were rejected as slower or less diagnostic than explicit semantic assertions.
