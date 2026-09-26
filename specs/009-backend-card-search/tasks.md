---

description: "バックエンドによるカード検索の実装タスク"
---

# Tasks: バックエンドによるカード検索

**Input**: `/specs/009-backend-card-search/` の設計成果物

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/card-search-api.openapi.yaml、quickstart.md

**Tests**: Constitution Principle II と仕様の Success Criteria に基づき、追加ロジックの Unit Test、API contract/integration test、page/composable testを含める。

**Organization**: 各User Storyを独立して実装・検証できるよう、タスクをUser Story単位に編成する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクへの依存がなく、異なるfileで並行実行可能
- **[Story]**: 対応するUser Story（US1、US2、US3）
- 各タスクの説明には変更対象の正確なfile pathを含める

## Phase 1: Setup（Shared Infrastructure）

**Purpose**: 既存Query Specificationを再利用したparity検証の共通fixtureを準備する。

- [X] T001 primitive、collection、comparison、pair collection、modifier、duplicate、0を含む境界値、category applicability、複合条件を網羅するparity fixtureを `app/utils/search/cardSearchQueryTestFixtures.ts` に追加する

---

## Phase 2: Foundational（Blocking Prerequisites）

**Purpose**: 全User Storyが共有するAPI境界型とread-only data sourceを用意する。

**⚠️ CRITICAL**: このPhaseが完了するまでUser Storyの実装を開始しない。

- [X] T002 [P] `CardSearchRequest`、`CardSearchResultItem`、`CardSearchResultPage`、`CardSearchFailure`とsort/page制約をstrict TypeScriptで `server/types/cardSearch.ts` に定義する
- [X] T003 [P] `app/utils/mockData/items/cards.json` を`FinderCards`としてread-onlyに読み込み、source順付きcardを提供するdata sourceを `server/utils/cardSearch/dataSource.ts` に実装する

**Checkpoint**: API契約型とServer-side data sourceが利用可能で、User Story実装を開始できる。

---

## Phase 3: User Story 1 - 条件に合うカードを取得する（Priority: P1）🎯 MVP

**Goal**: Browserから既存query条件を`GET /api/cards`へ送り、Graceful Parsingと既存検索規則による先頭pageのカード一覧・件数・category内訳を取得して表示する。

**Independent Test**: 条件なし、単一条件、複合条件、未知parameter、不正値のみ、有効値との混在、0件、およびQuery Specification各形式の代表queryを送信し、HTTP 200の先頭pageと既存Browser検索oracleのcard ID集合が一致することを確認する。

### Tests for User Story 1

> **NOTE**: 以下のtestを先に作成し、実装前に期待どおり失敗することを確認する。

- [X] T004 [P] [US1] shared parity fixtureを使い、入力条件を変更せず既存Browser検索と同じcard ID集合になるtable-driven testを `server/utils/cardSearch/search.test.ts` に作成する
- [X] T005 [P] [US1] 必須表示fieldだけをcopyし、不完全recordを除外して内部metadataを公開しないprojection testを `server/utils/cardSearch/project.test.ts` に作成する
- [X] T006 [P] [US1] 条件なし・有効条件・未知parameter・不正値混在・0件と`HTTP 500 / CARD_SEARCH_FAILED`を検証するNitro endpoint contract testを `server/api/cards.get.test.ts` に作成する
- [X] T007 [P] [US1] route queryをAPI requestへ渡し、loading後のresultと0件successを保持するcomposable testを `app/composables/useCardSearch.test.ts` に作成する
- [X] T008 [P] [US1] API responseだけで条件表示・件数・category内訳・card一覧を描画しcards JSONへ依存しないpage testを `app/pages/cards/index.test.ts` に追加する

### Implementation for User Story 1

- [X] T009 [US1] `parseCardSearchQuery`のcanonical条件を受け、全Query Specification条件をcategory applicability込みで評価するpure matcherを `server/utils/cardSearch/search.ts` に実装する
- [X] T010 [US1] `Card`から一覧表示に必要なsnake_case fieldだけをcopyし、不完全recordを除外する公開projectionを `server/utils/cardSearch/project.ts` に実装する
- [X] T011 [US1] queryの検索aliasをGraceful Parsingし、既定のpage/sort指定でfilter・件数・全一致category内訳・先頭page projectionを返し、内部failureを単一500 errorへ変換するhandlerを `server/api/cards.get.ts` に実装する
- [X] T012 [US1] route queryと既定の`page=1`、`perPage=20`、`sort=id`、`order=asc`から`GET /api/cards`を取得するtyped composableを `app/composables/useCardSearch.ts` に実装する
- [X] T013 [US1] `CardSearchResultItem`を受け取れるよう結果一覧のprops型を `app/components/cards/result/layout/ResultList.vue` に適用する
- [X] T014 [US1] `mockFinderCards`の直接importとBrowser内filter/count/category集計をAPI composableへ置換し、successと0件を既存result componentsへ渡す処理を `app/pages/cards/index.vue` に実装する

**Checkpoint**: User Story 1単独で、検索条件に一致する先頭pageをバックエンドから取得・表示できる。

---

## Phase 4: User Story 2 - 検索結果を並べ替えてページ単位で閲覧する（Priority: P2）

**Goal**: ID・レアリティ・攻撃力と昇降順、20/50/100件、任意pageをServer側で適用し、安定したpage結果とmetadataを表示する。

**Independent Test**: 各sort/order、perPage、先頭・中間・末尾・範囲外・0件pageを指定し、source順tie-break、clamp、全一致件数/category内訳、および再要求時の決定的な順序を確認する。

### Tests for User Story 2

> **NOTE**: 以下のtestを先に作成し、実装前に期待どおり失敗することを確認する。

- [X] T015 [P] [US2] ID・rarity・attackの昇降順、欠損attack=0、同値時source順を検証するtable-driven testを `server/utils/cardSearch/sort.test.ts` に作成する
- [X] T016 [P] [US2] 20/50/100件、先頭・中間・末尾・範囲外・0件のsliceとmetadataを検証するtable-driven testを `server/utils/cardSearch/paginate.test.ts` に作成する
- [X] T017 [P] [US2] page/perPage/sort/orderの有効値・不正値default・範囲外clamp・category集計範囲を検証するcaseを `server/api/cards.get.test.ts` に追加する
- [X] T018 [P] [US2] sort、方向、件数、page変更時のrequestとpage reset、Server適用値の反映を検証するcaseを `app/composables/useCardSearch.test.ts` に追加する

### Implementation for User Story 2

- [X] T019 [P] [US2] ID・rarity・attackを昇降順で比較し、同値時にJSON source順を維持するsortを `server/utils/cardSearch/sort.ts` に実装する
- [X] T020 [P] [US2] `totalPages=max(1, ceil(totalCount/perPage))`、最終page clamp、0件page=1を適用するpaginationを `server/utils/cardSearch/paginate.ts` に実装する
- [X] T021 [US2] API制御parameterを検索criteriaから分離してdefault適用し、filter→sort→count/category breakdown→paginate→projectionの順で処理するよう `server/api/cards.get.ts` を更新する
- [X] T022 [US2] page、perPage、sort、orderの変更をAPI再取得へ接続し、perPage/sort/order変更時はpage 1へ戻すよう `app/composables/useCardSearch.ts` と `app/pages/cards/index.vue` を更新する

**Checkpoint**: User Story 2単独で、Server-side sort/paginationと画面の選択・位置表示が一貫して動作する。

---

## Phase 5: User Story 3 - 取得失敗を把握して再試行する（Priority: P3）

**Goal**: loading、0件を含むsuccess、errorを明確に分け、取得失敗後に同じ検索指定でretryできるようにする。

**Independent Test**: API failureを発生させ、0件とは異なるerror案内とretry操作が表示され、retry時に同じquery、sort、page、perPageで再取得されることを確認する。

### Tests for User Story 3

> **NOTE**: 以下のtestを先に作成し、実装前に期待どおり失敗することを確認する。

- [X] T023 [P] [US3] loading・success・0件・errorの状態遷移と同一request retryを検証するcaseを `app/composables/useCardSearch.test.ts` に追加する
- [X] T024 [P] [US3] loading skeleton、empty state、error state、retry操作を相互排他的に描画するpage testを `app/pages/cards/index.test.ts` に追加する

### Implementation for User Story 3

- [X] T025 [US3] loading・success・error stateと最後に実行した検索指定を保持し、同一指定を再送するretryを `app/composables/useCardSearch.ts` に実装する
- [X] T026 [US3] `SkeletonLoader`、`EmptyState`、`ErrorState`を取得stateに応じて表示し、retryをcomposableへ接続する処理を `app/pages/cards/index.vue` に実装する

**Checkpoint**: 全User Storyが独立して機能し、正常な0件と取得失敗を区別して回復できる。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: API契約、品質gate、Browser bundle境界をfeature全体で検証する。

- [X] T027 [P] OpenAPIのresponse projectionと実装型・handler responseの整合性を確認し、差分があれば `specs/009-backend-card-search/contracts/card-search-api.openapi.yaml` を承認済み仕様の範囲内で補正する
- [X] T028 [P] 実装後のAPI・UI手動確認手順と実際の挙動を突き合わせ、必要な補足を `specs/009-backend-card-search/quickstart.md` に追加する
- [X] T029 `npm test -- --run`、`npx nuxi typecheck`、`npm run lint`、`npm run build`を実行し、全cards JSONがBrowser bundleへ直接importされていないことをbuild outputと `app/pages/cards/index.vue` で確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: 依存なし。直ちに開始可能
- **Foundational（Phase 2）**: Setup完了後に実施し、全User Storyをblockする
- **User Story 1（Phase 3）**: Foundational完了後に開始可能。他Storyへの依存なし
- **User Story 2（Phase 4）**: FoundationalとUS1のAPI/composable境界に依存する
- **User Story 3（Phase 5）**: US1のAPI取得composableに依存する。US2完了前でも開始可能
- **Polish（Phase 6）**: delivery対象の全User Story完了後に実施する

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 -> US2
                           `-> US3
US2 + US3 -> Polish
```

### Within Each User Story

- testを先に作成して実装前のfailureを確認する
- domain logicとprojectionをendpoint統合より先に実装する
- endpoint/composableをpage統合より先に実装する
- 各Checkpointで当該Storyを独立検証してから次のPriorityへ進む

### Parallel Opportunities

- FoundationalのT002とT003は異なるfileのため並行可能
- US1のT004〜T008は異なるtest責務を先行して並行作成可能
- US2のT015〜T018は並行作成でき、T019とT020も互いに独立して並行実装可能
- US3のT023とT024はcomposable/pageの異なるtestとして並行作成可能
- US1完了後、US2とUS3は別担当で並行実装可能
- PolishのT027とT028は異なる文書を対象に並行可能

---

## Parallel Example: User Story 1

```text
Task T004: server/utils/cardSearch/search.test.ts にparity testを作成
Task T005: server/utils/cardSearch/project.test.ts にprojection testを作成
Task T006: server/api/cards.get.test.ts にendpoint contract testを作成
Task T007: app/composables/useCardSearch.test.ts に取得testを作成
Task T008: app/pages/cards/index.test.ts にpage integration testを追加
```

## Parallel Example: User Story 2

```text
Task T015: server/utils/cardSearch/sort.test.ts にsort testを作成
Task T016: server/utils/cardSearch/paginate.test.ts にpagination testを作成
Task T017: server/api/cards.get.test.ts に制御parameter testを追加
Task T018: app/composables/useCardSearch.test.ts に再取得testを追加
```

## Parallel Example: User Story 3

```text
Task T023: app/composables/useCardSearch.test.ts にstate/retry testを追加
Task T024: app/pages/cards/index.test.ts にstate表示testを追加
```

---

## Implementation Strategy

### MVP First（User Story 1 Only）

1. Phase 1のparity fixtureを準備する
2. Phase 2のAPI型とdata sourceを実装する
3. Phase 3のtestを先に作成し、US1を実装する
4. US1のIndependent Testを実行し、検索条件→backend→先頭page表示を検証する
5. MVPとして停止・review可能な状態にする

### Incremental Delivery

1. Setup + Foundationalで共通境界を確立する
2. US1でbackend検索と先頭page表示をdeliveryする
3. US2でServer-side sort/paginationを追加して独立検証する
4. US3で非同期failure表示とretryを追加して独立検証する
5. Polishでcontract、quality gate、bundle境界を最終確認する

### Parallel Team Strategy

1. SetupとFoundationalを完了する
2. US1のtest群を責務別に並行作成し、domain→endpoint→UIの順で統合する
3. US1完了後、US2とUS3を並行して実装する
4. 両Story完了後にPolishを実施する

---

## Notes

- `[P]`は異なるfileまたは競合しない責務で、未完了taskに依存しない作業を示す
- `[US1]`、`[US2]`、`[US3]`はspec.mdのUser Storyへ対応する
- `any`を使用せず、入力cardとnormalized criteriaを変更しない
- 新規runtime dependency、DB abstraction、認証、履歴、Browser内検索fallbackは追加しない
- 各test taskは実装前にfailureを確認し、実装後にpassさせる
- 各taskまたは論理的なtask group単位でcommit可能な粒度を維持する

