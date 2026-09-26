---

description: "Implementation tasks for the Card Search Query Builder"
---

# Tasks: Card Search Query Builder

**Input**: Design documents from `/specs/001-query-builder/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/card-search-query.md`, `quickstart.md`

**Tests**: Required by the feature specification, constitution, and implementation plan. Test tasks precede their corresponding implementation tasks.

**Organization**: Tasks are grouped by user story so each increment has an explicit independent test.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and has no dependency on an incomplete task
- **[Story]**: Maps the task to a user story from `spec.md`
- Every task names the file it changes or validates

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing Nuxt/Vitest project is ready for focused query work.

- [ ] T001 Verify the checked-in Nuxt 4 dependencies install and the baseline test suite runs using `package.json` and `package-lock.json`
- [ ] T002 [P] Create the builder test scaffold with shared form fixtures in `app/utils/search/cardSearchQueryBuilder.test.ts`
- [ ] T003 [P] Create the parser test scaffold with logical route-query fixtures in `app/utils/search/cardSearchQueryParser.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the strict shared contract and correct the form category vocabulary before implementing any story.

**CRITICAL**: All user-story work depends on this phase.

- [ ] T004 Replace the incompatible `CardCategoryCode` form field with the lowercase `CardCategory` option vocabulary in `app/types/ui/search.ts`
- [ ] T005 Define strict `CardSearchQuery`, numeric, filtered-numeric, slot-condition, and logical route-query types in canonical specification order in `app/types/ui/search.ts`
- [ ] T006 [P] Add reusable enum-value sets needed for defensive parsing to `app/utils/constants/search/conditions/index.ts`
- [ ] T007 [P] Export the option-value sets needed to validate every searchable collection in `app/utils/constants/search/options/index.ts`
- [ ] T008 Add shared query aliases, canonical field ordering, default modifiers, and category-applicability groups in `app/utils/search/cardSearchQueryBuilder.ts`

**Checkpoint**: The typed Query Specification vocabulary is available to builder, parser, and page integration work.

---

## Phase 3: User Story 1 - Search with Selected Conditions (Priority: P1) MVP

**Goal**: Transform every meaningful selected form condition into one deterministic logical card-search query without mutating the form.

**Independent Test**: Populate text, a duplicated/out-of-order multi-select, and a numeric compound condition; build the query and verify each selected condition appears exactly once, defaults are absent, canonical ordering is stable, and the source form is unchanged.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add table-driven coverage for text, primitive, collection, numeric, filtered-numeric, and slot field families in `app/utils/search/cardSearchQueryBuilder.test.ts`
- [ ] T010 [P] [US1] Add canonical deduplication, lexical ordering, repeated-build determinism, and deep immutability assertions in `app/utils/search/cardSearchQueryBuilder.test.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Implement pure trim, unique-sort, finite-number, and sorted-positive-slot normalization helpers in `app/utils/search/cardSearchQueryBuilder.ts`
- [ ] T012 [US1] Implement canonical `SearchForm` to `CardSearchQuery` transformation for all 37 detailed-search fields in `app/utils/search/cardSearchQueryBuilder.ts`
- [ ] T013 [US1] Implement Query Specification alias mapping and primitive, collection, comparison, modifier, and pair-collection serialization in `app/utils/search/cardSearchQueryBuilder.ts`
- [ ] T014 [US1] Verify the complete US1 builder suite passes with no input mutation in `app/utils/search/cardSearchQueryBuilder.test.ts`

**Checkpoint**: US1 produces a complete deterministic logical query and is independently testable without routing.

---

## Phase 4: User Story 2 - Preserve and Revisit a Search (Priority: P2)

**Goal**: Navigate to `/cards` with canonical logical query parameters and restore their meaningful conditions through the paired parser.

**Independent Test**: Submit a form containing spaces, Japanese characters, emoji, and reserved punctuation; verify router navigation receives canonical query parameters and parsing them restores the same meaningful conditions. An empty form must navigate to exactly `/cards` with no query object.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add builder/parser canonical round-trip tests for primitives, collections, compounds, Unicode, emoji, spaces, and reserved punctuation in `app/utils/search/cardSearchQueryParser.test.ts`
- [ ] T016 [P] [US2] Add a Nuxt page test for non-empty and empty detailed-search submission in `app/pages/cards/search.test.ts`

### Implementation for User Story 2

- [ ] T017 [US2] Implement logical route-query decoding for all Query Specification aliases and default modifier restoration in `app/utils/search/cardSearchQueryParser.ts`
- [ ] T018 [US2] Implement parser application onto a fresh `createSearchForm()` result for semantic builder/parser round trips in `app/utils/search/cardSearchQueryParser.ts`
- [ ] T019 [US2] Connect `executeSearch` to the builder and call Vue Router with `/cards` plus canonical query parameters, omitting query data for an empty form, in `app/pages/cards/search.vue`
- [ ] T020 [US2] Verify canonical URLs, Unicode preservation, semantic round trips, and empty navigation in `app/utils/search/cardSearchQueryParser.test.ts` and `app/pages/cards/search.test.ts`

**Checkpoint**: US2 provides a stable card-list URL handoff and a compatible interpretation boundary.

---

## Phase 5: User Story 3 - Handle Partial or Invalid Conditions Safely (Priority: P3)

**Goal**: Omit incomplete, meaningless, and category-inapplicable form conditions while parsing untrusted route queries without throwing.

**Independent Test**: Build forms containing blank text, zero, non-finite numbers, partial compounds, invalid slot counts, and stale hidden-section values; confirm only complete applicable conditions survive. Parse malformed and unknown query values and confirm valid siblings remain while invalid input is ignored.

### Tests for User Story 3

- [ ] T021 [P] [US3] Add builder edge-case tests for whitespace, zero, non-finite numbers, incomplete compounds, invalid slots, and empty forms in `app/utils/search/cardSearchQueryBuilder.test.ts`
- [ ] T022 [P] [US3] Add category-applicability matrix tests covering unit, equipment, land, token, unrelated, and unselected categories in `app/utils/search/cardSearchQueryBuilder.test.ts`
- [ ] T023 [P] [US3] Add parser tests for unknown aliases, invalid enums, malformed comparisons, modifiers, collections, pair collections, and duplicate-parameter semantics in `app/utils/search/cardSearchQueryParser.test.ts`

### Implementation for User Story 3

- [ ] T024 [US3] Enforce atomic compound omission, finite-zero retention, default omission, and invalid slot filtering in `app/utils/search/cardSearchQueryBuilder.ts`
- [ ] T025 [US3] Enforce centralized unit, equipment, and land applicability without clearing retained form state in `app/utils/search/cardSearchQueryBuilder.ts`
- [ ] T026 [US3] Add defensive alias, enum, comparison, collection, pair-collection, and duplicate-value validation that preserves valid sibling parameters in `app/utils/search/cardSearchQueryParser.ts`
- [ ] T027 [US3] Verify the full US3 malformed-input and applicability suites complete without mutation or uncaught errors in `app/utils/search/cardSearchQueryBuilder.test.ts` and `app/utils/search/cardSearchQueryParser.test.ts`

**Checkpoint**: All three stories are functional, safe, and independently covered at their defined boundaries.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate full-field coverage and repository quality gates across the completed stories.

- [ ] T028 [P] Reconcile implementation names and behavior with the authoritative mapping and version policy in `docs/architecture/query_specification.md`
- [ ] T029 [P] Document any implementation-relevant contract clarifications discovered during verification in `specs/001-query-builder/contracts/card-search-query.md`
- [ ] T030 Run the focused builder/parser test command from `specs/001-query-builder/quickstart.md` and close any field-family coverage gaps in `app/utils/search/cardSearchQueryBuilder.test.ts` and `app/utils/search/cardSearchQueryParser.test.ts`
- [ ] T031 Run the full Vitest, ESLint, and Nuxt production-build gates defined in `specs/001-query-builder/quickstart.md`
- [ ] T032 Perform the seven manual navigation, canonicalization, applicability, empty-form, and copied-URL checks in `specs/001-query-builder/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks every user story.
- **US1 (Phase 3)**: Depends on Phase 2; this is the MVP and establishes the builder used by US2 and US3.
- **US2 (Phase 4)**: Depends on US1's logical builder output and can proceed once T013 is complete.
- **US3 (Phase 5)**: Depends on US1's normalization pipeline and can proceed once T013 is complete; it can run in parallel with US2.
- **Phase 6 (Polish)**: Depends on all stories selected for release.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 (MVP) -> US2 -> Polish
                              \-> US3 -/
```

### Within Each User Story

- Write the story's tests first and confirm they fail for the intended missing behavior.
- Implement types/shared helpers before transformations, transformations before serialization/parsing, and utilities before page integration.
- Complete each story's verification task before treating its checkpoint as deliverable.

### Parallel Opportunities

- T002 and T003 can run together after T001.
- T006 and T007 can run together after T004-T005.
- T009 and T010 can be authored together before US1 implementation.
- T015 and T016 can be authored together; after T013, parser work and page-test preparation use separate files.
- T021, T022, and T023 can be authored together; builder hardening and parser hardening then use separate files.
- US2 and US3 can proceed concurrently after T013.
- T028 and T029 can run together after story implementation.

---

## Parallel Example: User Story 1

```text
Task T009: Add field-family table tests in app/utils/search/cardSearchQueryBuilder.test.ts
Task T010: Add canonicalization and immutability cases in app/utils/search/cardSearchQueryBuilder.test.ts
```

## Parallel Example: User Story 2

```text
Task T015: Add round-trip tests in app/utils/search/cardSearchQueryParser.test.ts
Task T016: Add navigation tests in app/pages/cards/search.test.ts
```

## Parallel Example: User Story 3

```text
Task T021: Add incomplete/invalid builder cases in app/utils/search/cardSearchQueryBuilder.test.ts
Task T022: Add applicability matrix cases in app/utils/search/cardSearchQueryBuilder.test.ts
Task T023: Add malformed route-query cases in app/utils/search/cardSearchQueryParser.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Write T009-T010 and confirm the cases fail for missing behavior.
3. Complete T011-T014.
4. Stop and validate the pure builder independently before adding router concerns.

### Incremental Delivery

1. Deliver US1 as the deterministic query-building MVP.
2. Add US2 for canonical URL navigation and restoration.
3. Add US3 hardening for partial, stale, and untrusted input.
4. Run cross-cutting specification, automated, build, and manual checks.

### Parallel Team Strategy

After US1 completes, one developer can implement parser/navigation work for US2 while another adds builder/parser safety coverage for US3. Coordinate changes to the two shared utility files before merging.

---

## Notes

- `[P]` denotes tasks that can be prepared concurrently; tasks sharing a file still require coordinated edits or separate commits.
- The authoritative URL format is `docs/architecture/query_specification.md`; notably, Version 1 does not emit a version query parameter.
- Preserve strict TypeScript, avoid `any`, and do not mutate `SearchForm` or its nested values.
- Retrieval and card filtering remain outside this feature.
