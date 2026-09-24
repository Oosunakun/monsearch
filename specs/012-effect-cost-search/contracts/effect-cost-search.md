# Contract: Effect Cost Search

## Authority

- URL aliases, Pair Collection, Modifier, canonical ordering, defaults and parsing rules: `docs/architecture/query_specification.md` 1.1.0.
- Data mapping, card/Effect/alternative scope, quantities, `none`, null and search meaning: `docs/architecture/query_data_specification.md` 1.1.0.
- Search publication prerequisites: `docs/adr/0001-cost-search-publication-prerequisites.md` and Query Data Specification §7.5; the reviewed and validated `search_cost` dataset satisfies this prerequisite before this Feature.

## URL inputs

| Condition | Pair alias | Match alias | Keys |
|---|---|---|---|
| Item | `cis` | `cism` | `multi`, `consume`, `bullet` |
| Spell | `css` | `cssm` | `fire`, `water`, `earth`, `air`, `holy`, `curse`, `multi` |
| Other | `coe` | `coem` | `hand`, `deck`, `trash`, `power` |

Pair values are positive integer requirements. `or` is default and omitted canonically; `and` requires every Pair; `none` ignores Pair values and tests absence of that cost class. Existing Parser/Builder duplicate and ordering behavior remains authoritative.

The internal `search_cost` value `type: "spell", value: "any"` represents capacity assignable to any Spell Pair. It is not a Query Specification URL Pair value and is not added to the existing Parser/Builder vocabulary.

## Search behavior

1. A match requires one existing Effect on the card to satisfy all effect and cost conditions.
2. Positive cost conditions from different aliases are ANDed and must hold in one permitted alternative of that Effect.
3. `or` matches at least one Pair in that same alternative; `and` matches every Pair there. Distinct components/resources cannot be double-counted to satisfy multiple pairs.
4. An exact quantity matches when that alternative can pay at least the requested quantity. A range matches when some permitted quantity in the range is at least the requested quantity; prose numbers and incidental symbol occurrences do not count.
5. Alternatives and Effects are never aggregated.
6. Each `none` applies to its own cost class across the Effect's alternatives. A card without an Effect is not a match for `none` alone.
7. Only a validated, known cost-free Effect may satisfy `none`. Missing or unknown structured data is not cost-free.
8. Unstructured `has_other_cost` prevents matching `coe=none`.
9. `spell:any` is shared capacity assignable across Spell Pair requirements in the same alternative. It cannot be counted twice. An alternative with any-Spell range 1–3 matches `css=fire:2,water:1&cssm=and` (total capacity required 3) and does not match `css=fire:2,water:2&cssm=and` (required capacity 4).

## Publication prerequisite

Before this Feature, distinct `effect_cost_text` values were mapped and human-reviewed, generation fails for any nonempty unmapped value, `search_cost` was generated, and the resulting JSON was human-reviewed and diff-checked to confirm existing values were preserved. This satisfies QDS §7.5 for the current dataset. No new feature flag, publication flag, API validation-state detection, or unavailable-response behavior is added by this Feature. Runtime search uses `search_cost` and never parses `effect_cost_text`.
