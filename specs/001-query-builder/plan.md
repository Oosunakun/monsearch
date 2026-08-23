# Implementation Plan: Card Search Query Builder

**Branch**: `001-query-builder` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-query-builder/spec.md`

## Summary

Implement a pure, strictly typed transformation from the existing `SearchForm` into a canonical `CardSearchQuery`, serialize that query into canonical URL query parameters defined by the Query Specification (`docs/architecture/query_specification.md`), and connect detailed-search submission to Vue Router.

## Technical Context

**Language/Version**: TypeScript in strict mode, Vue 3.5, Nuxt 4.4

**Primary Dependencies**: Nuxt 4, Vue 3, Vue Router 5; URL encoding and decoding through Vue Router in accordance with the Query Specification (`docs/architecture/query_specification.md`)

**Storage**: N/A; search state is carried in the card-list URL

**Testing**: Vitest 4 with table-driven unit tests; Nuxt/Vue Test Utils for the navigation integration boundary if needed

**Target Platform**: SSR-capable web application deployed with the Cloudflare Pages Nitro preset; evergreen browsers

**Project Type**: Nuxt web application

**Performance Goals**: Build and initiate local navigation within the specification's 1-second p95 interaction target; transformation should be linear in the number of form values

**Constraints**: Deterministic output, immutable input, strict typing without `any`, Unicode-safe URL round trips, and compatibility with the paired parser

**Scale/Scope**: One 37-field detailed-search form, one query-builder utility, its paired parser contract, one page navigation integration, and focused tests

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | Use strict TypeScript and explicit query/condition types; no `any` | PASS: the design adds a typed query model and resolves the existing category-type mismatch against the UI option vocabulary |
| II. Testability | New logic has unit tests at independently testable boundaries | PASS: the builder is pure; canonicalization, omission, applicability, immutability, and round trips are independently testable |
| III. Incremental Change | Limit changes to the feature; avoid unrelated refactors | PASS: work stays in search types/utilities, their tests, and detailed-search submission |
| IV. Existing Architecture | Respect current repository responsibilities and layout | PASS: builder/parser remain in `app/utils/search`, form types in `app/types/ui`, and routing in the page |
| V. Human Review | Material design choices are visible in approved artifacts | PASS: serialization rules are defined by the Query Specification (`docs/architecture/query_specification.md`), while applicability and validation rules are documented in this plan and contract. |
| Additional Constraints | Use Spec Kit Core and investigate the brownfield repository | PASS: planning follows the core workflow and is based on current source files |

**Post-design re-check**: PASS. The data model and contract preserve strict types, pure/testable boundaries, minimal scope, and the existing Nuxt utility/page architecture. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-query-builder/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── card-search-query.md
└── tasks.md                 # generated later by $speckit-tasks
```

### Source Code (repository root)

```text
app/
├── types/ui/
│   └── search.ts            # SearchForm and canonical query types
├── utils/search/
│   ├── cardSearchFormFactory.ts
│   ├── cardSearchQueryBuilder.ts
│   └── cardSearchQueryParser.ts
└── pages/cards/
    ├── search.vue           # builds query and navigates
    └── index.vue            # card-list query consumer boundary

tests or colocated app/**/*.test.ts
└── query builder/parser unit and navigation integration tests
```

**Structure Decision**: Retain the existing single Nuxt application. Put domain-free normalization and serialization in the existing search utilities, shared structures beside `SearchForm`, and keep Vue Router interaction at the page boundary. Tests may be colocated with utilities, matching the repository's current `app/utils/sample.test.ts` precedent.

## Complexity Tracking

No constitution violations require justification.
