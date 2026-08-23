# Bug Verification: Defense field naming mismatch

- **Slug**: defense-field-name
- **Tested**: 2026-08-23
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original naming mismatch no longer reproduces in active code: the search model, form factory, Vue components, query builder/parser, and tests use `defense` and `additionalDefense`. The `df` and `adf` URL aliases remain unchanged and match `docs/architecture/query_specification.md`; no implementation regressions were found in the available card-search tests or Vue/TypeScript check.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Scan active code and non-historical documentation for `defence`; inspect model, form factory, component filenames/imports/bindings, builder, parser, and tests | pass | No old-spelling matches remain outside historical feature artifacts and bug records. New component paths exist and old paths do not. |
| Approved assessment/fix conformance | Compare the working changes with `assessment.md` and `fix.md` | pass | All recorded property, consumer, test, and component renames are present; no unrecorded scope change was found. |
| URL alias contract | Inspect `cardSearchQuerySchema.ts`, builder/parser code, related tests, and `LogicalCardSearchQuery` | pass | `defense` continues to map to `df`; `additionalDefense` continues to map to `adf`. |
| Architecture consistency | Inspect `docs/architecture/query_specification.md:472` and `:486` and compare with implementation | pass | Specification and implementation both define `defense -> df` and `additionalDefense -> adf`. |
| New / updated tests | `node_modules/.bin/vitest.cmd run --environment node --reporter verbose --maxWorkers 1 app/utils/search/cardSearchFormFactory.test.ts app/utils/search/cardSearchQueryBuilder.test.ts app/utils/search/cardSearchQueryParser.test.ts app/utils/search/cardSearchQueryRouter.test.ts` | pass | 4 test files passed; 11 tests passed. This includes the new factory test and updated builder/parser tests. |
| Broader card-search regression | Existing router round-trip test included in the Vitest command above | pass | Query construction, router encoding, parsing, and canonical rebuilding remain stable. |
| Vue / TypeScript validation | `node_modules/.bin/vue-tsc.cmd --noEmit -p .nuxt/tsconfig.json` | pass | Exit code 0 with no diagnostics; renamed Vue paths and bindings type-check. |
| Standard npm entry point | `npm --version` | not-run | Environment issue: Volta cannot load npm because `npm-prefix.js` is missing. Repository-local binaries were used instead. |
| ESLint | Focused changed-file command documented in `fix.md` | not-run | Environment/tooling issue: the Nuxt-aware ESLint process hung both inside and outside the sandbox during fix verification and emitted no diagnostics. This is not evidence of an implementation failure. |

## Output Excerpts

```text
Test Files  4 passed (4)
     Tests  11 passed (11)
  Duration  6.35s
```

```text
app/utils/search/cardSearchQueryBuilder.ts: putComparison('df', form.defense)
app/utils/search/cardSearchQueryBuilder.ts: putComparison('adf', form.additionalDefense)
app/utils/search/cardSearchQueryParser.ts: applyComparison(form.defense, last(query, 'df'))
app/utils/search/cardSearchQueryParser.ts: applyComparison(form.additionalDefense, last(query, 'adf'))
docs/architecture/query_specification.md: |defense|df|Comparison|Comparison|Incomplete Comparison|
docs/architecture/query_specification.md: |additionalDefense|adf|Comparison|Comparison|Incomplete Comparison|
```

```text
PASS: no active-code or non-historical-documentation matches for `defence`.
NEW_UNIT_EXISTS=True
NEW_EQUIPMENT_EXISTS=True
OLD_UNIT_EXISTS=False
OLD_EQUIPMENT_EXISTS=False
```

## Residual Risks

- The standard npm command and ESLint validation remain unavailable because of local tooling issues. Focused tests and Vue/TypeScript validation passed through repository-local executables, so these limitations are classified as environment issues rather than implementation issues.
- Vitest emitted the pre-existing Nuxt/Vuetify `useLayout` auto-import collision warning. It did not fail tests and is unrelated to this bug.
- Historical artifacts under `specs/001-query-builder/` and `specs/002-query-builder/` retain the old spelling as records of the earlier design; active code and authoritative architecture documentation are consistent.
- No browser-level component interaction test was added. The renamed imports and bindings are covered by Vue/TypeScript checking, and the affected query behavior is covered by unit and router tests.

## Recommendation

Close the bug as verified. The original static reproduction no longer finds the inconsistent property or component naming, the stable URL aliases match the authoritative architecture specification, and all critical automated checks pass. Track the Volta/npm and ESLint issues separately as development-environment maintenance.
