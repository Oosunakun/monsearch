# Contract: Card Search Query v1

## Route

- The card list route is `/cards`.
- The URL query format is defined by the Query Specification (`docs/architecture/query_specification.md`).

## Canonical representation

- The Query Builder shall generate URL query parameters that conform to the Query Specification.
- The Query Parser shall interpret URL query parameters according to the same specification.
- Both Builder and Parser shall preserve the semantic meaning of all supported search conditions across a round trip.
- The Query Specification (`docs/architecture/query_specification.md`) defines:
  - Parameter mapping
  - Value formats
  - Collection representation
  - Compound condition representation
  - Canonical ordering
  - Default omission rules
  - Versioning

## Category applicability matrix

| Condition group | Eligible selected category |
|---|---|
| Basic, origin, effect, other | All categories and no category |
| Unit | `unit`, `token`, or no category |
| Equipment | `item-equip`, `token`, or no category |
| Land | `land`, `token`, or no category |

Ineligible retained values are omitted, not cleared from the source form.

## Empty and invalid values

- Invalid enum values from an untrusted URL are ignored by the parser.
- Unsupported versions, invalid JSON, non-object payloads, and structurally invalid compounds do not throw into page rendering; parsing returns a safe empty/default result.

## Behavioral guarantees

1. Equal meaningful form states produce byte-identical canonical URL query parameters.
2. Building does not modify the form, its arrays, or nested conditions.
3. `parse(build(form))` restores the same meaningful, applicable conditions onto defaults.
4. No meaningful conditions result in `/cards` without query parameters.
