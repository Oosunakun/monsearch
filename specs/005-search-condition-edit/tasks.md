---

description: "検索条件編集機能の実装タスク"
---

# Tasks: 検索条件編集

**Input**: `/specs/005-search-condition-edit/` の設計文書

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/search-condition-edit.md、quickstart.md

**Tests**: 仕様の User Scenarios & Testing、SC-001/002/005、constitution の Testability 原則に従い、各 user story のテストを実装より先に追加する。

**Organization**: 各 user story を独立して実装・検証できるよう、タスクを story 単位で構成する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクに依存せず、別ファイルで並行実行できる
- **[Story]**: 対応する user story（US1、US2、US3）
- 各タスクの説明には対象ファイルを明記する

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 既存 query contract とテスト基盤が変更前に正常であることを確認する

- [ ] T001 既存の parser/builder 回帰テストを実行し開始時点の query contract を確認する: `app/utils/search/cardSearchQueryParser.test.ts`, `app/utils/search/cardSearchQueryBuilder.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: page integration test で route query と navigation を再現できる共通テスト境界を整える

**⚠️ CRITICAL**: この phase が完了するまで user story の実装を開始しない

- [ ] T002 `useRoute` と navigation の typed mock を追加し、各ケースで route query と spy を初期化できるようにする: `app/pages/cards/index.test.ts`
- [ ] T003 [P] `useRoute`、`useRouter`、検索フォームを各ケースで初期化できる typed mock を整備する: `app/pages/cards/search.test.ts`

**Checkpoint**: `/cards` と `/cards/search` の route 境界を component mount で検証できる

---

## Phase 3: User Story 1 - 現在の検索条件を引き継いで編集する (Priority: P1) 🎯 MVP

**Goal**: 結果画面の現在 query を保持して編集画面へ移動し、全 field family に対応する編集状態を復元する

**Independent Test**: テキスト、複数選択、数値比較を含む `/cards` で「条件を編集」を操作し、遷移先 `/cards/search` の対応項目に同じ意味の条件が表示されること、および空 query では全項目が既定値になることを確認する。

### Tests for User Story 1

- [ ] T004 [P] [US1] 現在 query を保持した編集 navigation と空 query の navigation integration test を追加し、実装前に失敗を確認する: `app/pages/cards/index.test.ts`
- [ ] T005 [P] [US1] text、single/multi select、numeric comparison、filtered numeric、slot、logical match の復元、空 query、reload 相当の page mount test を追加し、実装前に失敗を確認する: `app/pages/cards/search.test.ts`

### Implementation for User Story 1

- [ ] T006 [US1] 「条件を編集」で現在の `LocationQuery` を変更せず `{ path: '/cards/search', query }` へ渡す navigation を実装する: `app/components/cards/result/controls/ResultControls.vue`
- [ ] T007 [US1] 結果 page の現在 query を編集 control の navigation 入力として接続する: `app/pages/cards/index.vue`
- [ ] T008 [US1] page setup 時に `route.query` を `parseCardSearchQuery` で完全な `SearchForm` へ変換し、独立した編集 state として初期化する: `app/pages/cards/search.vue`

**Checkpoint**: US1 を単独で mount し、現在条件の保持、全 family の復元、空 query の既定値、reload 時の復元を検証できる

---

## Phase 4: User Story 2 - 条件を変更して再検索する (Priority: P2)

**Goal**: 復元した条件を追加・変更・解除し、有効な編集状態だけから canonical query を再構築して結果画面へ戻る

**Independent Test**: 復元済みフォームの条件を一つ変更し、別の条件を解除して検索し、変更後の全条件だけが `/cards` の query に含まれることを確認する。無変更時は元と意味的に同じ canonical query になることも確認する。

### Tests for User Story 2

- [ ] T009 [US2] 条件の追加・変更・解除、無変更 canonical round trip、空フォームの bare `/cards` navigation を覆う integration test を追加し、実装前に失敗を確認する: `app/pages/cards/search.test.ts`

### Implementation for User Story 2

- [ ] T010 [US2] 復元後の `form.value` 全体を `buildCardSearchQuery` へ渡し、non-empty query と bare `/cards` を contract どおり遷移させる検索実行処理を完成する: `app/pages/cards/search.vue`

**Checkpoint**: US2 を単独で mount し、編集後 query、解除済み条件の除外、無変更 round trip を検証できる

---

## Phase 5: User Story 3 - 不正な条件があっても安全に編集を続ける (Priority: P3)

**Goal**: 未知・不正・不完全な条件を局所的に無視し、有効な条件を失わず編集と再検索を完了する

**Independent Test**: 有効条件に未知 alias、不正 comparison、不完全 modifier を混在させて編集画面を開き、有効条件だけが復元され、既定値に回復したフォームから canonical query で再検索できることを確認する。

### Tests for User Story 3

- [ ] T011 [P] [US3] 未知 alias、不正値、不完全 compound、duplicate、Unicode、予約記号、絵文字、numeric zero の defensive parse 回帰ケースを追加し、実装前に期待挙動を固定する: `app/utils/search/cardSearchQueryParser.test.ts`
- [ ] T012 [P] [US3] 不正条件混在時の page rendering、有効条件の復元、category 非適用条件の submit 除外、再検索完了を覆う integration test を追加し、実装前に失敗を確認する: `app/pages/cards/search.test.ts`

### Implementation for User Story 3

- [ ] T013 [US3] integration test で判明した defensive parse の不足だけを alias/value 単位の回復として補い、既存 query semantics を維持する: `app/utils/search/cardSearchQueryParser.ts`
- [ ] T014 [US3] 不正条件を含む route でも既定値を含む操作可能なフォームを描画し、有効状態だけを submit する page 境界を完成する: `app/pages/cards/search.vue`

**Checkpoint**: US3 を単独で mount し、不正条件がほかの条件・描画・編集・再検索を妨げないことを検証できる

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全 story を横断する回帰、品質、手動 user journey を検証する

- [ ] T015 [P] 結果→編集→結果の代表 query 100件による canonical round-trip regression test を追加する: `app/utils/search/cardSearchQueryRouter.test.ts`
- [ ] T016 [P] query ownership、初期化境界、canonical submit の意図が読み取れる最小限の説明へ更新する: `specs/005-search-condition-edit/quickstart.md`
- [ ] T017 focused test、全 test、lint、typecheck、production build を順に実行して結果を記録する: `specs/005-search-condition-edit/quickstart.md`
- [ ] T018 quickstart の手動手順で query 保持、編集、reload、不正値回復、category 非適用条件除外を検証する: `specs/005-search-condition-edit/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし
- **Foundational (Phase 2)**: Setup 完了後に実行し、すべての user story を block する
- **US1 (Phase 3)**: Foundational 完了後に開始でき、他 story には依存しない
- **US2 (Phase 4)**: Foundational と US1 の route-to-form 接続に依存する
- **US3 (Phase 5)**: Foundational と US1 の route-to-form 接続に依存するが、US2 の編集内容には依存しない
- **Polish (Phase 6)**: delivery 対象の user story 完了後に実行する

### User Story Dependency Graph

```text
Setup → Foundational → US1 (MVP) → US2
                            └────→ US3
US1 + US2 + US3 → Polish
```

### Within Each User Story

- story の test を先に作成し、対象実装前に失敗を確認する
- navigation 入力を接続してから form 初期化を接続する
- parser で復元してから builder で canonical query を生成する
- core implementation 完了後に story の independent test を通す

### Parallel Opportunities

- T002 と T003 は別 test file のため並行実行できる
- T004 と T005 は別 test file のため並行実行できる
- US1 完了後、US2 と US3 は並行して進められる
- T011 と T012 は parser unit test と page integration test のため並行実行できる
- T015 と T016 は code test と文書のため並行実行できる

---

## Parallel Example: User Story 1

```text
Task T004: `app/pages/cards/index.test.ts` に query 保持 navigation test を追加
Task T005: `app/pages/cards/search.test.ts` に全 field family の復元 test を追加
```

## Parallel Example: User Story 3

```text
Task T011: `app/utils/search/cardSearchQueryParser.test.ts` に defensive parse regression test を追加
Task T012: `app/pages/cards/search.test.ts` に不正条件混在 integration test を追加
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 の既存 contract を確認する
2. Phase 2 の route test 境界を整える
3. Phase 3 の US1 test を先に失敗させ、navigation と form 初期化を実装する
4. US1 の independent test を実行して停止・検証する

### Incremental Delivery

1. Setup + Foundational → route integration test 基盤
2. US1 → 現在条件を復元できる MVP
3. US2 → 条件を編集して canonical query で再検索
4. US3 → 不正条件から安全に回復
5. Polish → round trip、品質 gate、手動 user journey

### Parallel Team Strategy

1. Setup と Foundational を完了する
2. US1 の T004/T005 を並行し、T006→T007→T008 を統合する
3. US1 完了後に US2 と US3 を並行する
4. 全対象 story 完了後に Polish を実行する

---

## Notes

- `[P]` は別ファイルかつ未完了タスクへの依存がないタスクだけに付与する
- `[US1]`〜`[US3]` は spec.md の user story へ対応する
- parser/builder の既存 semantics は変更せず、必要な修正は回帰 test が示す不足に限定する
- route query は読み取り専用入力とし、編集フォームは独立 object とする
- 各 checkpoint で story を単独検証してから次へ進む
