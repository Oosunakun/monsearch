# Contract: Card Search Logical URL Query

## Authority and route

- The card-list route is `/cards`.
- `docs/architecture/query_specification.md` version 1.0.0 is authoritative for aliases, logical value formats, canonical ordering, duplicate handling, defaults, and version policy.
- Version 1 does not include a version query parameter.

## Builder input and output

- Input: a read-only `SearchForm` snapshot.
- Output: a Vue Router-compatible logical query object containing at most one value for each emitted alias.
- Framework percent encoding is outside the builder and is delegated to Vue Router.
- Parameters are inserted in the Query Specification mapping-table order.
- UI `defence` and `additionalDefence` map explicitly to `df` and `adf`; internal property spelling does not alter stable aliases.
- `archetypeText`/`att` is reserved by the approved query vocabulary but is not emitted from or restored into the current form because no corresponding field is exposed.

## Canonical rules

1. Primitive text is trimmed and omitted when empty.
2. Collections are copied, deduplicated, lexically sorted, and joined with `,`.
3. Comparisons use `operator:value` and are omitted unless complete and finite; zero is valid.
4. Pair collections use sorted `key:value` entries joined with `,`; invalid or non-positive counts are omitted.
5. Filter and match modifiers are emitted only for an existing valid base condition and only when non-default.
6. Default `landCategory: all` is omitted.
7. Reserved syntax characters inside user text retain their literal meaning after framework encoding and parsing.
8. Building does not mutate the supplied form.

## Category applicability

| Condition group | Eligible selected category |
|---|---|
| Basic, origin, effect, other | All categories and no category |
| Unit | `unit`, `token`, or no category |
| Equipment | `item-equip`, `token`, or no category |
| Land | `land`, `token`, or no category |

Values retained in ineligible hidden sections are omitted, not cleared.

## Parser behavior

- Accept query parameter order independent of canonical order.
- Ignore unknown aliases and invalid values while preserving other valid conditions.
- Primitive, modifier, and comparison duplicates use the last value.
- Collection duplicates merge and deduplicate all items.
- Pair-collection duplicates merge, with the last value winning for a repeated key.
- Restore omitted modifiers and fields to defaults using `createSearchForm()`.
- Never fail page rendering solely because a query is malformed or non-canonical.

## Behavioral guarantees

1. Equivalent meaningful form states produce an identical canonical logical query and location.
2. Every supported, applicable, valid form condition maps to the alias assigned by the Query Specification.
3. Empty meaningful form state navigates to `/cards` without a query suffix.
4. `parse(build(form))` restores the same meaningful applicable conditions onto defaults.
5. `build(parse(nonCanonicalQuery))` produces the canonical representation.
