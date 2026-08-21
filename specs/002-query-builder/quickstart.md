# Quickstart: Validate the Card Search Query Builder

## Prerequisites

- Node.js and npm compatible with the checked-in Nuxt 4 toolchain
- Branch `002-query-builder`
- Dependencies installed from `package-lock.json`

## Setup

```powershell
npm ci
```

## Automated validation

Run focused tests during implementation, then all quality gates:

```powershell
npm test -- cardSearchQuery
npm test -- --run
npm run lint
npm run build
```

Expected outcomes:

- Builder/parser tests cover every mapping-table field family and pass.
- Explicit adapter tests prove UI `defence`/`additionalDefence` use `df`/`adf`, while no unexposed `att` field is invented.
- Reordered and duplicate selections produce the same canonical query.
- Blank, default, incomplete, invalid, and category-inapplicable values are absent; numeric zero remains.
- Unknown and malformed route parameters do not prevent valid parameters from parsing.
- Japanese text, spaces, emoji, and reserved punctuation survive a router build/parse round trip.
- The source form and its nested values remain unchanged.
- Lint and the production build complete successfully.

## Manual end-to-end validation

1. Run `npm run dev` and open `/cards/search`.
2. Enter Japanese text plus reserved punctuation, choose several options in non-sorted order, select `unit`, and enter numeric zero with a comparison operator.
3. Submit and confirm navigation reaches `/cards` with aliases and logical formats from `docs/architecture/query_specification.md`.
4. Repeat the same meaningful selections in a different order and confirm the resulting location is identical.
5. Populate a category-specific section, switch to a category that hides it, submit, and confirm its stale values are absent from the URL.
6. Submit a reset form and confirm the location is exactly `/cards` with no query parameters.
7. Paste a non-empty location into a fresh tab and confirm the same meaningful conditions are restored or consumed.
8. Add an unknown or malformed parameter and confirm valid conditions still load without a page error; rebuilding should remove the non-canonical input.

See [the query contract](contracts/card-search-query.md), [the data model](data-model.md), and `docs/architecture/query_specification.md` for normative details.
