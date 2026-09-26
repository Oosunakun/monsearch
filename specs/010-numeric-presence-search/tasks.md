---

description: "数値能力 Modifier 整合の実装タスク"
---

# Tasks: 数値能力 Modifier 整合

**Input**: `/specs/010-numeric-presence-search/` の設計成果物

**Prerequisites**: `plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`

**Tests**: constitution の Principle II と仕様の独立検証条件に従い、Builder、Parser、factory、UI、server matcher のテストを含める。

**Organization**: ユーザーストーリー単位で実装・検証できるように整理する。

## Phase 1: Setup (Shared Infrastructure)

**目的**: 既存の検索実装と仕様の差分を固定し、後続タスクが同じ alias・semantics を参照できる状態にする。

- [X] T001 `specs/010-numeric-presence-search/plan.md`、`specs/010-numeric-presence-search/spec.md`、`specs/010-numeric-presence-search/contracts/numeric-presence-query.md` の対象 alias・対象能力・除外範囲を実装チェック項目へ整理する
- [X] T002 [P] `docs/architecture/query_specification.md` と `docs/architecture/query_data_specification.md` の `itm`、`aitm`、既存 Modifier、`0`/`NULL`、Level 例外の現行記述を確認し、必要な差分箇所を記録する
- [X] T003 [P] `app/utils/search/cardSearchQueryBuilder.test.ts`、`app/utils/search/cardSearchQueryParser.test.ts`、`server/utils/cardSearch/search.test.ts` の既存 fixture とテスト実行コマンドを確認し、代表ケースの追加位置を決める

---

## Phase 2: Foundational (Blocking Prerequisites)

**目的**: 新しい型を増やさず、既存の `FilteredNumericCondition` と `filterType` を initiative 系へ拡張できる共通境界を整える。

**⚠️ CRITICAL**: このフェーズ完了前に個別 UI・Builder・Parser・matcher の変更を開始しない。

- [X] T004 `app/types/ui/search.ts` の `initiative` と `additionalInitiative` を既存 `FilteredNumericCondition` 相当の `filterType: all | include | exclude` と operator/value 構造へ揃え、`presence` 型・新規 `...p` Alias・対象外能力の Modifier を追加しない
- [X] T005 `app/utils/search/cardSearchFormFactory.ts` の initiative 系 default/reset を `filterType: all`、未指定 value と整合させ、factory テストで作成直後・reset 後の状態を固定する
- [X] T006 [P] `app/utils/search/cardSearchChanged.ts` と `app/utils/search/cardSearchQuerySchema.ts` の initiative 系差分・入力検証を確認し、`all`/`include`/`exclude` と finite number、`0`、`NULL` の扱いを共通 condition と一致させる
- [X] T007 [P] `types/cards/finderCards.ts`、`server/types/cardSearch.ts`、`server/utils/cardSearch/project.ts` の Ability 数値が `NULL` と `0` を区別して流れることを確認し、必要な場合のみ nullable 型・projection・response 型を最小変更する

**Checkpoint**: 共通型、default、入力 schema、データ projection が `0` と `NULL` を区別でき、P1 ストーリーを実装できる。

---

## Phase 3: User Story 1 - 値の有無で検索する (Priority: P1) 🎯 MVP

**Goal**: initiative、charge、defender、additional 系、hero point の `all`/`include`/`exclude` が `0` と `NULL` を正しく判定し、Level 例外も維持する。

**Independent Test**: `0`、正数、負数、`NULL` の代表カードを使い、Modifier 単独、`include + comparison`、`exclude + comparison`、Comparison 単独を server matcher で検証する。

### Tests for User Story 1

- [X] T008 [P] [US1] `server/utils/cardSearch/search.test.ts` に initiative、charge、defender、additional initiative/charge/defender、hero point の `all`/`include`/`exclude` 単独ケースを追加し、`0` は値あり、`NULL` は値なしとして検証する
- [X] T009 [P] [US1] `server/utils/cardSearch/search.test.ts` に `include + gte:0`、`exclude + gte:2`、Comparison 単独、finite/非finite、正負数のケースを追加する
- [X] T010 [P] [US1] `server/utils/cardSearch/search.test.ts` に Hero Point の `is_hero` semantics と `exclude` 時の Comparison 無視、Level の `is_instant_summon` と Level Comparison の独立評価を追加する

### Implementation for User Story 1

- [X] T011 [US1] `server/utils/cardSearch/search.ts` の数値能力 matcher を、`all` は存在性を絞らず Comparison のみ、`include` は非 NULL 値ありかつ Comparison、`exclude` は NULL/欠損のみかつ Comparison 無視として実装する
- [X] T012 [US1] `server/utils/cardSearch/search.ts` の Hero Point 判定を `is_hero` に接続し、Hero Point `exclude` 時に Comparison を評価しないようにする
- [X] T013 [US1] `server/utils/cardSearch/search.ts` の Level 例外を `is_instant_summon` と Level Comparison の独立条件として維持し、`lvm=exclude&lv=gte:2` を正しく評価する
- [X] T014 [US1] `server/utils/cardSearch/search.test.ts` と関連 matcher fixture を実行し、対象外の attack/defense/additionalAttack/additionalDefense/limit に Modifier semantics が波及していないことを確認する

**Checkpoint**: User Story 1 は URL や UI に依存せず、代表データ上で値あり・値なし・Comparison の domain semantics を独立検証できる。

---

## Phase 4: User Story 2 - Modifier と Comparison を組み合わせる (Priority: P1)

**Goal**: initiative と additionalInitiative に `itm`/`aitm` を追加し、既存数値能力の Modifier と Comparison の canonical query を正しく生成・復元する。

**Independent Test**: 各対象能力の Form を Builder に渡し、`all`、Modifier 単独、`include + comparison`、`exclude + comparison` の query を比較し、Parser の復元結果を確認する。

### Tests for User Story 2

- [X] T015 [P] [US2] `app/utils/search/cardSearchQueryBuilder.test.ts` に `initiative.filterType` と `additionalInitiative.filterType` の `itm`/`aitm`、`it`/`ait`、canonical order、default omission の table-driven テストを追加する
- [X] T016 [P] [US2] `app/utils/search/cardSearchQueryBuilder.test.ts` に全対象 Modifier の単独、`include + comparison`、`exclude + comparison`、`all + comparison`、`0` 保持の canonicalization テストを追加する
- [X] T017 [P] [US2] `app/utils/search/cardSearchQueryParser.test.ts` に `itm`/`it`、`aitm`/`ait`、既存 Modifier の有効値・不正値・未知 alias・重複 query の復元テストを追加する

### Implementation for User Story 2

- [X] T018 [US2] `app/utils/search/cardSearchQueryBuilder.ts` の numeric mapping に `initiative: itm → it` と `additionalInitiative: aitm → ait` を追加し、mapping-table 順序で出力する
- [X] T019 [US2] `app/utils/search/cardSearchQueryBuilder.ts` の filtered numeric canonicalization を、`all` は Modifier 省略、`include` は Comparison の有無にかかわらず出力、`exclude` は Modifier のみ出力として統一する
- [X] T020 [US2] `app/utils/search/cardSearchQueryParser.ts` に `itm`/`it` と `aitm`/`ait` の defensive parsing を追加し、`exclude + comparison` を Form 内に保持したまま復元する
- [X] T021 [US2] `app/utils/search/cardSearchQueryParser.ts` の重複・不正値処理を Query Specification に合わせ、未知・不正な数値条件を無視しつつ他の有効条件を復元する
- [X] T022 [US2] `app/utils/search/cardSearchQueryBuilder.ts` と `app/utils/search/cardSearchQueryParser.ts` のテストで `build(parse(nonCanonicalQuery))` が `exclude` の Comparison を除去した canonical query になることを検証する

**Checkpoint**: Builder/Parser が `itm`/`aitm` を含む全対象能力の query semantics を再現し、`exclude + comparison` を安全に canonicalize できる。

---

## Phase 5: User Story 3 - URL と詳細検索を往復する (Priority: P1)

**Goal**: Initiative と Additional Initiative の詳細検索 UI で Modifier を指定・保持・表示し、検索実行・再読み込み・共有 URL で同じ意味を復元する。

**Independent Test**: `/cards/search` で `all`、`include`、`exclude`、Comparison を操作して `/cards` へ遷移し、URL を Parser と詳細検索画面へ戻して状態を確認する。

### Tests for User Story 3

- [X] T023 [P] [US3] `app/components/cards/search/unit/SearchFieldInitiative.test.ts` または既存 UI テスト配置に Modifier 単独、Comparison 併用、`exclude` 中の Comparison 非表示・Form 内保持のテストを追加する
- [X] T024 [P] [US3] `app/components/cards/search/equipment/SearchFieldAdditionalInitiative.test.ts` または既存 UI テスト配置に `aitm` の include/exclude、Comparison 保持、default 表示のテストを追加する
- [X] T025 [P] [US3] `app/pages/cards/search.test.ts` と `app/utils/search/cardSearchQueryRouter.test.ts` に initiative 系 query からの詳細検索復元、検索実行時の `/cards` navigation、空 query の回帰テストを追加する

### Implementation for User Story 3

- [X] T026 [US3] `app/components/cards/search/unit/SearchFieldInitiative.vue` に既存 `SearchFilterWithOperator` の契約を適用し、`filterType` を all/include/exclude から選択できるようにする
- [X] T027 [US3] `app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue` に initiative と同じ Modifier UI semantics を適用し、`additionalInitiative.filterType` を編集できるようにする
- [X] T028 [US3] `app/components/cards/search/shared/SearchFilterWithOperator.vue` の Modifier 切替時表示制御を確認・修正し、exclude 中の Comparison を UI から隠しつつ Form 値を削除しないようにする
- [X] T029 [US3] `app/pages/cards/search.vue`、`app/composables/useCardSearchForm.ts`、関連 route integration の query 復元・送信経路を確認し、initiative 系条件を失わずに `/cards` へ遷移させる
- [X] T030 [US3] `app/components/cards/search/unit/SearchFieldInitiative.vue`、`app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue`、`app/pages/cards/search.test.ts` で include/all へ戻した際に保持 Comparison が再表示され、再検索時に canonical query が生成されることを検証する

**Checkpoint**: 詳細検索画面、URL Query、Parser/Builder、検索実行が initiative 系 Modifier と Comparison の意味を一貫して扱う。

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 正式仕様との整合、全体回帰、quickstart の検証結果を反映する。

- [X] T031 [P] `docs/architecture/query_specification.md` と `docs/architecture/query_data_specification.md` に `itm`/`aitm` の alias、canonical order、Modifier semantics、`0`/`NULL`、Level/Hero Point の例外を反映する
- [X] T032 [P] `docs/architecture/query_data_specification_revision_candidates.md` と必要範囲の `specs/002-query-builder/`・`specs/005-search-condition-edit/` の記述を、新しい numeric Modifier semantics と矛盾しないよう最小限更新する
- [X] T033 `app/utils/search/cardSearchFormFactory.test.ts`、`app/utils/search/cardSearchQueryBuilder.test.ts`、`app/utils/search/cardSearchQueryParser.test.ts`、`server/utils/cardSearch/search.test.ts` を focused test として実行し、`0`/`NULL`、Modifier 単独、roundtrip、対象外能力の非追加を確認する
- [X] T034 `npm test -- --run` 相当の全テスト、`vue-tsc --noEmit`、`eslint`、`nuxt build` を実行し、既存回帰・strict typing・production build の結果を `specs/010-numeric-presence-search/quickstart.md` に記録する
- [X] T035 [P] `specs/010-numeric-presence-search/spec.md`、`specs/010-numeric-presence-search/contracts/numeric-presence-query.md`、`specs/010-numeric-presence-search/quickstart.md` の受入条件と実装・テスト結果を照合し、未達項目がないことを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。仕様・既存テスト構成の確認を開始できる。
- **Foundational (Phase 2)**: Phase 1 完了後。型・default・schema・nullable data-flow の共通境界を確定する。
- **User Story 1 (Phase 3)**: Phase 2 完了後。server domain semantics を先に成立させる。
- **User Story 2 (Phase 4)**: Phase 2 完了後に着手可能だが、Phase 3 の semantics 確認結果を利用するため通常は Phase 3 後に実施する。
- **User Story 3 (Phase 5)**: Phase 4 の Builder/Parser 契約に依存する。
- **Polish (Phase 6)**: 実装・ストーリーテスト完了後。

### User Story Dependencies

- **US1 (P1)**: Foundational のみ依存。単独で server matcher の MVP として検証可能。
- **US2 (P1)**: Foundational に依存し、US1 の numeric semantics と同じ `filterType` 契約を共有する。
- **US3 (P1)**: US2 の `itm`/`aitm` Builder/Parser と route integration に依存する。

### Parallel Opportunities

- Phase 1 の T002 と T003 は並列実行可能。
- Phase 2 の T006 と T007 は T004/T005 と別ファイルのため、型依存を解決した後に並列実行可能。
- US1 の T008、T009、T010 は同じテストファイルを変更する場合は統合担当を一つに限定し、fixture が分離できる場合のみ並列実行する。
- US2 の T015、T016、T017 は Builder/Parser の別テストファイルを対象に並列実行可能。
- US3 の T023、T024、T025 はそれぞれ別境界のテストとして並列実行可能。
- Phase 6 の T031、T032、T035 はコード変更完了後に並列実行可能。

## Parallel Example: User Story 2

```text
担当A: T015 [US2] app/utils/search/cardSearchQueryBuilder.test.ts の initiative/additionalInitiative ケース
担当B: T017 [US2] app/utils/search/cardSearchQueryParser.test.ts の復元・不正値ケース
担当C: T016 [US2] app/utils/search/cardSearchQueryBuilder.test.ts の既存 Modifier canonicalization ケース
```

## Implementation Strategy

### MVP First

1. Phase 1 と Phase 2 を完了する。
2. Phase 3 の US1 で `0`/`NULL` と Modifier semantics を server matcher に実装・検証する。
3. US1 を独立検証し、値あり・値なし検索の MVP として確認する。

### Incremental Delivery

1. US1: domain semantics を成立させる。
2. US2: `itm`/`aitm` と既存 Modifier の canonical URL を成立させる。
3. US3: 詳細検索 UI と URL 往復を接続する。
4. Phase 6: architecture 文書、全テスト、typecheck、lint、build を通過させる。

### Scope Guard

- 新しい `presence` 型、`...p` Alias、attack/defense 系の新規 Modifier、schema migration、コスト検索は追加しない。
- `exclude` の内部 Comparison は Form から削除せず、検索評価と Builder 出力だけで無視する。

## Completion Criteria

- すべてのタスクが `- [X] Txxx` 形式で、ユーザーストーリータスクには `[USn]`、並列可能なタスクには必要に応じて `[P]` を付けている。
- 各タスクに実装対象の具体的なファイルパスが含まれている。
- US1〜US3 の独立テスト条件が記載されている。
- `quickstart.md` の focused test、全テスト、typecheck、lint、build を実行できる。
