# Implementation Plan: Quick Search URL Query Builder

**Branch**: `006-quick-search-url-query-builder` | **Date**: 2026-08-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-quick-search-url-query-builder/spec.md`

## Summary

header と navigation drawer が共通利用する `QuickSearchBar.vue` の `QuickSearchState` を、承認済み URL query 語彙に従う単一の canonical text condition（`nm`、`att`、`kw`）へ変換する。QuickSearch 専用 builder と既存の SearchForm 用 builder は各入力形式の変換責務を分離したまま、共通の Logical URL Query 表現を出力する。これにより、今後 `/cards` 側は URL query のみを読み取り、入力元に依存せず検索を処理できる。QuickSearch の変換は immutable な pure TypeScript utility として `app/utils/search/` に配置し、`useQuickSearch` は生成された logical query を Vue Router に渡して `/cards` へ遷移する。空白入力、未対応 target、card pool 値は query から除外し、Vitest の table-driven unit tests と routing boundary test で保証する。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4、Vue 3、Vue Router 5。URL percent-encoding は Vue Router に委譲する

**Storage**: N/A。検索条件の永続表現は `/cards` の URL query

**Testing**: Vitest 4 の table-driven unit tests、Nuxt Test Utils による composable/routing boundary test、Vue Router memory history の round-trip test

**Target Platform**: Cloudflare Pages Nitro preset で配備する SSR 対応 web application、evergreen browsers

**Project Type**: Nuxt web application

**Performance Goals**: 通常環境における submit から `/cards` navigation 開始まで 1 秒以内（p95）。変換は固定個数 field に対して O(1)

**Constraints**: deterministic な単一 condition、入力 state の非破壊、TypeScript strict mode と `any` 禁止、Unicode と予約記号の round trip、`docs/architecture/query_specification.md` version 1.0.0 準拠、未承認 parameter の除外

**Scale/Scope**: header と navigation drawer が共通利用する `QuickSearchBar.vue`、既存 quick-search state、3 search targets、QuickSearch 専用 query builder utility、`useQuickSearch` navigation、共通 logical query vocabulary、focused tests。カード検索 engine、詳細検索 form への archetype field 追加、既存 `buildCardSearchQuery` への統合、UI redesign は対象外

## Constitution Check

*GATE: Phase 0 前に PASS。Phase 1 設計後に再確認済み。*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | target と query alias を literal union で表し、strict TypeScript と `Readonly` input を使い `any` を導入しない | PASS: `QuickSearchTarget` と logical query output を明示的に型付けする設計 |
| II. Testability | 新規変換 logic を routing から分離し Unit Test を追加する | PASS: pure builder と routing boundary を独立して検証可能 |
| III. Incremental Change | quick search の変換・navigation と共通 query vocabulary の最小変更に限定する | PASS: UI redesign、検索 engine、詳細検索 form の変更を含めない |
| IV. Existing Architecture | search utility、UI type、composable という既存責務分割に合わせる | PASS: `app/utils/search/`、`app/types/ui/`、`app/composables/` の現行配置を維持 |
| V. Human Review | approved Query Specification と feature spec にない判断を追加しない | PASS: `nm`、`att`、`kw` と omission rules は承認済み artifact に由来 |
| Additional Constraints | Spec Kit Core と brownfield repository 調査を用いる | PASS: 現行 source、tests、Query Specification を調査して計画した |

**Post-design re-check**: PASS。data model、contract、quickstart は strict typing、pure transformation、既存 Nuxt 構成、最小変更を維持する。Constitution 上の例外はない。

`att` は approved Query Specification に存在するが、現行 detailed-search `SearchForm` には対応 field がない。本 feature では quick-search builder と共通 logical query vocabulary だけが `att` を扱い、詳細検索 form/parser に新しい field を推測追加しない。

## Project Structure

### Documentation (this feature)

```text
specs/006-quick-search-url-query-builder/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- quick-search-query.md
`-- tasks.md                 # $speckit-tasks で後続生成
```

### Source Code (repository root)

```text
app/
|-- components/layout/
|   `-- QuickSearchBar.vue
|-- types/ui/
|   |-- layout.ts
|   `-- search.ts
|-- utils/search/
|   |-- cardSearchQuerySchema.ts
|   |-- quickSearchQueryBuilder.ts
|   |-- quickSearchQueryBuilder.test.ts
|   `-- quickSearchQueryRouter.test.ts
`-- composables/
    |-- useQuickSearch.ts
    `-- useQuickSearch.test.ts

docs/architecture/
`-- query_specification.md
```

**Structure Decision**: 単一 Nuxt application を維持する。対象 UI は `AppHeader.vue` と `AppNavigationDrawer.vue` が共通利用する既存 `QuickSearchBar.vue` とする。quick-search UI state と target literal type は既存 `layout.ts`、承認済み query alias の共通型・schema は既存 search query 定義、framework 非依存の QuickSearch 変換は `app/utils/search/`、Vue Router navigation は `useQuickSearch` に置く。QuickSearch 専用 builder と SearchForm 用 `buildCardSearchQuery` は統合せず、異なる入力を同じ Logical URL Query 表現へ変換する独立した adapter として維持する。focused tests は対象実装へ colocate する。

## Complexity Tracking

Constitution 違反はなく、正当化を要する追加 complexity はない。
