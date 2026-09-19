# Implementation Plan: バックエンドによるカード検索

**Branch**: `009-backend-card-search` | **Date**: 2026-09-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-backend-card-search/spec.md`

## Summary

既存Query Specificationの検索aliasを受け取る `GET /api/cards` をNuxt/Nitroへ追加し、既存cards JSONをServer側で検索、sort、paginationする。Browserは全cards JSONの直接importとBrowser内検索をAPI取得へ置き換える。APIは未知・不正な検索parameterをGraceful Parsingで無視し、現在の結果画面に必要な明示的公開projection、件数、category内訳、page・sort情報だけを返す。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4 / Nitro

**Primary Dependencies**: Nuxt 4、Vue 3、Vue Router 5、Nitro/h3 built-ins、既存query parser/schemaおよび`FinderCards`型。新規runtime dependencyなし

**Storage**: `app/utils/mockData/items/cards.json` をServer側でread-onlyに読み込むbundled JSON。DB、D1、SQLiteは対象外

**Testing**: Vitest 4のtable-driven unit test、Nitro handler integration/contract test、Nuxt Test Utils / Vue Test Utilsによるcomposable/page test

**Target Platform**: Cloudflare Pages Nitro presetで配備するSSR対応Web application、evergreen browsers

**Project Type**: 単一Nuxt web application（frontend + Nitro server API）

**Performance Goals**: 定量latency、dataset規模、concurrency目標は今回設定しない。現在のcards JSONで通常のunit/integration testと主要API/UI動作確認が完了すること

**Constraints**: Query Specification 1.1.0のalias・意味・Graceful Parsing、既存Browser検索との結果parity、`any`不使用、入力を変更しない検索、0を有効値として保持、UTF-8、Server-side sort/pagination、明示的な最小公開projection、`HTTP 500 / CARD_SEARCH_FAILED`へのfailure一本化、Browser bundleから全cards JSON依存を除去

**Scale/Scope**: 既存の全検索条件、結果一覧page、Nitro endpoint 1件、検索domain、API取得state、現在のbundled dataset。DB、認証、履歴、新規検索項目、詳細API、performance/load/usability試験は対象外

## Constitution Check

*GATE: Phase 0前に合格し、Phase 1後に再確認済み。*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | request、result projection、error、検索domainをstrict TypeScriptで定義し`any`を使わない | PASS: 既存query型とcard型から境界型を明示する |
| II. Testability | 検索、sort、pagination、projection、取得stateを独立検証可能にする | PASS: 純粋関数とHTTP/UI境界を分け、代表parity casesを自動検証する |
| III. Incremental Change | API移行に必要な範囲だけを変更する | PASS: endpoint、server検索module、API型、取得composable、cards pageとfocused testsに限定する |
| IV. Existing Architecture | Nuxt構成、既存Query Specification、型、画面componentを尊重する | PASS: `server/api` / `server/utils`、既存query utilities、Result componentsを使用する |
| V. Human Review | 重要な契約判断を成果物へ記録する | PASS: endpoint、Graceful Parsing、JSON data source、Server-side sort/pagination、projection、単一errorをcontract/researchへ明記する |
| Additional Constraints | Spec Kit Coreとbrownfield investigationを前提にする | PASS: Query Specification、両009成果物、現行page/result components/data型を調査した |

**Post-design re-check**: PASS。data model、OpenAPI contract、quickstartは上記gateを維持し、憲章上の例外はない。

## Project Structure

### Documentation (this feature)

```text
specs/009-backend-card-search/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- card-search-api.openapi.yaml
`-- tasks.md                 # $speckit-tasksで後続生成（今回は生成しない）
```

### Source Code (repository root)

```text
server/
|-- api/
|   `-- cards.get.ts
|-- types/
|   `-- cardSearch.ts
`-- utils/cardSearch/
    |-- dataSource.ts
    |-- search.ts
    |-- sort.ts
    |-- paginate.ts
    |-- project.ts
    `-- *.test.ts
app/
|-- composables/
|   `-- useCardSearch.ts
|-- pages/cards/
|   |-- index.vue
|   `-- index.test.ts
`-- utils/search/
    |-- cardSearchQueryParser.ts
    |-- cardSearchQuerySchema.ts
    `-- cardSearchMatcher.ts
types/
`-- cards/finderCards.ts
```

**Structure Decision**: 単一Nuxt applicationを維持する。HTTPとcards JSON accessは`server/`、副作用のない検索・sort・pagination・projectionはserver search module、Browserのloading/success/error/retryはcomposable、表示は既存page/componentに置く。Query Specificationのparser/schemaと既存Browser検索oracleはparityのsourceとして再利用する。将来のDB repository抽象化は今回作らず、data source交換が必要になる後続featureで設計する。

## Complexity Tracking

憲章違反はなく、正当化が必要な追加complexityはない。latest-request-wins専用state machine、厳格な入力error taxonomy、DB abstraction、performance benchmarkは現要件に必要ないため導入しない。
