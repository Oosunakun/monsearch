# Bug Fix: Defense field naming mismatch

- **Slug**: defense-field-name
- **Fixed**: 2026-08-23
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Renamed the detailed-search model and all active application consumers from `defence`/`additionalDefence` to `defense`/`additionalDefense`, including the related Vue components. The external URL query aliases remain `df` and `adf`, consistent with `docs/architecture/query_specification.md`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `app/types/ui/search.ts` | modified | Renamed the two `SearchForm` properties to `defense` and `additionalDefense`. |
| `app/utils/search/cardSearchFormFactory.ts` | modified | Initializes the renamed properties. |
| `app/utils/search/cardSearchQuerySchema.ts` | modified | Corrected the UI property keys while preserving `df` and `adf` alias values. |
| `app/utils/search/cardSearchQueryBuilder.ts` | modified | Reads the renamed properties and continues emitting `df` and `adf`. |
| `app/utils/search/cardSearchQueryParser.ts` | modified | Hydrates the renamed properties from `df` and `adf`. |
| `app/components/cards/search/unit/SearchFieldDefence.vue` -> `app/components/cards/search/unit/SearchFieldDefense.vue` | renamed and modified | Renamed the component file and corrected its model bindings. |
| `app/components/cards/search/equipment/SearchFieldAdditionalDefence.vue` -> `app/components/cards/search/equipment/SearchFieldAdditionalDefense.vue` | renamed and modified | Renamed the component file and corrected its model bindings. |
| `app/components/cards/search/layout/SearchFormUnit.vue` | modified | Uses the renamed `SearchFieldDefense` component and path. |
| `app/components/cards/search/layout/SearchFormEquipment.vue` | modified | Uses the renamed `SearchFieldAdditionalDefense` component and path. |
| `app/utils/search/cardSearchQueryBuilder.test.ts` | updated test | Covers the renamed properties and unchanged aliases. |
| `app/utils/search/cardSearchQueryParser.test.ts` | updated test | Verifies `df`/`adf` hydrate `defense`/`additionalDefense`. |
| `app/utils/search/cardSearchFormFactory.test.ts` | added test | Verifies both renamed fields receive independent numeric conditions. |

## Diff Highlights

The internal form names now align with the authoritative logical property names while transport compatibility remains unchanged:

```ts
defense: createNumericCondition(),
additionalDefense: createNumericCondition(),

putComparison('df', form.defense)
putComparison('adf', form.additionalDefense)
```

## Tests Added or Updated

- `app/utils/search/cardSearchFormFactory.test.ts` - verifies `defense` and `additionalDefense` defaults and object independence.
- `app/utils/search/cardSearchQueryBuilder.test.ts` - verifies the renamed properties still serialize to `df` and `adf`.
- `app/utils/search/cardSearchQueryParser.test.ts` - verifies `df` and `adf` parse into the renamed properties.
- `app/utils/search/cardSearchQueryRouter.test.ts` - existing round-trip regression was rerun to confirm the URL contract remains stable.

## Local Verification

- Commands run: `node_modules/.bin/vitest.cmd run --environment node --reporter verbose --maxWorkers 1 app/utils/search/cardSearchFormFactory.test.ts app/utils/search/cardSearchQueryBuilder.test.ts app/utils/search/cardSearchQueryParser.test.ts app/utils/search/cardSearchQueryRouter.test.ts` -> passed, 4 test files and 11 tests.
- Commands run: `node_modules/.bin/vue-tsc.cmd --noEmit -p .nuxt/tsconfig.json` -> passed with no diagnostics.
- Commands run: `rg -ni --hidden --glob '!.git/**' --glob '!specs/**' --glob '!.specify/bugs/**' 'defence' .` -> no active-code or non-historical-documentation matches.
- Commands run: `rg` scan for old component names and paths -> no matches outside historical feature artifacts and the bug records.
- Commands run: `git diff --check` -> passed.
- Attempted: focused ESLint on every changed source and test file -> no result; the Nuxt-aware ESLint configuration hung both inside and outside the sandbox and was terminated without diagnostics.
- Environment note: the normal `npm test` entry point could not start because the local Volta npm installation is missing `npm-prefix.js`; the repository-local Vitest binary was used successfully instead.
- Test warning: Vitest reported the pre-existing Nuxt/Vuetify `useLayout` auto-import collision warning; it did not affect the test result and is unrelated to this fix.

## Deviations from Assessment

None. The implementation follows the preferred remediation and the user-approved component renames. Historical feature artifacts under `specs/001-query-builder/` and `specs/002-query-builder/` were left unchanged as historical records, as anticipated by the assessment.

## Follow-ups

- Rerun the project ESLint command after the Nuxt-aware lint process hang and local Volta/npm installation are repaired.
- Optionally update historical feature documentation if project policy requires past specifications to reflect later naming corrections.
