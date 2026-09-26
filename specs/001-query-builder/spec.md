# Feature Specification: Card Search Query Builder

**Feature Branch**: `001-query-builder`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "query-builder"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search with Selected Conditions (Priority: P1)

As a card researcher, I want the detailed-search form to turn my selected conditions into a search request so that the card list shows only relevant cards.

**Why this priority**: Translating the form into a search request is the essential behavior that makes detailed search useful.

**Independent Test**: Complete a form with text, one multi-select value, and one numeric condition, submit it, and verify that the resulting search request represents each selected condition exactly once.

**Acceptance Scenarios**:

1. **Given** a user has selected valid conditions in several search sections, **When** the user executes the search, **Then** the card list receives a search request containing all selected conditions with their intended comparison and matching rules.
2. **Given** a user leaves optional fields at their defaults, **When** the user executes the search, **Then** default and empty values do not add unnecessary conditions to the search request.
3. **Given** a user selects multiple values for one condition, **When** the request is built, **Then** all selected values are retained in a stable, repeatable representation.

---

### User Story 2 - Preserve and Revisit a Search (Priority: P2)

As a card researcher, I want my search conditions converted into a canonical URL query for the card-list location so that the card list can be opened with the intended search conditions.

**Why this priority**: A canonical URL query provides a stable representation of the current search conditions and serves as the handoff to the card list.

**Independent Test**: Build a search and verify that the generated card-list URL contains a canonical representation of the selected search conditions.

**Acceptance Scenarios**:

1. **Given** a valid detailed-search form, **When** the user submits it, **Then** the user is taken to the card list with the search conditions encoded in its location.
2. **Given** the same form state is submitted repeatedly, **When** each search location is compared, **Then** the encoded query is identical.
3. **Given** search conditions contain text with spaces, Japanese characters, or reserved punctuation, **When** the URL query is generated, **Then** the encoded text preserves the intended meaning without corruption.

---

### User Story 3 - Handle Partial or Invalid Conditions Safely (Priority: P3)

As a card researcher, I want incomplete or unusable conditions handled predictably so that one mistaken field does not produce a misleading search.

**Why this priority**: Safe handling of edge inputs protects trust in search results while allowing ordinary partial searches.

**Independent Test**: Submit forms containing incomplete numeric conditions, empty selections, and boundary values, and verify that only complete, meaningful conditions are included.

**Acceptance Scenarios**:

1. **Given** a numeric condition has a comparison choice but no number, **When** the request is built, **Then** that numeric condition is omitted.
2. **Given** a field contains only whitespace, **When** the request is built, **Then** it is treated as empty.
3. **Given** a valid value is zero, **When** the request is built, **Then** zero is retained and is not mistaken for an empty value.

### Edge Cases

- Repeated selections for the same option are represented only once.
- Text containing leading or trailing whitespace is normalized without changing meaningful internal whitespace.
- Reserved punctuation, non-Latin characters, and emoji are preserved safely.
- Empty arrays, blank text, and untouched default condition objects are omitted.
- Numeric zero and other valid boundary values are retained.
- A partially completed compound condition is omitted as a whole rather than represented with altered meaning.
- Conditions irrelevant to the selected card category are not included merely because their controls retain stale values.
- An entirely empty form produces the unfiltered card-list location without an empty query suffix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST convert the current detailed card-search form into a search request suitable for the card list.
- **FR-002**: The request MUST support every searchable condition represented by the detailed-search form, including basic identity, origin, unit, equipment, land, effect, and other metadata conditions.
- **FR-003**: The system MUST omit blank text, empty selections, and untouched optional conditions from the request.
- **FR-004**: The system MUST retain meaningful false-like values, including numeric zero, when they form a valid condition.
- **FR-005**: The system MUST preserve the selected comparison operator, filter choice, and logical matching rule for compound conditions.
- **FR-006**: The system MUST include a compound condition only when the values required to interpret it are complete.
- **FR-007**: The system MUST represent multiple selected values without loss, duplication, or dependence on their incidental selection order.
- **FR-008**: The system MUST normalize user-entered text by removing surrounding whitespace while preserving meaningful content.
- **FR-009**: The system MUST safely preserve text containing non-Latin characters, spaces, and reserved punctuation in a shareable search location.
- **FR-010**: The same meaningful form state MUST always produce the same search representation.
- **FR-011**: Conditions MUST appear in a stable canonical order so searches can be compared, tested, bookmarked, and shared reliably.
- **FR-012**: The system MUST exclude retained values from conditional form sections when those conditions do not apply to the selected card category.
- **FR-013**: Executing a search MUST navigate the user to the card list using the built request.
- **FR-014**: An empty form MUST navigate to the unfiltered card list without meaningless condition data.
- **FR-015**: Building a request MUST NOT change the form state supplied by the user.
- **FR-016**: The builder's output MUST be compatible with the corresponding search interpretation behavior so a built request restores the same meaningful condition set.

### Key Entities
- **Search Form**: The user's current collection of card-search values, selected operators, filters, and logical matching choices.
- **Query Object**: The canonical internal representation of the user's search conditions. It contains all applicable search conditions before they are serialized into a URL query and is intended to be compatible with the search API request model.
- **URL Query**: The serialized representation of the Query Object used in the card-list URL for navigation, bookmarking, and sharing.
- **Search Condition**: One meaningful criterion, which may be text, a single option, multiple options, a numeric comparison, or a compound slot/matching rule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation covering every detailed-search field, 100% of valid non-default conditions are represented without loss and 100% of default or incomplete conditions are omitted.
- **SC-002**: For at least 100 representative form states, repeated builds produce identical search locations in 100% of attempts.
- **SC-003**: Users can submit a detailed search and reach the corresponding card list in one action, with the transition completing within 1 second for 95% of local interactions.
- **SC-004**: At least 95% of users in a usability check can bookmark or share a built search and recover the same meaningful conditions on their first attempt.
- **SC-005**: All tested Japanese text, whitespace, reserved punctuation, and valid numeric boundary cases survive a build-and-interpret round trip without changed meaning.

## Assumptions

- “Query builder” refers to the existing detailed card-search form and the currently empty card search query-building behavior.
- The card list location is the durable handoff point for search conditions; retrieving and filtering card data itself is outside this feature.
- Existing form fields, option sets, comparison choices, filters, and logical-match semantics define the supported search vocabulary.
- The corresponding query interpreter is responsible for reading the representation; this feature defines compatibility with it but does not expand search fields.
- Duplicate selections have no additional meaning and may be normalized to one occurrence.
- Hidden category-specific conditions are considered inapplicable and are excluded rather than silently affecting results.
- Authentication, saved-search accounts, search history, and server-side persistence are outside scope.
