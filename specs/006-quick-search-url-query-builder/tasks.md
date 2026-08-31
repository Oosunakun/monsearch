---

description: "Quick Search URL Query Builder の実装タスク"
---

# Tasks: Quick Search URL Query Builder

**Input**: `/specs/006-quick-search-url-query-builder/` の設計成果物

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/quick-search-query.md、quickstart.md

**Tests**: feature specification、plan、Constitution の Testability 原則で Unit Test と routing boundary test が明示されているため、各 user story にテストタスクを含める。

**Organization**: 各 user story を独立して実装・検証できる単位で構成する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクに依存せず、別ファイルで並行作業できる
- **[Story]**: 対応する user story（US1、US2、US3）
- すべてのタスクに対象ファイルパスを明記する

## Phase 1: Setup（Shared Infrastructure）

**Purpose**: 既存 Nuxt/Vitest 環境を再現し、変更前の基準状態を確認する

- [ ] T001 `package-lock.json` を用いて `npm ci` を実行し、`package.json` の既存 test・lint・build scripts が利用可能であることを確認する

---

## Phase 2: Foundational（Blocking Prerequisites）

**Purpose**: 全 user story が利用する target 型と approved Logical URL Query vocabulary を整備する

**⚠️ CRITICAL**: この phase が完了するまで user story の実装を開始しない

- [ ] T002 `QuickSearchTarget` literal union を定義し、`QuickSearchState.selectedSearchType` と `QuickSearchOption` を型安全に関連付けるよう `app/types/ui/layout.ts` を更新する
- [ ] T003 [P] canonical alias `att` を `LogicalCardSearchQuery` に追加するよう `app/types/ui/search.ts` を更新する
- [ ] T004 [P] approved alias `att` を schema vocabulary に追加するよう `app/utils/search/cardSearchQuerySchema.ts` を更新する

**Checkpoint**: strict TypeScript で quick-search target と `nm`・`att`・`kw` を表現できる

---

## Phase 3: User Story 1 - 簡易検索を結果へ反映する（Priority: P1）🎯 MVP

**Goal**: 選択した「カード名」「種族・タイプ」「キーワード」を、それぞれ `nm`・`att`・`kw` の単一 canonical condition に変換して `/cards` へ遷移する

**Independent Test**: 3 target の有効な文字列を送信し、対象に対応する condition だけを持つ `/cards` location が生成されることを確認する

### Tests for User Story 1

> **NOTE**: 実装前にテストを作成し、期待する理由で失敗することを確認する

- [ ] T005 [P] [US1] 3 target と `nm`・`att`・`kw` の対応、単一-key 出力、両端 trim、内部空白保持の table-driven Unit Test を `app/utils/search/quickSearchQueryBuilder.test.ts` に作成する
- [ ] T006 [P] [US1] query ありの場合に `router.push({ path: '/cards', query })` が呼ばれる composable test を `app/composables/useQuickSearch.test.ts` に作成する

### Implementation for User Story 1

- [ ] T007 [US1] `Readonly<QuickSearchState>` から `LogicalCardSearchQuery` を返す exhaustive target mapping の pure builder を `app/utils/search/quickSearchQueryBuilder.ts` に実装する
- [ ] T008 [US1] quick-search option を `QuickSearchTarget` と整合する型で構築し、builder の logical query を `/cards` navigation へ渡すよう `app/composables/useQuickSearch.ts` を更新する
- [ ] T009 [US1] vertical・horizontal の両 UI で型付き target 更新と同一 submit 動線を維持するよう `app/components/layout/QuickSearchBar.vue` を更新する

**Checkpoint**: header と navigation drawer の両方から3種類の簡易検索を独立して実行・検証できる

---

## Phase 4: User Story 2 - 検索 location を再利用する（Priority: P2）

**Goal**: Unicode、emoji、内部空白、予約記号を logical value のまま Vue Router に渡し、再読込・bookmark・共有可能な canonical location を作る

**Independent Test**: 日本語・emoji・`a,b:c=1`・内部空白を含む location を memory router で開き直し、同じ logical target/value が復元されることを確認する

### Tests for User Story 2

- [ ] T010 [P] [US2] Unicode・emoji・内部空白・予約記号の logical value が Vue Router の往復後も保持される memory-router test を `app/utils/search/quickSearchQueryRouter.test.ts` に作成する
- [ ] T011 [P] [US2] 同一入力を100回変換した query の key・value・順序が一致し、`selectedCardPool` と未承認 parameter が出力されないテストを `app/utils/search/quickSearchQueryBuilder.test.ts` に追加する

### Implementation for User Story 2

- [ ] T012 [US2] builder で percent-encoding を行わず Vue Router に委譲し、card pool を含めず deterministic な logical query を返すことを `app/utils/search/quickSearchQueryBuilder.ts` で保証する

**Checkpoint**: 特殊文字を含む canonical location を別の閲覧状態で再利用しても、logical value が変化しない

---

## Phase 5: User Story 3 - 空または不正な入力を安全に扱う（Priority: P3）

**Goal**: 空・whitespace-only・未対応 target・runtime 上の非 string text から条件を生成せず、入力 state を変更しない

**Independent Test**: 各不正入力を builder と composable に渡し、空 parameter のない `/cards` location、fallback なし、元 state の不変性を確認する

### Tests for User Story 3

- [ ] T013 [P] [US3] 空文字列・whitespace-only・空/未知 target・非 string text・target 切替・deep-frozen input の omission と immutability test を `app/utils/search/quickSearchQueryBuilder.test.ts` に追加する
- [ ] T014 [P] [US3] 有効条件がない場合に query property なしの `router.push({ path: '/cards' })` が呼ばれる composable test を `app/composables/useQuickSearch.test.ts` に追加する

### Implementation for User Story 3

- [ ] T015 [US3] runtime guard、empty-result omission、非破壊 normalization を `app/utils/search/quickSearchQueryBuilder.ts` に実装する
- [ ] T016 [US3] empty query を location object から省略して bare `/cards` へ遷移する分岐を `app/composables/useQuickSearch.ts` に実装する

**Checkpoint**: 無効入力で意味のない query や暗黙 fallback が発生せず、元 state が維持される

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全 story を横断する品質確認と仕様整合性の最終検証

- [ ] T017 [P] builder・routing・omission の実装結果と behavioral examples の整合を `specs/006-quick-search-url-query-builder/contracts/quick-search-query.md` および `docs/architecture/query_specification.md` で確認し、差異があれば対象ドキュメントを更新する
- [ ] T018 `specs/006-quick-search-url-query-builder/quickstart.md` に従い focused tests、full test suite、`npx vue-tsc --noEmit`、lint、Cloudflare Pages production build を実行する
- [ ] T019 header と navigation drawer から3 target、特殊文字、空/未対応入力を送信する manual end-to-end validation を `specs/006-quick-search-url-query-builder/quickstart.md` の手順で実施する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: 依存なし
- **Foundational（Phase 2）**: Setup 完了後に開始し、全 user story を block する
- **User Story 1（Phase 3）**: Foundational 完了後に開始する MVP
- **User Story 2（Phase 4）**: Foundational と US1 の builder/navigation 完了後に開始する
- **User Story 3（Phase 5）**: Foundational と US1 の builder/navigation 完了後に開始する。US2 とは並行可能
- **Polish（Phase 6）**: delivery 対象の全 user story 完了後に実施する

### User Story Dependency Graph

```text
Setup → Foundational → US1 (MVP) ─┬→ US2 ─┐
                                  └→ US3 ─┴→ Polish
```

### Within Each User Story

- Tests を先に作成し、期待する理由で失敗することを確認してから実装する
- 共通型/schema の後に builder、builder の後に composable/UI integration を実装する
- routing round-trip は pure builder と navigation が完成してから検証する
- 各 checkpoint で当該 story の focused tests を単独実行する

### Parallel Opportunities

- T003 と T004 は別ファイルの vocabulary 更新として並行可能
- US1 の T005 と T006 は別 test file のため並行可能
- US2 の T010 と T011 は別 test file のため並行可能
- US3 の T013 と T014 は別 test file のため並行可能
- US1 完了後、US2 と US3 は異なる acceptance concern として並行可能。ただし同一ファイルを編集する T011/T013、T012/T015、T014/T016 は担当間で順序または merge を調整する

---

## Parallel Example: User Story 1

```text
Task: "3 target mapping の table-driven Unit Test を app/utils/search/quickSearchQueryBuilder.test.ts に作成する"
Task: "query あり navigation の composable test を app/composables/useQuickSearch.test.ts に作成する"
```

## Parallel Example: User Story 2

```text
Task: "Vue Router round-trip test を app/utils/search/quickSearchQueryRouter.test.ts に作成する"
Task: "determinism と未承認 field omission test を app/utils/search/quickSearchQueryBuilder.test.ts に追加する"
```

## Parallel Example: User Story 3

```text
Task: "不正入力と immutability test を app/utils/search/quickSearchQueryBuilder.test.ts に追加する"
Task: "empty query navigation test を app/composables/useQuickSearch.test.ts に追加する"
```

---

## Implementation Strategy

### MVP First（User Story 1 Only）

1. Phase 1 の既存環境を確認する
2. Phase 2 の target 型と canonical vocabulary を整備する
3. Phase 3 の tests を先に作成し、builder と navigation を実装する
4. US1 focused tests で3 target の単一 condition を検証する
5. MVP として停止し、header と navigation drawer の両動線をレビューする

### Incremental Delivery

1. Setup + Foundational → 型安全な基盤
2. US1 → 3 target の canonical query navigation（MVP）
3. US2 → 特殊文字と共有 location の round-trip 保証
4. US3 → 無効入力、omission、immutability の保証
5. Polish → full quality gates と manual validation

### Scope Guardrails

- `buildCardSearchQuery` との統合や一時的な `SearchForm` 構築は行わない
- detailed-search form/parser に archetype field を追加しない
- `/cards` の検索 engine や実データ filtering は変更しない
- `selectedCardPool`、`pool`、`type`、`q`、version parameter は出力しない
- logical value を builder/composable で percent-encode しない

---

## Notes

- `[P]` は異なるファイルまたは未完了タスクに依存しない作業を示す
- `[US1]`、`[US2]`、`[US3]` は spec.md の user story に対応する
- 各 task または論理的な task group の完了時に commit できる粒度とする
- snapshot-only ではなく mapping、omission、round-trip の意味を直接 assertion する
