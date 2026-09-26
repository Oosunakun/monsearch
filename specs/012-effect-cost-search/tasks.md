---

description: "効果コスト検索の実装タスク"
---

# Tasks: 効果コスト検索

**Input**: Design documents from `/specs/012-effect-cost-search/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/effect-cost-search.md, quickstart.md

**Tests**: ConstitutionのPrinciple IIに従い、新規matcherロジックと既存URL条件の回帰を検証するテストを含む。

**Organization**: タスクは独立して実装・確認できるUser Storyごとに整理する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 他タスクと異なるファイルを変更し、未完了タスクに依存しない
- **[Story]**: 対応するUser Story
- 各タスクに対象ファイルを記載

## Path Conventions

既存Nuxtアプリの構成に従い、検索型は`types/cards/`、検索ロジックとテストは`server/utils/cardSearch/`、Query builder/parserの回帰テストは`app/utils/search/`に配置する。

---

## Phase 1: Setup

**Purpose**: 既存の検索条件、データ、実装境界を利用するための準備

- [X] T001 `types/cards/finderCards.ts`のEffectと`app/utils/mockData/items/cards.json`の`search_cost`構造を照合し、型追加対象を確定する

---

## Phase 2: Foundational

**Purpose**: 全ストーリーが利用する検索用コストデータの型境界を整える

- [X] T002 `types/cards/finderCards.ts`にsearch_cost、alternative、exact/range componentのstrict型を定義し、Effectへnullable/missingを畳み込まない形で追加する

**Checkpoint**: 検索ロジックから既存JSONの検索用コストデータを型安全に参照できる

---

## Phase 3: User Story 1 - 効果コストでカードを検索する (Priority: P1)

**Goal**: Item・Spell・Otherの指定数量を実際に支払える同一Effectのカードに絞り込む。

**Independent Test**: Item・Spell・Other各分類で支払える数量と超過数量のfixtureを照合し、該当カードだけが`matchesCardSearch`を通過することを確認する。

### Tests for User Story 1

- [X] T003 [P] [US1] Item・Spell・Otherの各Pairと数量境界、Effectなし、search_cost不明のfixtureを`server/utils/cardSearch/search.test.ts`に追加する

### Implementation for User Story 1

- [X] T004 [US1] `server/utils/cardSearch/search.ts`にコスト分類・Pair key・exact/range数量を同一Effectの同一alternativeで評価するmatcherを実装する
- [X] T005 [US1] `server/utils/cardSearch/search.ts`の`matchesCardSearch`へcis/css/coe条件を接続し、他のEffect条件と同一Effect上でAND評価する
- [X] T006 [US1] `server/utils/cardSearch/search.test.ts`でItem・Spell・Otherの検索一致、支払数量不足、別Effectへの条件分散が除外されることを確認する

**Checkpoint**: 各コスト種別の条件が既存カード検索結果を正しく絞り込む

---

## Phase 4: User Story 2 - コスト条件を組み合わせて検索する (Priority: P1)

**Goal**: 同一分類内のOR/AND/noneと複数分類の組み合わせをQDSどおりに評価する。

**Independent Test**: 複数Pair、複数alternative、none、確定cost-freeとunknownを含むケースでmatcher結果がQDSの期待値に一致することを確認する。

### Tests for User Story 2

- [X] T007 [P] [US2] OR/AND、複数選択肢、none、Effect不在、null/missing/unknown、has_other_costのfixtureを`server/utils/cardSearch/search.test.ts`に追加する
- [X] T008 [P] [US2] spell:anyのrangeに対するfire/water複数Pairと共有capacityの境界fixtureを`server/utils/cardSearch/search.test.ts`に追加する

### Implementation for User Story 2

- [X] T009 [US2] `server/utils/cardSearch/search.ts`で同一コストParameter内のor/andおよび分類別noneをQDSのEffect単位規則で実装する
- [X] T010 [US2] `server/utils/cardSearch/search.ts`で異なるcost Parameterを同一Effect・同一alternative上でAND結合し、Item/Spell/Otherの資源を別alternative間で合算しない
- [X] T011 [US2] `server/utils/cardSearch/search.ts`でspell:anyのrange capacityをSpell Pairへ割り当て、同一capacityの二重充当を防ぐ
- [X] T012 [US2] `server/utils/cardSearch/search.ts`で確定cost-freeとunknownを区別し、has_other_costをcoe=none判定へ反映する
- [X] T013 [US2] `server/utils/cardSearch/search.test.ts`でOR/AND/none、複数cost class、alternative非集約、spell:any capacity、null/unknown区別の期待結果を確認する

**Checkpoint**: コスト組み合わせ条件が選択可能な実支払いの意味に一致する

---

## Phase 5: User Story 3 - 効果コスト条件をURLで再利用する (Priority: P2)

**Goal**: 詳細検索で既存のcis/css/coe形式を維持し、読み込み・再構築後も条件を再利用できる。

**Independent Test**: Item・Spell・OtherそれぞれのPair CollectionとModifierを既存Parser/Builderで往復し、canonical URL条件を維持することを確認する。

### Tests for User Story 3

- [X] T014 [P] [US3] cis/cism、css/cssm、coe/coemのPairとor/and/noneのbuild canonicalizationを`app/utils/search/cardSearchQueryBuilder.test.ts`で確認する
- [X] T015 [P] [US3] cis/cism、css/cssm、coe/coemのURL parse復元と正負数量・未知key処理を`app/utils/search/cardSearchQueryParser.test.ts`で確認する

### Implementation for User Story 3

- [X] T016 [US3] `app/utils/search/cardSearchQueryBuilder.ts`と`app/utils/search/cardSearchQueryParser.ts`がQuery Specificationのalias、Pair順序、default omissionを満たすか確認し、不足分のみ既存実装へ反映する
- [X] T017 [US3] `server/api/cards.get.test.ts`でURL条件が検索criteriaへ渡り、効果コスト条件によるカード絞り込みがAPI応答に反映されることを確認する

**Checkpoint**: コスト条件をURLから復元して同じ検索結果を再現できる

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstartの主要経路と既存検索の非回帰を確認する

- [X] T018 [P] `specs/012-effect-cost-search/quickstart.md`のItem/Spell/Other、組み合わせ、URL往復の検証観点と実装結果の対応を更新する
- [X] T019 コスト条件なしと既存検索条件との併用が変化しないことを`server/utils/cardSearch/search.test.ts`で回帰確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 即時開始可能
- **Foundational (Phase 2)**: T001のデータ照合後に完了し、ストーリー実装をブロックする
- **User Stories (Phase 3+)**: T002後に開始可能
- **Polish (Phase 6)**: 対象ストーリーの実装後

### User Story Dependencies

- **User Story 1 (P1)**: T002後に開始可能。基礎matcherを提供する
- **User Story 2 (P1)**: US1のmatcherを拡張するためUS1完了後に実施する
- **User Story 3 (P2)**: T002後に開始可能。既存URL層を再利用し、検索matcherとは独立して確認できる

### Parallel Opportunities

- T002はT001に依存する
- US1ではT003を実装前に作成可能。matcher実装T004/T005は同じファイルのため逐次実行
- US2のT007とT008は別テスト群の追加として並行可能。T009〜T012は同一matcher責務のため逐次実行
- US3のT014、T015は別ファイルで独立して並行可能。US3のURL回帰作業はmatcher実装と並行可能

---

## Parallel Example: User Story 3

```text
Task: "URL build canonicalization tests in app/utils/search/cardSearchQueryBuilder.test.ts"
Task: "URL parse restoration tests in app/utils/search/cardSearchQueryParser.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001で既存JSONの形を確認する
2. T002で検索用データ型を用意する
3. US1を実装し、Item・Spell・Otherそれぞれの基本支払可能数量で独立確認する

### Incremental Delivery

1. US1で各コスト種別の単独検索を提供する
2. US2でOR/AND/none、複数分類、alternative、共有capacityの規則を追加する
3. US3でURL復元・canonical化・API経路を確認する
4. Polishで既存検索との併用を確認する

---

## Notes

- [P]は異なるファイルを扱い、依存タスクが完了済みの場合に並行可能
- [Story]はspec.mdのUser Storyへ対応する
- QDS/Query Specificationおよび事前レビュー済みsearch_costを根拠とし、effect_cost_textのruntime解析は追加しない
- Spell `value: "any"`は内部Projection値としてのみ扱い、URL Pair valueへ追加しない
