---

description: "Dependency-ordered implementation tasks for the card search query builder"
---

# Tasks: Card Search Query Builder

**Input**: Design documents from `/specs/002-query-builder/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/card-search-query.md`, `quickstart.md`

**Tests**: Required by the specification, plan, constitution, and quickstart. Write each story's tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and has no dependency on an incomplete task
- **[Story]**: User story traceability label (`US1`, `US2`, or `US3`)
- Every task names the exact file it changes or validates

## Phase 1: Setup (Shared Test Infrastructure)

**Purpose**: Establish reusable typed fixtures for exhaustive builder/parser tests without duplicating mutable form setup.

- [X] T001 Create typed fresh-form, populated-form, and deep-clone assertion fixtures in app/utils/search/cardSearchQueryTestFixtures.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared form and transport vocabulary used by every story.

**CRITICAL**: Complete this phase before beginning any user story.

- [X] T002 Align SearchForm.cardCategory with the lowercase CardCategory UI vocabulary and add a strict LogicalCardSearchQuery type in app/types/ui/search.ts
- [X] T003 Define the authoritative ordered alias metadata, recognized value guards, UI `defence`/`additionalDefence` adapters, and category-applicability predicates shared by builder and parser in app/utils/search/cardSearchQuerySchema.ts

**Checkpoint**: Typed form and query contracts are ready for story implementation.

---

## Phase 3: User Story 1 - Search with Selected Conditions (Priority: P1) MVP

**Goal**: Convert every valid, applicable detailed-search condition into the canonical logical query and submit it to the card list.

**Independent Test**: Populate text, one multi-select collection, and one numeric comparison, execute search, and verify `/cards` receives each condition once while defaults are absent.

### Tests for User Story 1

- [X] T004 [P] [US1] Add table-driven tests for every primitive, collection, comparison, filtered comparison, pair collection, modifier, `df`/`adf` adapter, stable ordering, and source immutability case in app/utils/search/cardSearchQueryBuilder.test.ts
- [X] T005 [P] [US1] Add a Nuxt/Vue Test Utils navigation test proving populated and empty submissions call Vue Router with the expected `/cards` location in app/pages/cards/search.test.ts

### Implementation for User Story 1

- [X] T006 [US1] Implement the pure ordered SearchForm-to-LogicalCardSearchQuery transformation with trimming, collection deduplication/sorting, complete compound serialization, default omission, and immutable input handling in app/utils/search/cardSearchQueryBuilder.ts
- [X] T007 [US1] Build the logical query on submit and push `{ path: '/cards', query }`, omitting query for an empty form, in app/pages/cards/search.vue

**Checkpoint**: Valid selected conditions navigate to the card list in one action and the empty form navigates to bare `/cards`.

---

## Phase 4: User Story 2 - Bookmark and Share a Search (Priority: P2)

**Goal**: Parse a card-list URL back into the same meaningful form conditions and preserve canonical, Unicode-safe bookmarkable round trips.

**Independent Test**: Build a query containing Japanese text, spaces, emoji, and reserved punctuation, serialize and reopen it through Vue Router, and verify parsing then rebuilding yields the same canonical logical query.

### Tests for User Story 2

- [X] T008 [P] [US2] Add table-driven parser tests for every mapped alias, restored defaults, arbitrary parameter order, and canonical parse/build round trips in app/utils/search/cardSearchQueryParser.test.ts
- [X] T009 [P] [US2] Add Vue Router integration coverage for UTF-8 text, spaces, emoji, reserved punctuation, and repeated equivalent submissions in app/utils/search/cardSearchQueryRouter.test.ts
- [X] T010 [P] [US2] Add a card-list page test proving route query is consumed through the parser without affecting page rendering in app/pages/cards/index.test.ts

### Implementation for User Story 2

- [X] T011 [US2] Implement the defensive RouteLocationNormalized query-to-SearchForm parser with default restoration and canonical vocabulary mapping in app/utils/search/cardSearchQueryParser.ts
- [X] T012 [US2] Parse the current route query at the card-list boundary and expose the restored meaningful conditions for card-list consumption in app/pages/cards/index.vue

**Checkpoint**: A generated location can be reopened and rebuilt without changing its meaningful search conditions.

---

## Phase 5: User Story 3 - Handle Partial Conditions Safely (Priority: P3)

**Goal**: Omit incomplete, invalid, empty, and category-inapplicable state while retaining valid false-like and boundary values.

**Independent Test**: Submit incomplete compounds, blank text, duplicate/empty selections, stale hidden-section state, invalid numbers, and numeric zero; verify only complete applicable values remain and malformed URL input cannot break parsing.

### Tests for User Story 3

- [X] T013 [P] [US3] Extend builder tests with whitespace-only text, duplicate selections, zero, non-finite numbers, partial compounds, invalid/non-positive slot entries, and every category-applicability branch in app/utils/search/cardSearchQueryBuilder.test.ts
- [X] T014 [P] [US3] Extend parser tests with unknown aliases, malformed comparisons/modifiers/pairs, duplicate last-wins values, merged collections, merged last-wins pair keys, and valid-neighbor recovery in app/utils/search/cardSearchQueryParser.test.ts

### Implementation for User Story 3

- [X] T015 [US3] Harden builder normalization so invalid, incomplete, default, and inapplicable retained values are omitted while finite zero and valid applicable values survive in app/utils/search/cardSearchQueryBuilder.ts
- [X] T016 [US3] Harden parser duplicate resolution and malformed-input recovery so recognized valid neighbors still restore and canonical rebuild removes non-canonical input in app/utils/search/cardSearchQueryParser.ts

**Checkpoint**: Partial or hostile input is handled predictably without mutation, misleading standalone modifiers, or page failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against its contract and repository quality gates.

- [X] T017 [P] Update implementation notes and runnable validation examples to match final builder/parser behavior in specs/002-query-builder/quickstart.md
- [X] T018 Run the focused query suite and repair any contract gaps in app/utils/search/cardSearchQueryBuilder.test.ts
- [X] T019 Run the full Vitest suite, ESLint, and Nuxt production build and record successful commands in specs/002-query-builder/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001 and blocks all user stories.
- **US1 (Phase 3)**: Depends on Phase 2; this is the MVP.
- **US2 (Phase 4)**: Depends on the builder contract delivered by US1 because its acceptance test rebuilds parsed queries.
- **US3 (Phase 5)**: Depends on the builder and parser delivered by US1 and US2, then hardens both boundaries.
- **Polish (Phase 6)**: Depends on whichever stories are included in the release; T019 follows T017 and T018.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 (P1/MVP) -> US2 (P2) -> US3 (P3) -> Polish
```

US2 and US3 are independently testable outcomes, but their implementations deliberately extend the builder/parser foundation introduced by earlier priorities.

### Within Each User Story

- Add the listed tests first and verify that they fail for the expected missing behavior.
- Implement pure transformation behavior before page integration.
- Complete and independently validate the story before advancing to the next priority.
- Tasks touching the same implementation or test file run sequentially even if their surrounding stories are staffed separately.

### Parallel Opportunities

- After T003, T004 and T005 can run in parallel.
- After US1, T008, T009, and T010 can run in parallel.
- After US2, T013 and T014 can run in parallel.
- T017 can run in parallel with focused validation in T018 after story implementation stabilizes.

---

## Parallel Example: User Story 1

```text
Task T004: Exhaustive pure-builder tests in app/utils/search/cardSearchQueryBuilder.test.ts
Task T005: Page navigation-boundary tests in app/pages/cards/search.test.ts
```

## Parallel Example: User Story 2

```text
Task T008: Pure parser and canonical rebuild tests in app/utils/search/cardSearchQueryParser.test.ts
Task T009: Vue Router encoding round-trip tests in app/utils/search/cardSearchQueryRouter.test.ts
Task T010: Card-list route-consumption tests in app/pages/cards/index.test.ts
```

## Parallel Example: User Story 3

```text
Task T013: Builder edge and applicability tests in app/utils/search/cardSearchQueryBuilder.test.ts
Task T014: Parser duplicate and malformed-input tests in app/utils/search/cardSearchQueryParser.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T003 for shared typed infrastructure.
2. Write and fail T004-T005.
3. Implement T006-T007.
4. Run the US1 tests and manually verify populated and empty submissions.
5. Stop here for the smallest useful release: detailed search conditions reach `/cards` canonically.

### Incremental Delivery

1. Deliver US1 as the working query-builder MVP.
2. Add US2 to make generated searches reopenable, deterministic, and shareable.
3. Add US3 to cover malformed, partial, boundary, and stale hidden state safely.
4. Complete Phase 6 and release only after the focused suite, full suite, lint, and production build pass.

### Parallel Team Strategy

1. Complete Setup and Foundational work together.
2. Within each story, assign different developers only to tasks marked `[P]`.
3. Serialize builder/parser implementation tasks because later stories harden the same files.
4. Merge each story only after its independent test criterion passes.

---

## Notes

- The mapping table in docs/architecture/query_specification.md is authoritative.
- Vue Router, not the builder, performs percent encoding.
- Do not add the unexposed `archetypeText`/`att` field.
- Do not use `any`; keep transformations pure and input immutable.
- `[P]` means different files and no dependency on unfinished work.
- Commit after each task or coherent task group, and validate at every checkpoint.
