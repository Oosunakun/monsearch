# Implementation Plan: 検索条件編集

**Branch**: `005-search-condition-edit` | **Date**: 2026-08-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-search-condition-edit/spec.md`

## Summary

検索結果画面の「条件を編集」から、現在の論理クエリを保持して既存の詳細検索画面へ移動し、既存の防御的な `parseCardSearchQuery` で `SearchForm` を初期化する。編集後は既存の `buildCardSearchQuery` によって再び canonical query を生成するため、有効な条件の意味を保った往復、既定値への回復、未知・不正・不完全な値の安全な無視、およびカテゴリ非適用条件の除外を既存仕様のまま実現する。

## Technical Context

**Language/Version**: TypeScript strict mode、Vue 3.5、Nuxt 4.4

**Primary Dependencies**: Nuxt 4、Vue 3、Vue Router 5、Vuetify Nuxt Module、既存の card search query builder/parser

**Storage**: N/A。編集対象の検索状態は URL query に保持する

**Testing**: Vitest 4、Nuxt Test Utils、Vue Test Utils。parser の unit test と結果・検索ページの navigation integration test

**Target Platform**: Cloudflare Pages Nitro preset で配信する SSR 対応 Web application、evergreen browser

**Project Type**: Nuxt Web application

**Performance Goals**: 「条件を編集」選択から入力済みフォームが操作可能になるまで通常環境の p95 で1秒以内。復元処理は query/value 数に対して線形

**Constraints**: `docs/architecture/query_specification.md` の解釈規則を変更しない、URL の再読み込みに対応、入力 query を変更しない、不正値ごとに安全に既定値へ回復、strict typing、`any` 不使用、Unicode と数値ゼロを保持、カテゴリ非適用条件を再検索へ混入させない

**Scale/Scope**: `/cards` と `/cards/search` の2ページ、結果画面の編集 control、既存 `SearchForm` 全項目、既存 parser/builder と focused tests。新規項目・検索 engine・永続保存は対象外

## Constitution Check

*GATE: Phase 0 前に合格し、Phase 1 設計後に再確認済み。*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | `LocationQuery`、`SearchForm`、既存 query 型を使用し `any` を導入しない | PASS: Vue Router と既存変換関数の型付き境界のみを接続する |
| II. Testability | 新規の route 引継ぎと form 初期化を独立して検証する | PASS: 結果ページ・検索ページの focused integration test と parser unit test で検証可能 |
| III. Incremental Change | 編集導線に必要な最小範囲に限定する | PASS: 既存 builder/parser を変更せず、2ページと control の接続を中心とする |
| IV. Existing Architecture | 既存の page、composable、search utility の責務を維持する | PASS: route 操作は page/control、解釈は parser、送信は builder の既存配置を維持する |
| V. Human Review | 検索条件の意味を変更せず、設計判断を成果物へ記録する | PASS: approved query specification を唯一の意味論とし、契約に遷移を明記する |
| Additional Constraints | Spec Kit Core と brownfield 調査を使用する | PASS: 現行コード、既存 feature 002 成果物、constitution を調査した |

**Post-design re-check**: PASS。data model、UI contract、quickstart は既存 query contract を再利用し、追加の永続状態や変換層を導入しない。Constitution の例外はない。

## Project Structure

### Documentation (this feature)

```text
specs/005-search-condition-edit/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- search-condition-edit.md
`-- tasks.md                 # $speckit-tasks で後続生成
```

### Source Code (repository root)

```text
app/
|-- components/cards/result/controls/
|   `-- ResultControls.vue
|-- pages/cards/
|   |-- index.vue
|   |-- index.test.ts
|   |-- search.vue
|   `-- search.test.ts
|-- composables/
|   `-- useCardSearchForm.ts
`-- utils/search/
    |-- cardSearchFormFactory.ts
    |-- cardSearchQueryBuilder.ts
    |-- cardSearchQueryParser.ts
    `-- cardSearchQueryParser.test.ts
```

**Structure Decision**: 単一の Nuxt application 構成を維持する。結果ページは現在の route query を編集 control へ渡し、control は `/cards/search` への location を作る。検索ページは route query を既存 parser に渡して composable 所有の form を初期化する。query の検証・default 化・canonicalization は既存 search utility 以外へ重複実装しない。

## Complexity Tracking

Constitution 違反はなく、正当化が必要な複雑性はない。
