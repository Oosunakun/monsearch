# Implementation Plan: カードセット収録カード検索

**Branch**: `008-open-card-set-results` | **Date**: 2026-09-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-open-card-set-results/spec.md`

## Summary

`/` と `/restrictions` で共用するカードセット一覧のカードセット名だけを選択可能にし、一覧項目が保持する検索用の一意なカードセット値を [Query Specification](../../docs/architecture/query_specification.md) の canonical product collection alias `pd` へ変換して `/cards` を開く。一覧表示用の名称や現行 row `id` から検索値を推測せず、許可済み product 値だけを受け付ける pure TypeScript builder と Vue Router location を用いる。両画面および desktop/mobile で同じ navigation contract を共有し、URL Query を Source of Truth として既存 parser から reload・bookmark・新しい tab・共有後の条件を復元する。行・備考・発売日は遷移対象にせず、Feature 固有 state、既存のカード検索 query parser、結果判定、表示規則は変更しない。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4、Vue 3、Vue Router 5、Vuetify 3、`docs/architecture/query_specification.md`、既存 `buildCardSearchQuery` / `parseCardSearchQuery`

**Storage**: N/A。検索条件の Source of Truth と永続表現は `/cards` URL Query。reload・bookmark・新しい tab・共有後は既存 parser が URL Query から復元する。Feature 固有 state は追加しない

**Testing**: Vitest 4、Vue Test Utils / Nuxt Test Utils。pure builder の table-driven Unit Test、共通 component と `/`・`/restrictions` の navigation boundary test、URL Query の再読込・新規閲覧状態での parser restoration test

**Target Platform**: Cloudflare Pages Nitro preset で配信する SSR 対応 Web application、evergreen browsers

**Project Type**: Nuxt Web application

**Performance Goals**: カードセット名選択から検索結果を確認可能になるまで通常環境の p95 で1秒以内。query 構築は O(1)

**Constraints**: Query Specification の canonical `products` alias `pd` 以外の検索条件を付与しない、一意な検索値で同名セットを区別する、無効値では遷移しない、両画面と desktop/mobile で同一 contract を使う、URL Query 以外の Feature 固有 state を持たない、UTF-8/特殊文字の URL encoding は Vue Router に委譲する、`any` を使わない、既存検索 semantics と一覧表示を維持する

**Scale/Scope**: `ProductTable` の既存利用箇所である `/` と `/restrictions`、それぞれの静的一覧データ、共通の単一 product condition location builder、行 component の desktop/mobile 選択 UI、既存 `/cards` parser への復元境界、focused tests。検索 engine・検索結果 UI・詳細検索・一覧の絞り込みや並べ替えは対象外

## Constitution Check

*GATE: Phase 0 前に通過し、Phase 1 設計後に再確認済み。*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | 一覧 row、product 値、location output を strict TypeScript で表し `any` を使わない | PASS: 明示的な `searchValue` と typed pure builder を設計する |
| II. Testability | 新規 query/location logic と選択境界を独立して検証する | PASS: pure builder の Unit Test と row/table navigation test を設計する |
| III. Incremental Change | カードセット一覧からの遷移に必要な最小範囲に限定する | PASS: 一覧 data/component と専用 utility/test のみを対象とする |
| IV. Existing Architecture | 既存 Query Specification、search option、page/component/utility 配置を尊重する | PASS: `docs/architecture/query_specification.md` を Source of Truth とし、canonical `pd`、`PRODUCT_VALUES`、既存 builder/parser、`/cards` route を再利用する |
| V. Human Review | 重要判断を Plan と contract に記録する | PASS: row `id` と検索値の分離、無効値時の非遷移を明文化する |
| Additional Constraints | Spec Kit Core と brownfield 調査を用いる | PASS: 既存コード、仕様、テスト構成を確認して計画した |

**Post-design re-check**: PASS。data model、UI/navigation contract、quickstart は strict type、pure test boundary、Source of Truth である Query Specification と既存 builder/parser の再利用、`/`・`/restrictions` と desktop/mobile の同一 contract、URL Query による復元、最小変更を維持する。憲章上の例外はない。

## Project Structure

### Documentation (this feature)

```text
specs/008-open-card-set-results/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- card-set-navigation.md
`-- tasks.md                 # $speckit-tasks で後続生成
```

### Source Code (repository root)

```text
app/
|-- components/products/
|   |-- ProductTable.vue
|   |-- ProductTableRow.vue
|   `-- *.test.ts
|-- pages/
|   |-- index.vue
|   `-- restrictions/index.vue
|-- utils/
|   |-- mockData/
|   |   |-- indexPage.ts
|   |   `-- restrictions.ts
|   `-- search/
|       |-- cardSearchQueryParser.ts
|       |-- productSearchLocation.ts
|       `-- productSearchLocation.test.ts
`-- utils/constants/search/
    |-- items/productItems.json
    `-- options/product.ts
docs/architecture/
`-- query_specification.md
```

**Structure Decision**: 単一 Nuxt application を維持する。`/` と `/restrictions` は row ごとに表示用 `id` と required の検索用 `searchValue` を共通 `ProductTable` へ渡し、既存 component 責務に沿ってカードセット名セルだけを link/action とする。入力検証と `{ path: '/cards', query: { pd } }` の構築は framework UI から分離して `app/utils/search/` の pure utility に置き、Query Specification と既存 product option の値集合を再利用する。URL Query を唯一の durable state とし、既存 `parseCardSearchQuery` が `SearchForm.products` を復元する。focused tests は対象実装へ colocate する。

## Complexity Tracking

憲章違反はなく、正当化が必要な複雑性はない。
