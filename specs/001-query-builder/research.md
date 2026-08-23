# Phase 0 Research: Card Search Query Builder

## Canonical transport representation

- **Decision**: Represent search conditions as canonical URL query parameters defined by the Query Specification. The Query Builder shall generate the logical query representation, while framework-specific URL encoding shall be delegated to Vue Router.

- **Rationale**: The Query Specification (`docs/architecture/query_specification.md`) provides a stable and canonical URL representation shared by the Query Builder and Query Parser. Separating the logical query format from framework-specific URL encoding keeps implementation concerns independent from the URL query specification while ensuring deterministic and reversible query generation.

- **Alternatives considered**: Embedding the entire query as a single JSON parameter was rejected because the repository adopts explicit query parameter mapping defined by the Query Specification. Passing raw form state was rejected because it exposes UI-specific state, default values, and implementation details. Framework-specific URL serialization remains outside the scope of this design.

## Deterministic canonicalization

- **Decision**: Construct fields in the fixed contract order; trim text; deduplicate and lexically sort multi-value selections; sort slot keys and omit non-positive/invalid slot counts; rely on deterministic object insertion order before `JSON.stringify`.
- **Rationale**: This makes semantically equivalent forms serialize identically and makes exact-string tests stable. Rebuilding a new object also guarantees the input form is not mutated.
- **Alternatives considered**: Preserving selection order was rejected because it makes incidental UI history observable. A generic recursive canonicalizer was rejected as unnecessary abstraction for a known, strongly typed schema.

## Optional and compound conditions

- **Decision**: Include numeric conditions only when `Number.isFinite(value)`; value `0` is valid. Include filtered numeric conditions only with a number and preserve `filterType` plus `operator`. Include slot conditions only when at least one valid slot remains and preserve `match`. Omit blank strings, empty arrays, default `landCategory: "all"`, and incomplete compounds.
- **Rationale**: Presence checks must distinguish `null` from zero, while compound fields must be atomic so operators cannot survive without operands.
- **Alternatives considered**: Truthiness checks were rejected because they lose zero. Emitting partial/default objects was rejected because it creates misleading searches.

## Category applicability

- **Decision**: Use the lowercase UI category vocabulary already defined by `CARD_CATEGORY` (`unit`, `spell`, `item-consume`, `item-equip`, `item-bullet`, `land`, `ritual`, `summoner`, `token`) as the form/query contract. Unit fields apply to `unit` and `token`; equipment fields to `item-equip` and `token`; land fields to `land` and `token`; empty category keeps all sections eligible. Shared basic, origin, effect, and other fields always apply.
- **Rationale**: These values are what the controls and visibility logic currently use. Centralized applicability prevents values retained by `v-show` controls from silently filtering unrelated categories.
- **Alternatives considered**: The uppercase master-card `CardCategoryCode` was rejected for the UI form because it cannot represent the three item subcategories. Clearing hidden form sections was rejected because it mutates user state and makes category changes lossy.

## Parser compatibility and validation

- **Decision**: Treat builder and parser as two sides of one versioned contract (`v: 1`). The parser validates unknown/malformed data defensively and restores meaningful conditions onto a fresh default form. Tests cover build stability, builder/parser round trips, malformed input, and navigation.
- **Rationale**: The specification explicitly requires interpretation compatibility, while URLs are untrusted input. A version marker supports future migration without guessing payload shape.
- **Alternatives considered**: Builder-only testing was rejected because it cannot prove semantic restoration. Schema-library adoption was rejected because the project has no such dependency and hand validation is bounded for this feature.

## Testing strategy

- **Decision**: Use Vitest table-driven unit tests for every field family and edge case, plus a small page/integration test verifying `/cards` navigation with and without `q`.
- **Rationale**: The pure transformation provides fast exhaustive coverage; the integration test protects the router handoff without coupling all cases to component rendering.
- **Alternatives considered**: End-to-end-only testing was rejected as slower and less diagnostic. Snapshot-only tests were rejected because explicit semantic assertions better expose omissions and operator mistakes.
