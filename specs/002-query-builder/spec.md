# Feature Specification: Card Search Query Builder

**Feature Branch**: `002-query-builder`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "query-builder"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search with Selected Conditions (Priority: P1)

As a card researcher, I want the detailed-search form to turn my selected conditions into a search request so that the card list shows only relevant cards.

**Why this priority**: Translating the form into a search request is the essential behavior that makes detailed search useful.

**Independent Test**: Complete a form with text, one multi-select value, and one numeric condition, submit it, and verify that the resulting search request represents each selected condition exactly once.

**Acceptance Scenarios**:

1. **Given** a user has selected valid conditions in several search sections, **When** the user executes the search, **Then** the card list receives all selected conditions with their intended comparison and matching rules.
2. **Given** a user leaves optional fields at their defaults, **When** the user executes the search, **Then** default and empty values add no unnecessary conditions.
3. **Given** a user selects multiple values for one condition, **When** the request is built, **Then** all distinct selected values are retained in a stable representation.

---

### User Story 2 - Bookmark and Share a Search (Priority: P2)

As a card researcher, I want my search conditions represented in the card-list location so that I can bookmark or share the same search.

**Why this priority**: A stable search location makes useful research reproducible beyond the initial session.
sp
**Independent Test**: Build a search, open its generatsced location in a fresh session, and verify that it represents the same meaningful conditions.

**Acceptance Scenarios**:

1. **Given** a valid detailed-search form, **When** the user submits it, **Then** the user reaches the card list with the search conditions represented in its location.
2. **Given** the same form state is submitted repeatedly, **When** each resulting location is compared, **Then** the represented query is identical.
3. **Given** conditions contain spaces, Japanese characters, or reserved punctuation, **When** the location is reopened, **Then** the intended values are preserved without corruption.

---

### User Story 3 - Handle Partial Conditions Safely (Priority: P3)

As a card researcher, I want incomplete or unusable conditions handled predictably so that one mistaken field does not produce a misleading search.

**Why this priority**: Safe handling of edge inputs protects trust in results while allowing ordinary partial searches.

**Independent Test**: Submit forms containing incomplete numeric conditions, empty selections, and boundary values, and verify that only complete, meaningful conditions are included.

**Acceptance Scenarios**:

1. **Given** a numeric condition has a comparison choice but no number, **When** the request is built, **Then** that condition is omitted.
2. **Given** a field contains only whitespace, **When** the request is built, **Then** it is treated as empty.
3. **Given** zero is valid for a condition, **When** the request is built, **Then** zero is retained rather than treated as empty.

### Edge Cases

- Repeated selections for the same option are represented only once.
- Surrounding whitespace is removed without changing meaningful internal whitespace.
- Reserved punctuation, non-Latin characters, and emoji preserve their meaning.
- Empty arrays, blank text, and untouched optional conditions are omitted.
- Valid boundary values, including numeric zero, are retained.
- A partially completed compound condition is omitted as a whole.
- Stale values from sections that do not apply to the selected card category are excluded.
- An entirely empty form leads to the unfiltered card list without a meaningless query suffix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST convert the current detailed card-search form into conditions usable by the card list.
- **FR-002**: The conversion MUST support every searchable condition exposed by the detailed-search form.
- **FR-003**: The system MUST omit blank text, empty selections, untouched optional conditions, and incomplete compound conditions.
- **FR-004**: The system MUST retain meaningful false-like values, including numeric zero, when valid for a condition.
- **FR-005**: The system MUST preserve each selected comparison, filter, and logical matching rule.
- **FR-006**: Multiple selected values MUST be represented without loss or duplication and independently of incidental selection order.
- **FR-007**: User-entered text MUST lose surrounding whitespace while retaining meaningful content.
- **FR-008**: Text containing non-Latin characters, spaces, emoji, or reserved punctuation MUST retain its meaning in a bookmarkable search location.
- **FR-009**: The same meaningful form state MUST always produce the same search representation in a stable condition order.
- **FR-010**: Values retained in conditional form sections MUST be excluded when they do not apply to the selected card category.
- **FR-011**: Executing a search MUST take the user to the card list using the built conditions.
- **FR-012**: An empty form MUST take the user to the unfiltered card list without meaningless condition data.
- **FR-013**: Building a search MUST NOT alter the form state supplied by the user.
- **FR-014**: Reopening a built search MUST restore the same meaningful condition set.

### Key Entities

- **Search Form**: The user's current card-search values, selected operators, filters, and logical matching choices.
- **Search Representation**: The canonical collection of applicable conditions created from the form.
- **Search Location**: The bookmarkable card-list location containing the search representation.
- **Search Condition**: One meaningful criterion, such as text, an option, multiple options, a numeric comparison, or a compound matching rule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Validation of every detailed-search field shows that 100% of valid non-default conditions are represented and 100% of default or incomplete conditions are omitted.
- **SC-002**: Across at least 100 representative form states, repeated submissions produce identical search locations in 100% of attempts.
- **SC-003**: Users reach the corresponding card list in one action, with the transition completing within 1 second in at least 95% of measured interactions under normal conditions.
- **SC-004**: At least 95% of participants in a usability check can bookmark or share a search and recover the same conditions on their first attempt.
- **SC-005**: All tested Japanese text, whitespace, reserved punctuation, emoji, and valid numeric boundary cases survive a submit-and-reopen round trip without changed meaning.

## Assumptions

- “Query builder” refers to the repository's existing detailed card-search form and its handoff to the card list.
- Existing fields, option sets, comparisons, filters, and matching semantics define the supported search vocabulary; adding new search fields is outside scope.
- The card-list location is the durable handoff for search conditions; retrieving and filtering card data is outside this feature.
- Duplicate selections have no additional meaning and may be normalized to one occurrence.
- Hidden category-specific conditions are inapplicable and must not silently affect results.
- Authentication, saved-search accounts, search history, and server-side persistence are outside scope.
