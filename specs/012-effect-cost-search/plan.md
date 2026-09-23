# Implementation Plan: 効果コスト検索

**Branch**: `012-effect-cost-search` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-effect-cost-search/spec.md`

## Summary

既存の詳細検索フォームとQuery Builder/Parserには`cis/cism`、`css/cssm`、`coe/coem`が実装済みだが、検索評価側はこれらを利用していない。事前に構造化・人手レビュー済みのカードJSON内`search_cost`を型付けし、同一Effect内の同一許可選択肢で各コスト条件を評価する。既存の検索パイプライン、URL仕様、UIを維持して結果を絞り込む。QDS §7.5の構造化・検証の公開前提はFeature開始前のデータ整備で満たされているため、新しいruntime publication controlは追加しない。

## Technical Context

**Language/Version**: TypeScript strict mode; Vue 3.5; Nuxt 4.4

**Primary Dependencies**: Nuxt 4、Vue 3、Vue Router 5、Vitest 4

**Storage**: Repositoryのカード検索JSON（`app/utils/mockData/items/cards.json`）。DB Schema上の`effect_costs.effect_cost_text`は原文であり、検索は構造化済み`Effect.search_cost`を根拠とする。

**Testing**: Vitest。search matcherのtable-driven unit test、既存のSearchForm/URL parser-builder回帰確認、検索API経路の統合確認。

**Target Platform**: SSR対応Nuxt Web application、Cloudflare Pages Nitro preset、evergreen browsers

**Project Type**: Nuxt web application

**Performance Goals**: 既存のカード絞り込み処理内でlinear scanを維持し、コスト条件なしの検索に実質的な追加処理を発生させない。

**Constraints**: QDS 1.1.0とQuery Specification 1.1.0を意味・URLの正とする。strict typing、入力不変、既存のEffect単位判定、Pair値/Modifierのcanonicalizationを維持する。原文部分一致や説明文数字の推測は禁止。null/未構造化/解析不能を区別する。Spell `value: "any"`は内部Projection専用でURL Pair valueにしない。rangeと共有capacityはQDSに従い同じcapacityを二重充当しない。

**Scale/Scope**: 詳細検索フォームからURL復元、検索APIのカード検索ロジック、既存JSON内の`search_cost`、および焦点を絞ったテスト。新しいコスト分類・URL alias・原文解析方式は追加しない。

## Constitution Check

*GATE: Phase 0前とPhase 1後に確認。*

| Principle | Gate | Result |
|---|---|---|
| I. Type Safety | strict TypeScript、既存型利用、`any`なし | PASS: `search_cost`と条件値を明示的な型で扱う設計 |
| II. Testability | 新規ロジックを独立して検証 | PASS: コスト評価をmatcher境界でテーブル駆動検証 |
| III. Incremental Change | Featureに必要な範囲へ限定 | PASS: form/queryが持つ既存条件と検索実装の未接続部分をつなぐ |
| IV. Existing Architecture | Repositoryの責務と配置を尊重 | PASS: SearchForm/utility、server matcher、データ型の既存配置を維持 |
| V. Human Review | 仕様逸脱を独断で行わない | PASS: 既存の承認済みQuery Data/URL Specificationに従う |
| Additional Constraints | Spec Kit Core・brownfield調査 | PASS: 現行ソース、Schema、仕様、ADRを調査 |

**重要な適合条件**: distinctな`effect_cost_text`の人手Mapping、非空textの未Mappingエラー検証、`search_cost`生成、変換後JSONの人手レビュー、およびJSON差分確認はFeature開始前に完了している。これによりQDS §7.5の構造化・検証の公開前提は満たされている。残作業は型付けと検索評価であり、データ完全性の再設計や未提供時runtime controlは本Featureに含めない。

## Project Structure

### Documentation (this feature)

```text
specs/012-effect-cost-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── effect-cost-search.md
└── tasks.md                 # $speckit-tasksで生成
```

### Source Code (repository root)

```text
app/
├── types/ui/search.ts                         # 既存Cost SlotCondition
├── utils/search/cardSearchQueryBuilder.ts      # 既存cis/css/coe出力
├── utils/search/cardSearchQueryParser.ts       # 既存条件復元
└── utils/mockData/items/cards.json             # Effect.search_cost
types/cards/finderCards.ts                       # Effect検索データ型
server/utils/cardSearch/search.ts                # Effect・選択肢単位の条件評価
server/utils/cardSearch/search.test.ts           # matcher検索テスト
docs/architecture/query_data_specification.md   # 意味論の参照元
docs/architecture/query_specification.md        # URL契約の参照元
```

**Structure Decision**: 単一Nuxtアプリを維持する。UI状態とURL変換は既存の`SearchForm`、builder/parserを再利用し、domain検索は`server/utils/cardSearch/search.ts`に実装する。検索データの形は`types/cards/finderCards.ts`で表現し、mock JSONの`search_cost`を直接使う。カード単位や効果原文からコストを再推定する別経路は作らない。

## Complexity Tracking

憲法違反はない。QDS §7.5の公開前提は事前データ整備で満たされている。実装は既存の検索条件と承認済みデータを接続する範囲に限定する。
