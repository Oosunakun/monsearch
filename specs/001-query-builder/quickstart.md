# Quickstart: Validate the Card Search Query Builder

## Prerequisites

- Node.js and npm compatible with the checked-in Nuxt 4 toolchain
- Dependencies installed from `package-lock.json`
- Branch `001-query-builder`

## Setup

```powershell
npm ci
```

## Automated validation

Run focused tests during implementation, then the full quality gates:

```powershell
npm test -- cardSearchQuery
npm test -- --run
npm run lint
npm run build
```

Expected outcomes:

- Builder/parser tests cover every field family and pass.
- Reordered/duplicate selections produce identical strings.
- Blank/default/incomplete values are absent; zero remains present.
- Category-inapplicable retained values are absent.
- Unicode and reserved punctuation survive a build/parse round trip.
- Immutability assertions show the original form is unchanged.
- Lint and production build complete without errors.

## Manual end-to-end validation

1. Start the app with `npm run dev` and open `/cards/search`.
2. Enter a name containing Japanese text and reserved punctuation, select multiple elements in a non-sorted order, select `unit`, and enter numeric zero with a comparison operator.
3. Submit once. Confirm navigation reaches `/cards` with canonical URL query parameters defined by the Query Specification and no runtime error.
4. Return to the form, make the same meaningful selections in another order, submit, and confirm the resulting URL is identical.
5. Select a category, populate one of its visible conditions, change to a category where that section is hidden, and submit. Decode/inspect the query and confirm the stale condition is absent.
6. Submit a completely reset form and confirm the location is exactly `/cards`, without any query parameters.
7. Copy a non-empty URL into a new tab and confirm its parser/consumer restores the conditions described by [Card Search Query v1](contracts/card-search-query.md).

See `docs/architecture/query_specification.md` for the canonical URL query representation, `data-model.md` for entity validation rules, and `contracts/card-search-query.md` for Builder/Parser guarantees.
