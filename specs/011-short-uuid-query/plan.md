# Implementation Plan: Short UUID検索条件の形式判定

**Branch**: `011-short-uuid-query` | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-short-uuid-query/spec.md`

## Summary

Short UUID対象Parameterの形式判定をmaster data／選択肢集合から分離し、UUIDv7末尾5桁のASCII hexadecimalを大文字小文字非区別で受理する。Parserは形式上有効な未知値も保持し、Builderは小文字へcanonical化する。桁数は検索アプリ内の単一定義から参照し、既存の後方一致検索と他Parameterの意味論は維持する。関連するMock/Parameterデータと往復・検索テストを新仕様へ更新する。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4, Vue Router 5, Vitest 4

**Storage**: N/A; search state is transported in URL Query and evaluated against existing mock card data

**Testing**: Vitest 4; existing utility, server search, router, and page tests

**Target Platform**: SSR-capable Nuxt web application and its server API on Cloudflare Pages Nitro

**Project Type**: Nuxt web application with server-side card search

**Performance Goals**: Preserve linear collection normalization and existing search response behavior; no new master-data scan is required for URL parsing

**Constraints**: 5 ASCII hexadecimal characters exactly; lowercase canonical output; valid-but-unknown values survive round trips and produce no matches; no collision detection/resolution; no `any`; non-Short-UUID semantics unchanged

**Scale/Scope**: Eight aliases (`ct`, `pd`, `fa`, `ra`, `il`, `eat`, `re`, `are`), shared query schema/parser/builder, search evaluation, Mock/Parameter fixtures, and focused regression tests

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | Strict TypeScript, explicit alias/validator types, no `any` | PASS |
| II. Testability | Pure format normalization and parser/builder tests plus search behavior tests | PASS |
| III. Incremental Change | Limit changes to query utilities, relevant data, search tests, and affected fixtures | PASS |
| IV. Existing Architecture | Keep schema/constants in `app/utils`, form types in `app/types/ui`, search behavior in `server/utils/cardSearch` | PASS |
| V. Human Review | Canonicalization, unknown-value semantics, and collision responsibility are explicit in the contract | PASS |
| Additional Constraints | Brownfield investigation and Spec Kit Core workflow used | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/011-short-uuid-query/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/card-search-query.md
`-- tasks.md                 # generated later by $speckit-tasks
```

### Source Code (repository root)

```text
app/
|-- types/ui/search.ts
|-- utils/constants/search/items/*.json
`-- utils/search/
    |-- cardSearchQuerySchema.ts
    |-- cardSearchQueryParser.ts
    |-- cardSearchQueryBuilder.ts
    `-- *.test.ts
server/utils/cardSearch/
|-- search.ts
`-- search.test.ts
app/utils/mockData/
`-- indexPage.ts, restrictions.ts
```

**Structure Decision**: 既存のNuxt単一アプリ構成を維持する。Short UUIDの正規化・対象Parameter一覧・桁数定義は検索Queryユーティリティ周辺に置き、Parser/BuilderとMock/Parameterデータが同じ定義を参照できるようにする。検索本体は既存のcase-insensitive後方一致を利用し、検索意味論の不要な変更を避ける。URL契約は `contracts/card-search-query.md` に記録する。

## Complexity Tracking

No constitution violations require justification.

**Post-design re-check**: PASS. Research resolved the only data-format uncertainty from the feature input (fixed length = 5). The design keeps validation independent from master-data membership, centralizes the length constant, and leaves non-target query semantics unchanged.
