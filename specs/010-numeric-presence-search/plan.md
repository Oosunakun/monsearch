# Implementation Plan: 数値能力 Modifier 整合

**Branch**: `010-numeric-presence-search` | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

## Summary

既存の `filterType: all | include | exclude` を維持し、`initiative` / `additionalInitiative` に `itm` / `aitm` Modifier を追加する。既存の Charge、Defender、Hero Point、および追加能力の Modifier の Domain semantics を Query Data Specification 1.1.0 に整合させる。新しい `presence` モデルや全数値能力向け Alias は導入しない。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4, Vue Router 5, Vuetify

**Storage**: N/A。検索状態はカード一覧 URL Query

**Testing**: Vitest 4、Nuxt Test Utils、Vue Test Utils、既存 server search tests

**Constraints**: 既存 Modifier 設計の維持、`0` と NULL の区別、有限数の比較、Modifier 単独、exclude 時の Comparison 非適用、Builder/Parser の canonicalization、カテゴリ適用性、strict typing

**Scope**: Query Object/UI type、default/reset、Builder/Parser、Initiative UI、Additional Initiative UI、Hero Point/Level UI semantics、server search、関連テスト、正式 Architecture Specification と 002/005 の必要な整合更新

**Out of Scope**: 新しい `presence` 型、`...p` Alias、対象外数値への Modifier、新しい能力、Schema migration、コスト検索

## Constitution Check

| 原則 | ゲート | 判定 |
|---|---|---|
| I. Type Safety | 既存の typed condition と明示 Alias を使用し、`any` を追加しない | PASS |
| II. Testability | Builder、Parser、UI、server matcher を独立した代表ケースで検証する | PASS |
| III. Incremental Change | Initiative Modifier 追加と既存 Modifier semantics の整合に限定する | PASS |
| IV. Existing Architecture | 既存の form → query → API → matcher の責務を維持する | PASS |
| V. Human Review | 正式 Specification の Alias と Domain semantics を同時に改訂対象とする | PASS |

## Design Decisions

- `NumericCondition` / `FilteredNumericCondition` に `presence` を追加しない。
- `initiative` / `additionalInitiative` は既存 `FilteredNumericCondition` と同じ `filterType` 構造へ揃える。
- 新規 Alias は `itm` と `aitm` のみ。
- `all` は Modifier を省略し、`include` / `exclude` は保持する。
- Parser は `exclude + Comparison` を Form に保持してよい。Builder と検索評価では Comparison を使用しない。
- Level は `is_instant_summon` と Level Comparison を独立評価する例外。
- Hero Point の Modifier は `is_hero` を参照し、`exclude` 時の Hero Point Comparison は使用しない。

## Artifacts

- [research.md](research.md): 既存実装調査と Decision
- [data-model.md](data-model.md): 既存 condition、Modifier semantics、Alias mapping
- [contracts/numeric-presence-query.md](contracts/numeric-presence-query.md): Builder/Parser/UI/Search 契約
- [quickstart.md](quickstart.md): 代表検証シナリオ

## Project Structure

対象は既存の単一 Nuxt アプリケーションと正式 Architecture 文書である。

- `app/types/ui/search.ts`
- `app/utils/search/cardSearchFormFactory.ts`
- `app/utils/search/cardSearchChanged.ts`
- `app/utils/search/cardSearchQuerySchema.ts`
- `app/utils/search/cardSearchQueryBuilder.ts`
- `app/utils/search/cardSearchQueryParser.ts`
- `app/components/cards/search/unit/SearchFieldInitiative.vue`
- `app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue`
- `app/components/cards/search/shared/SearchFilterWithOperator.vue`
- `server/utils/cardSearch/search.ts`
- `types/cards/finderCards.ts`（Ability 数値型の NULL 表現が必要か確認し、必要な場合の変更候補）
- `server/utils/cardSearch/project.ts`、`server/types/cardSearch.ts`、関連表示 component（nullable 値の projection / API response / 表示への伝播確認と、必要な場合の変更候補）
- `docs/architecture/query_specification.md`
- `docs/architecture/query_data_specification.md`
- `docs/architecture/query_data_specification_revision_candidates.md`
- 必要範囲の `specs/002-query-builder` / `specs/005-search-condition-edit`

## NULL / 0 data-flow confirmation

実装時に、`types/cards/finderCards.ts` の Ability 数値型、mock/実データの NULL 表現、`server/utils/cardSearch/project.ts` 等の projection、API response 型、結果表示の値処理を確認する。Query Data Specification 1.1.0 の「NULLは値なし、0は実数値」を成立させるために必要な場合に限り、これらを変更候補とする。現時点では変更必須とは断定しない。

Schema migration は引き続き本 Feature の対象外である。

## Complexity Tracking

新しいデータモデルや外部依存は追加しない。
