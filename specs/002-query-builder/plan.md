# Implementation Plan: Card Search Query Builder

**Branch**: `002-query-builder` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-query-builder/spec.md`

## Summary

Implement a pure, strictly typed transformation from the existing detailed-search `SearchForm` into the logical URL query parameters defined by `docs/architecture/query_specification.md`. Normalize meaningful values, exclude defaults, incomplete compounds, and category-inapplicable retained state, then navigate to `/cards` through Vue Router. A paired parser and focused tests establish deterministic bookmarkable round trips.

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4, Vue 3, Vue Router 5; framework URL encoding through Vue Router

**Storage**: N/A; durable search state is carried in the card-list URL

**Testing**: Vitest 4 with table-driven unit tests; Nuxt Test Utils and Vue Test Utils at the navigation boundary

**Target Platform**: SSR-capable web application deployed using the Cloudflare Pages Nitro preset; evergreen browsers

**Project Type**: Nuxt web application

**Performance Goals**: Build and initiate local navigation within the specification's 1-second p95 interaction target; transformation linear in the number of form values

**Constraints**: Deterministic parameter and collection ordering, immutable input, strict typing without `any`, Unicode-safe URL round trips, approved Query Specification compliance, parser compatibility, and explicit adapters where UI and transport property names differ

**Scale/Scope**: Existing detailed-search form vocabulary, builder/parser utilities, detailed-search navigation, card-list query consumption boundary, and focused tests; no search engine or new fields

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | Use strict TypeScript, explicit form/query types, and no `any` | PASS: design uses the existing typed form vocabulary and introduces typed logical query output |
| II. Testability | Unit-test new logic at independent boundaries | PASS: builder and parser are pure; navigation is isolated at the page boundary |
| III. Incremental Change | Restrict work to the feature and avoid unrelated refactors | PASS: changes remain in search types/utilities, focused tests, and the two card pages |
| IV. Existing Architecture | Preserve repository responsibilities and layout | PASS: types remain under `app/types/ui`, transformations under `app/utils/search`, and routing in pages |
| V. Human Review | Expose material design choices in reviewed artifacts | PASS: canonical syntax remains governed by the approved Query Specification; applicability and validation are explicit here and in the contract |
| Additional Constraints | Use Spec Kit Core and investigate the brownfield repository | PASS: planning follows the required workflow and current repository evidence |

**Post-design re-check**: PASS. The data model, contract, and validation guide retain strict types, pure testable boundaries, incremental scope, and the existing Nuxt layout. No constitutional exception is required.

The implementation maps UI `defence` and `additionalDefence` to the approved transport `df` and `adf` aliases. The approved but currently unexposed `archetypeText`/`att` vocabulary does not add a form field in this feature.

## Project Structure

### Documentation (this feature)

```text
specs/002-query-builder/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- card-search-query.md
`-- tasks.md                 # generated later by $speckit-tasks
```

### Source Code (repository root)

```text
app/
|-- types/ui/
|   `-- search.ts
|-- utils/search/
|   |-- cardSearchFormFactory.ts
|   |-- cardSearchQueryBuilder.ts
|   |-- cardSearchQueryParser.ts
|   `-- *.test.ts
`-- pages/cards/
    |-- search.vue
    `-- index.vue

docs/architecture/
`-- query_specification.md
```

**Structure Decision**: Retain the single Nuxt application. Keep domain-free normalization and logical query serialization in the existing search utilities, shared types beside `SearchForm`, and Vue Router interaction at page boundaries. Colocate focused tests with utilities, consistent with the repository's existing Vitest precedent.

## Complexity Tracking

No constitution violations require justification.
