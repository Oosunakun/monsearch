---

description: "検索条件編集機能の実装タスクリスト"
---

# Tasks: 検索条件編集

**Input**: `/specs/005-search-condition-edit/` の設計文書

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/search-condition-edit.md、quickstart.md

**Tests**: 仕様と research.md が focused integration test と parser/builder の回帰テストを要求するため、テストタスクを含める。

**Organization**: 各ユーザーストーリーを独立して実装・検証できる単位に分け、優先順位順に配置する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクに依存せず、異なるファイルで並行実行可能
- **[Story]**: 対応するユーザーストーリー（US1、US2、US3）
- 各タスクの説明に正確なファイルパスを含める

## Phase 1: Setup（共有テスト基盤）

**Purpose**: 既存の query contract を再利用し、ページ境界テストで同じ代表条件を使用できるようにする。

- [X] T001 ページ統合テストで再利用する text・single/multi select・numeric comparison・filtered numeric・slot・logical match・Unicode・numeric zero の代表 query/form fixture を app/utils/search/cardSearchQueryTestFixtures.ts に追加する

---

## Phase 2: Foundational（ブロッキング前提）

**Purpose**: route query から生成した完全な `SearchForm` を、編集ページが独立した mutable state として所有できる初期化境界を用意する。

**⚠️ CRITICAL**: この phase が完了するまでユーザーストーリーの実装を開始しない。

- [X] T002 `SearchForm` の初期値を受け取り独立した form state を生成し、reset 時は既定値へ戻せる型付き初期化 API を app/composables/useCardSearchForm.ts に実装する

**Checkpoint**: route query を変更せず、parser の戻り値を編集可能な form state として所有できる。

---

## Phase 3: User Story 1 - 現在の検索条件を引き継いで編集する（Priority: P1）🎯 MVP

**Goal**: 検索結果画面から現在の route query を保持して詳細検索画面へ移動し、全 field family を対応するフォーム項目へ復元する。

**Independent Test**: text、複数選択、数値比較を含む `/cards` で「条件を編集」を選択し、遷移先 `/cards/search` の対応項目に同じ意味の値が表示されること、および空 query では全項目が既定値になることを確認する。

### Tests for User Story 1

- [X] T003 [P] [US1] 現在の query を変更せず `/cards/search` へ渡す編集操作と空 query の navigation integration test を app/pages/cards/index.test.ts に追加し、実装前に失敗を確認する
- [X] T004 [P] [US1] route query から全 field family、Unicode、numeric zero、空 query、reload 相当の初期状態を復元する integration test を app/pages/cards/search.test.ts に追加し、実装前に失敗を確認する

### Implementation for User Story 1

- [X] T005 [P] [US1] 現在の `LocationQuery` を型付き prop として受け取り `{ path: '/cards/search', query }` へ遷移する編集操作を app/components/cards/result/controls/ResultControls.vue に実装する
- [X] T006 [US1] `useRoute().query` を読み取り専用入力として `ResultControls` へ渡す wiring を app/pages/cards/index.vue に実装する
- [X] T007 [US1] setup 時の `useRoute().query` を `parseCardSearchQuery` で完全な `SearchForm` に変換し T002 の form 初期値へ渡す処理を app/pages/cards/search.vue に実装する

**Checkpoint**: US1 単独で、結果画面の現在条件または空条件から編集可能な詳細検索フォームを再現できる。

---

## Phase 4: User Story 2 - 条件を変更して再検索する（Priority: P2）

**Goal**: 復元した条件を追加・変更・解除し、編集時点で有効な全条件だけから canonical query を再構築して結果画面へ戻る。

**Independent Test**: 復元済みフォームで一つの条件を変更し別の条件を解除して検索し、結果 location が変更後の全条件だけを含むこと、未変更なら元と意味的に同じ canonical query になることを確認する。

### Tests for User Story 2

- [X] T008 [US2] 復元条件の追加・変更・解除、未変更 round trip、category 非適用条件の除外、および全条件解除時の bare `/cards` 遷移を app/pages/cards/search.test.ts に追加し、実装前に失敗を確認する

### Implementation for User Story 2

- [X] T009 [US2] 復元後の `form.value` 全体を `buildCardSearchQuery` で再構築し、non-empty は canonical query 付き `/cards`、empty は bare `/cards` へ遷移させる submit 境界を app/pages/cards/search.vue で完成させる

**Checkpoint**: US2 単独で、復元した状態の任意の編集が新しい結果 URL に反映され、元 query の未知値や解除済み条件は再送されない。

---

## Phase 5: User Story 3 - 不正な条件があっても安全に編集を続ける（Priority: P3）

**Goal**: 有効値と未知・不正・不完全な値が混在しても、有効値だけを復元して編集・再検索を完了できるようにする。

**Independent Test**: 未知 alias、不正 comparison、不完全 modifier、duplicate と有効条件を混在させた `/cards` から編集画面を開き、有効値と安全な既定値が表示され、再検索 query から無効部分だけが除かれることを確認する。

### Tests for User Story 3

- [X] T010 [P] [US3] 未知 alias・不正値・不完全 compound・duplicate の混在時に有効条件を保持し無効 field を既定値へ戻す parser 回帰ケースを app/utils/search/cardSearchQueryParser.test.ts に追加する
- [X] T011 [US3] 不正条件が混在する route から編集ページを描画・操作・submit でき、canonical query に有効条件だけが残る integration test を app/pages/cards/search.test.ts に追加する

### Implementation for User Story 3

- [X] T012 [US3] route 全体を拒否する分岐や raw query の再送を置かず、parser の field 単位回復結果を form 初期値として維持する error-tolerant wiring を app/pages/cards/search.vue で完成させる

**Checkpoint**: US3 単独で、認識可能な条件が一つもない場合を含め、既定フォームから安全に編集と再検索を継続できる。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: ストーリー横断の回帰確認と受入手順を完了する。

- [X] T013 [P] focused test、全 test、lint、typecheck、production build の実行結果と手動確認結果を specs/005-search-condition-edit/quickstart.md の検証項目へ記録する
- [X] T014 parser/builder の既存 query semantics、入力 route query の不変性、strict typing と `any` 不使用を app/pages/cards/index.vue、app/pages/cards/search.vue、app/components/cards/result/controls/ResultControls.vue、app/composables/useCardSearchForm.ts でレビューする

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: 依存なし。直ちに開始できる
- **Foundational（Phase 2）**: T001 完了後に実施し、すべてのユーザーストーリーをブロックする
- **US1（Phase 3）**: Phase 2 完了後に開始する MVP
- **US2（Phase 4）**: 復元済み form を前提とするため US1 完了後に開始する
- **US3（Phase 5）**: Phase 2 完了後に開始可能だが、end-to-end の submit 検証は US1 と US2 の完了後に実施する
- **Polish（Phase 6）**: リリース対象の全ユーザーストーリー完了後に実施する

### User Story Dependency Graph

```text
Setup → Foundational → US1 (MVP) → US2 → Polish
                    └────────────→ US3 ──┘
```

### Within Each User Story

- 各ストーリーのテストを先に追加し、対象実装前に失敗することを確認する
- navigation contract の入力側を実装してから、ページ側の wiring を実装する
- route query の parse 後に form を編集し、submit 時に builder で全 query を再構築する
- ストーリーの Independent Test を通してから次の優先順位へ進む

### Parallel Opportunities

- T003 と T004 は異なる test file のため並行実行できる
- T005 は T003/T004 の test 作成と並行実行できる
- Phase 2 完了後、US1 と US3 の parser 回帰テスト T010 は並行実行できる
- T013 は実装変更を伴わない検証記録として、T014 の code review と並行実行できる

---

## Parallel Example: User Story 1

```text
Task: "app/pages/cards/index.test.ts に query 保持 navigation test を追加する"
Task: "app/pages/cards/search.test.ts に全 field family の復元 test を追加する"
Task: "app/components/cards/result/controls/ResultControls.vue に型付き編集 navigation を実装する"
```

## Parallel Example: User Story 3

```text
Task: "app/utils/search/cardSearchQueryParser.test.ts に不正値混在の回帰 test を追加する"
Task: "US1 の route 引継ぎとフォーム初期化を完成させる"
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1 の共有 fixture を用意する
2. Phase 2 の form 初期化境界を完成させる
3. T003・T004 の失敗を確認する
4. T005～T007 で結果→編集の遷移と復元を実装する
5. US1 の Independent Test を実行し、MVP として停止・評価する

### Incremental Delivery

1. Setup + Foundational → route 由来の form を安全に所有可能
2. US1 → 現在条件を引き継いだ編集開始を提供（MVP）
3. US2 → 追加・変更・解除と canonical 再検索を提供
4. US3 → 不正・未知・不完全な query に対する回復性を保証
5. Polish → 全 quality gate と manual journey を検証

### Parallel Team Strategy

1. Setup と Foundational を先に完了する
2. US1 の page navigation test と form restoration test を並行作成する
3. US1 完了後に US2 を進めつつ、独立した parser 回帰 test を US3 として並行作成する
4. 統合後に quickstart.md の自動・手動検証を実施する

---

## Notes

- `[P]` は異なるファイルを変更し、未完了タスクへ依存しない作業のみを示す
- `[US1]`～`[US3]` は spec.md のユーザーストーリーへ追跡可能
- query の意味、alias、default、duplicate、canonicalization は既存 parser/builder と `docs/architecture/query_specification.md` を authority とする
- route query を直接変更せず、編集 page の form は独立 object とする
- parser/builder の変換規則を page/component に重複実装しない
