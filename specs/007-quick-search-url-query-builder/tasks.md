---

description: "Quick Search URL Query Builder の実装タスク"
---

# Tasks: Quick Search URL Query Builder

**Input**: `/specs/007-quick-search-url-query-builder/` の設計文書

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/quick-search-query.md、quickstart.md

**Tests**: Constitution の Testability 原則と feature plan に従い、Vitest の Unit Test、routing boundary test、Vue Router round-trip test を実装より先に追加する。

**Organization**: 各 User Story を独立して実装・検証できるよう、タスクを User Story 単位で構成する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクに依存せず、別ファイルで並行実行できる
- **[Story]**: 対応する User Story（US1、US2、US3）
- すべてのタスクに具体的なファイルパスを記載する

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: brownfield repository の現行状態と検証コマンドを確認する

- [X] T001 `package.json` の既存 scripts を使用して `npm test -- --run`、`npx vue-tsc --noEmit`、`npm run lint` の baseline を実行し、feature 着手前から存在する失敗を記録する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全 User Story が利用する target 型と canonical query 語彙を整備する

**⚠️ CRITICAL**: この phase が完了するまで User Story の実装を開始しない

- [X] T002 [P] `QuickSearchTarget` を `'name' | 'race-type' | 'keyword'` の literal union として追加し、`QuickSearchState.selectedSearchType` と検索対象 option を型付けする in `app/types/ui/layout.ts`
- [X] T003 [P] approved alias `att` を `LogicalCardSearchQuery` と `CARD_SEARCH_QUERY_ALIASES` に追加する in `app/types/ui/search.ts` and `app/utils/search/cardSearchQuerySchema.ts`

**Checkpoint**: Quick Search の3 target と `nm`、`att`、`kw` を strict TypeScript で表現できる

---

## Phase 3: User Story 1 - 簡易検索を結果へ反映する (Priority: P1) 🎯 MVP

**Goal**: 選択された検索対象と入力文字列から対応する canonical condition を1つ生成し、`/cards` へ遷移する

**Independent Test**: `name`、`race-type`、`keyword` をそれぞれ送信し、`nm`、`att`、`kw` の対応する condition だけを持つ `/cards` location が `router.push` へ渡されることを確認する

### Tests for User Story 1

> **NOTE**: テストを先に作成し、実装前に失敗することを確認する

- [X] T004 [P] [US1] 3 target の mapping、両端 trim、内部空白保持、単一 condition、card pool 非出力を table-driven test として追加する in `app/utils/search/quickSearchQueryBuilder.test.ts`
- [X] T005 [P] [US1] 有効な各 target の submit が builder output を `{ path: '/cards', query }` として渡す routing boundary test を追加する in `app/composables/useQuickSearch.test.ts`

### Implementation for User Story 1

- [X] T006 [US1] exhaustive な target-to-alias mapping を使い `Readonly<QuickSearchState>` から `CanonicalQuickSearchQuery` を返す pure `buildQuickSearchQuery` を実装する in `app/utils/search/quickSearchQueryBuilder.ts`
- [X] T007 [US1] 検索対象 options を `QuickSearchTarget` で型付けし、`runQuickSearch` が builder の non-empty output を `/cards` の query に渡すよう変更する in `app/composables/useQuickSearch.ts`
- [X] T008 [US1] horizontal/vertical の対象選択値を型安全に `QuickSearchState` へ反映し、header と drawer の共通 component から3 target を送信できるようにする in `app/components/layout/QuickSearchBar.vue`

**Checkpoint**: 3種類の簡易検索が canonical query を持つ `/cards` location を生成し、US1 を単独検証できる

---

## Phase 4: User Story 2 - 検索 location を再利用する (Priority: P2)

**Goal**: Unicode、空白、emoji、予約記号を含む logical value を Vue Router に委譲し、再読み込み・bookmark・共有可能な deterministic location にする

**Independent Test**: 日本語、内部空白、emoji、`=`, `,`, `:`, `&`, `?` を含む query を memory router で開き直し、同じ logical target/value と fullPath が再現されることを確認する

### Tests for User Story 2

- [X] T009 [P] [US2] Unicode、内部空白、emoji、予約記号の encode/decode と同一 location の再生成を検証する Vue Router memory-history test を追加する in `app/utils/search/quickSearchQueryRouter.test.ts`
- [X] T010 [P] [US2] 同一 state を100回変換して key/value と key order が一致し、事前 percent-encoding が行われないことを検証する in `app/utils/search/quickSearchQueryBuilder.test.ts`

### Implementation for User Story 2

- [X] T011 [US2] builder が logical text を加工・事前 encode せず安定した単一-key object を返すことを確認し、round-trip test で判明した canonicalization 不備を修正する in `app/utils/search/quickSearchQueryBuilder.ts`

**Checkpoint**: Quick Search location を別の閲覧状態で開いても対象と文字列の意味が保持され、US2 を単独検証できる

---

## Phase 5: User Story 3 - 空または不正な入力を安全に扱う (Priority: P3)

**Goal**: 空入力、未知 target、未承認 state を query から除外し、入力 state を変更せず bare `/cards` へ遷移する

**Independent Test**: 空文字列、whitespace-only text、runtime 上の unsupported/empty target、非 string text を変換し、結果が `{}`、navigation が `{ path: '/cards' }`、元 state が変化なしであることを確認する

### Tests for User Story 3

- [X] T012 [P] [US3] empty/whitespace-only text、unsupported/empty target、runtime 非 string text、`selectedCardPool` と未承認値の omission、入力 immutability を検証する in `app/utils/search/quickSearchQueryBuilder.test.ts`
- [X] T013 [P] [US3] condition が空の場合に query property を付けず `{ path: '/cards' }` を `router.push` へ渡す routing boundary test を追加する in `app/composables/useQuickSearch.test.ts`

### Implementation for User Story 3

- [X] T014 [US3] runtime 境界で target と text を検証し、無効値では fallback せず `{}` を返し、入力を変更しない omission logic を実装する in `app/utils/search/quickSearchQueryBuilder.ts`
- [X] T015 [US3] builder output が空の場合は query property のない `/cards` location を組み立てるよう `runQuickSearch` を変更する in `app/composables/useQuickSearch.ts`

**Checkpoint**: 無効入力から意味のない parameter が生成されず、US3 を単独検証できる

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全 User Story を横断して contract、型安全性、品質 gate を確認する

- [X] T016 [P] 実装と `nm`/`att`/`kw` vocabulary、omission、encoding boundary の整合を確認し、必要な説明のみ更新する in `docs/architecture/query_specification.md`
- [X] T017 `quickstart.md` の automated validation と manual scenarios を実行し、focused/full tests、typecheck、lint、Cloudflare Pages production build の結果を記録する in `specs/007-quick-search-url-query-builder/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。直ちに開始可能
- **Foundational (Phase 2)**: Setup 完了後に実行し、全 User Story を block する
- **User Story 1 (Phase 3)**: Foundational 完了後に開始する MVP
- **User Story 2 (Phase 4)**: Foundational と US1 の builder/navigation 完了後に、location 再利用性を追加検証する
- **User Story 3 (Phase 5)**: Foundational と US1 の builder/navigation 完了後に開始でき、US2 とは並行可能
- **Polish (Phase 6)**: 採用する全 User Story の完了後に実行する

### User Story Dependencies

```text
Setup → Foundational → US1 (MVP) ─┬→ US2 ─┐
                                  └→ US3 ─┴→ Polish
```

- **US1 (P1)**: Foundational のみに依存し、3 target の基本検索を独立提供する
- **US2 (P2)**: US1 の builder と navigation を利用するが、round-trip/determinism を独立検証できる
- **US3 (P3)**: US1 の builder と navigation を利用するが、US2 に依存せず invalid-input behavior を独立検証できる

### Within Each User Story

- Test task を先に完了し、対象の test が失敗することを確認してから implementation task を開始する
- 共通型・alias → builder → composable navigation → component integration の順で実装する
- User Story ごとの focused test が成功してから次の priority または最終 gate へ進む

### Parallel Opportunities

- T002 と T003 は別ファイル群のため並行可能
- US1 では T004 と T005 を並行作成できる
- US2 の T009 と T010 は別 test concern のため並行作成できる
- US3 の T012 と T013 は builder/composable の別 test file で並行作成できる
- US1 完了後、US2 と US3 は互いに独立して並行実行できる
- T016 は実装完了後、T017 の品質 gate 実行準備と並行可能

---

## Parallel Example: User Story 1

```text
Task T004: app/utils/search/quickSearchQueryBuilder.test.ts に mapping/normalization test を追加
Task T005: app/composables/useQuickSearch.test.ts に routing boundary test を追加
```

## Parallel Example: User Story 2 and User Story 3

```text
Developer A: T009 → T010 → T011（US2 round-trip と determinism）
Developer B: T012 → T013 → T014 → T015（US3 invalid-input handling）
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 で baseline を確認する
2. T002–T003 で共通型と query vocabulary を整備する
3. T004–T005 の failing tests を追加する
4. T006–T008 を実装する
5. US1 の focused tests と typecheck を実行して停止・レビューする

### Incremental Delivery

1. Setup + Foundational → strict typing と approved vocabulary を利用可能にする
2. US1 → 3 target の canonical navigation を MVP として検証する
3. US2 → URL round-trip と deterministic behavior を追加保証する
4. US3 → invalid input と omission behavior を追加保証する
5. Polish → documentation と全 quality gates を完了する

## Notes

- `[P]` は別ファイル、または同一 implementation に依存しない test concern を示す
- `[USn]` は specification の User Story との traceability を示す
- Quick Search builder と既存 `buildCardSearchQuery` は統合しない
- URL percent-encoding は Vue Router に委譲し、builder/composable で手動 encode しない
- `selectedCardPool`、`pool`、`type`、`q` と未承認 parameter は出力しない
- detailed-search form/parser と card search engine は変更対象外とする

