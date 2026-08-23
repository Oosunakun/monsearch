# Bug Assessment: Defense field naming mismatch

- **Slug**: defense-field-name
- **Created**: 2026-08-23
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: low

## Report (verbatim or summarized)

> Bug summary:  
> The application uses the property name `defence`, while the database schema uses `defense`.
>
> Expected behavior:  
> The application should consistently use `defense` to match the database schema.
>
> Actual behavior:  
> The application still uses `defence`, resulting in inconsistent naming between the application and the database.

## Symptom

The detailed-search UI model and its consumers use British-spelled `defence` and `additionalDefence`, while database-shaped card data and the authoritative query specification use `defense` and `additionalDefense`. Query serialization still works through the stable `df` and `adf` aliases, but the internal application naming is inconsistent with the data model.

## Reproduction

1. Inspect `app/types/ui/search.ts` and observe `CardSearchForm.defence` and `CardSearchForm.additionalDefence`.
2. Trace those properties through the form factory, Vue search fields, query builder, query parser, and query tests; each uses the British spelling.
3. Compare them with `types/cards/finderCards.ts`, database-shaped mock card records, and `docs/architecture/query_specification.md`; these use `defense` and `additionalDefense`.

No runtime failure was supplied or established. The reproduced defect is the inconsistent application-level property naming.

## Suspected Code Paths

- `app/types/ui/search.ts:59` — declares the UI model property as `defence`.
- `app/types/ui/search.ts:73` — declares the related equipment property as `additionalDefence`.
- `app/utils/search/cardSearchFormFactory.ts:70` — initializes `defence` on new search forms.
- `app/utils/search/cardSearchFormFactory.ts:84` — initializes `additionalDefence`.
- `app/components/cards/search/unit/SearchFieldDefence.vue:20` — reads, resets, and binds the `defence` property.
- `app/components/cards/search/equipment/SearchFieldAdditionalDefence.vue:20` — reads, resets, and binds `additionalDefence`.
- `app/utils/search/cardSearchQueryBuilder.ts:53` — serializes `form.defence` to the stable `df` query alias.
- `app/utils/search/cardSearchQueryBuilder.ts:60` — serializes `form.additionalDefence` to `adf`.
- `app/utils/search/cardSearchQueryParser.ts:51` — parses `df` into `form.defence`.
- `app/utils/search/cardSearchQueryParser.ts:56` — parses `adf` into `form.additionalDefence`.
- `app/utils/search/cardSearchQuerySchema.ts:30` — contains an explicit spelling adapter for both UI properties.
- `app/utils/search/cardSearchQueryBuilder.test.ts:15` — tests the current British-spelled properties.
- `types/cards/finderCards.ts:179` — representative application card-data type using `defense`.
- `docs/architecture/query_specification.md:472` — authoritative query mapping names the logical property `defense` and maps it to `df`.
- `docs/architecture/query_specification.md:486` — names the related logical property `additionalDefense` and maps it to `adf`.

## Root Cause Hypothesis

**Confidence: high.** The detailed-search form was modeled with British spelling and later connected to the established query vocabulary through explicit adapters instead of aligning its property names. The feature design artifacts document this as a deliberate compatibility choice, which allowed the inconsistency to persist even though database-shaped types, mock records, and the query specification already use American spelling.

## Proposed Remediation

**Preferred**: Rename the detailed-search model properties `defence` to `defense` and `additionalDefence` to `additionalDefense`, then update every typed consumer, form initializer, Vue binding, query builder/parser reference, and test fixture. Preserve the external query aliases `df` and `adf`; they are transport vocabulary and do not need to change. Remove or update `UI_TO_QUERY_ALIAS` if the spelling-only adapter becomes unused, after verifying all of its consumers.

Consider renaming the two Vue component filenames and corresponding imports (`SearchFieldDefence.vue` and `SearchFieldAdditionalDefence.vue`) for complete application consistency. This is a code organization change rather than a data migration.

**Alternative**:

- Keep the current UI properties and formalize the adapter boundary. This avoids internal churn but does not satisfy the expected behavior of consistently using `defense`.

**Files likely to change**:

- `app/types/ui/search.ts`
- `app/utils/search/cardSearchFormFactory.ts`
- `app/utils/search/cardSearchQuerySchema.ts`
- `app/utils/search/cardSearchQueryBuilder.ts`
- `app/utils/search/cardSearchQueryParser.ts`
- `app/utils/search/cardSearchQueryBuilder.test.ts`
- `app/components/cards/search/unit/SearchFieldDefence.vue`
- `app/components/cards/search/equipment/SearchFieldAdditionalDefence.vue`
- `app/components/cards/search/layout/SearchFormUnit.vue`
- `app/components/cards/search/layout/SearchFormEquipment.vue`

**Tests to add or update**:

- Update query-builder coverage to populate `defense` and `additionalDefense` and assert that they still serialize as `df` and `adf`.
- Add or update parser coverage to assert that `df` and `adf` hydrate `defense` and `additionalDefense`.
- Add a form-factory assertion that the renamed fields are initialized with numeric conditions.
- Run a source-level check for remaining identifier/file-name uses of `defence` or `Defence`, excluding historical feature artifacts if those are intentionally immutable.

## Risks & Considerations

- Renaming typed properties is an internal breaking change for every component or utility that consumes `CardSearchForm`; all references must move atomically.
- Persisted client-side form objects, if any exist outside the inspected paths, could retain the old keys and require a compatibility read or one-time migration.
- The public URL/query contract must remain `df` and `adf`; changing those aliases would break bookmarked or shared searches.
- `additionalDefence` has the same inconsistency and should be included to prevent a partial fix.
- Historical files under `specs/001-query-builder/` and `specs/002-query-builder/` describe the previous decision. Whether to revise historical artifacts is a documentation-policy choice, not required for the source fix.
- Component filenames use `Defence`; leaving them unchanged would preserve a naming inconsistency even after the property rename, but renaming case-sensitive paths should be handled carefully across platforms.

## Open Questions

- [NEEDS CLARIFICATION: Is any search-form state persisted outside the URL query string (for example in local storage, a store plugin, or saved user preferences) and therefore in need of backward-compatible handling for `defence`/`additionalDefence`?]
- [NEEDS CLARIFICATION: Should the component filenames be renamed to `SearchFieldDefense.vue` and `SearchFieldAdditionalDefense.vue`, or is the requested scope limited to property identifiers?]
