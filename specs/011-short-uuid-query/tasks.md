---

description: "Short UUID検索条件の形式判定とURL保持・復元の実装タスク"
---

# Tasks: Short UUID検索条件の形式判定

**Input**: Design documents from `/specs/011-short-uuid-query/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/card-search-query.md`, `quickstart.md`

**Tests**: Constitution Principle II と仕様の検証シナリオに従い、共有validator、Parser/Builder往復、既存server-side意味論の回帰テストを含める。

**Organization**: User Story単位で実装・検証できるように整理する。

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 既存の検索Query実装とテスト構成を確認し、Featureの変更対象を固定する。

- [X] T001 `app/utils/search/cardSearchQuerySchema.ts`、`app/utils/search/cardSearchQueryParser.ts`、`app/utils/search/cardSearchQueryBuilder.ts`、`app/utils/search/cardSearchQueryTestFixtures.ts` の既存alias・collection処理とテストfixtureの対応関係を確認する
- [X] T002 [P] `app/utils/constants/search/items/cardTypeItems.json`、`productItems.json`、`factionItems.json`、`raceItems.json`、`effectActivationTypeItems.json`、`resistanceItems.json`、`illustratorItems.json` の現在のParameter値とShort UUID形式を棚卸しする
- [X] T003 [P] `server/utils/cardSearch/search.ts`、`server/utils/cardSearch/search.test.ts` の `ct/pd/fa/ra/il/eat/re/are` に関する既存server-side照合意味論を記録し、変更対象外として検証条件に反映する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全User Storyが参照する桁数・対象Parameter・形式canonical化の共通基盤を作る。

**⚠️ CRITICAL**: このフェーズ完了前にUser Story実装を開始しない。

- [X] T004 [P] `app/utils/search/cardSearchQuerySchema.ts` に `SHORT_UUID_LENGTH = 5`、Short UUID対象alias/fieldの型付き定義、ASCII hexadecimalの形式判定と小文字canonical化を追加する
- [X] T005 [P] `app/utils/search/cardSearchQuerySchema.test.ts` に5桁固定、`0-9a-fA-F`、大文字小文字非区別、空値・桁数違い・非hex拒否、将来の桁数変更時に共有定義を参照できるvalidatorの単体テストを追加する
- [X] T006 `app/utils/search/cardSearchQuerySchema.ts` の共通定義をParser、Builder、Parameter/Mockデータ検証から参照できる形に整え、対象外Parameterの既存allowed-Set処理を維持する

**Checkpoint**: `SHORT_UUID_LENGTH` と共通canonicalizerを参照して、対象8 aliasの形式判定方針が一箇所に定まっている。

---

## Phase 3: User Story 1 - Short UUIDで検索条件を指定する (Priority: P1) 🎯 MVP

**Goal**: `ct/pd/fa/ra/il/eat/re/are` で、master dataの存在性とは独立して有効なShort UUIDを検索条件として保持し、既存server-side意味論へ渡す。

**Independent Test**: 対象8 aliasそれぞれについて、master dataに存在する5桁値と存在しないが形式上有効な5桁値をParserへ渡し、canonical値がSearchFormに残り、検索処理が既存のParameter固有照合へ値を渡すことを確認する。

### Tests for User Story 1

- [X] T007 [P] [US1] `app/utils/search/cardSearchQueryParser.test.ts` に対象8 aliasの大文字・小文字混在値、master dataに存在しない有効値、同一Parameter内の複数値・重複値を形式validator基準で復元するテストを追加する
- [X] T008 [P] [US1] `server/utils/cardSearch/search.test.ts` に存在するShort UUID、存在しないが形式上有効なShort UUID、複数値の既存OR、ct/fa/raの名称fallback、re/areのAffinity照合を確認する回帰テストを追加する

### Implementation for User Story 1

- [X] T009 [US1] `app/utils/search/cardSearchQueryParser.ts` のShort UUID対象8 aliasを選択肢Setのmembershipではなく共通形式validatorでsplit・trim・canonicalize・重複排除し、存在しない有効値を保持するよう変更する
- [X] T010 [US1] `app/utils/search/cardSearchQueryTestFixtures.ts` のShort UUID関連fixtureを5桁canonical値へ更新し、master data未存在の有効値を検証できる代表fixtureを追加する
- [X] T011 [US1] `server/utils/cardSearch/search.ts` は既存のID mapping、Natural Key、名称fallback、Affinity照合、Parameter間/Collection内の結合を変更せず、Parserから渡されたcanonical Short UUIDを既存評価へ受け渡せることを確認する
- [X] T012 [US1] `app/utils/constants/search/items/cardTypeItems.json`、`productItems.json`、`factionItems.json`、`raceItems.json`、`effectActivationTypeItems.json`、`resistanceItems.json`、`illustratorItems.json` と直接参照するMock/fixture値を5桁Short UUID仕様へ整合させる

**Checkpoint**: 既存master dataにない有効値もvalidation failureへ変換されず、既存検索意味論に渡る。

---

## Phase 4: User Story 2 - 有効な値をURLに保持・復元する (Priority: P1)

**Goal**: 有効なShort UUIDをURL Queryへ小文字canonical形式で出力し、Parser → Builderの往復で存在性に関係なく保持する。

**Independent Test**: 大文字入力、canonical値、master data未存在値、同一Parameterの複数値を含むQueryをParser/Builderで往復し、対象8 aliasの値が小文字5桁で安定出力され、他の検索条件と既存の結合規則が維持されることを確認する。

### Tests for User Story 2

- [X] T013 [P] [US2] `app/utils/search/cardSearchQueryBuilder.test.ts` にShort UUID対象8 fieldのlowercase canonical化、形式不正除外、重複除外、stable sort、未存在有効値保持、SearchForm非変更のテストを追加する
- [X] T014 [P] [US2] `app/utils/search/cardSearchQueryRouter.test.ts` にShort UUIDを含むURLのnavigation・再読込・再生成を追加し、Vue RouterのQuery境界でcanonical値が維持されることを確認する
- [X] T015 [P] [US2] `app/utils/search/cardSearchQueryParser.test.ts` と `app/utils/search/cardSearchQueryBuilder.test.ts` に `pd=22D7E,abcde` → `pd=22d7e,abcde` の往復および対象外Parameterの既存canonicalization回帰を追加する

### Implementation for User Story 2

- [X] T016 [US2] `app/utils/search/cardSearchQueryBuilder.ts` のShort UUID対象8 fieldを共通serializerへ切り替え、形式validator・小文字canonical化・重複排除・既存stable collection orderingを適用する
- [X] T017 [US2] `app/utils/search/cardSearchQueryParser.ts` と `app/utils/search/cardSearchQueryBuilder.ts` の対象8 alias/field対応を共有定義へ寄せ、Parser/Builder間の対象Parameter漏れを防ぐ

**Checkpoint**: URL Query → SearchForm → URL Queryで、形式上有効な値が存在性にかかわらず小文字canonical形式で保持される。

---

## Phase 5: User Story 3 - 不正値を安全に扱う (Priority: P2)

**Goal**: 不正なShort UUIDを無効値として除外しつつ、同じParameterや他Parameterの有効条件を失わない。

**Independent Test**: 有効値と、桁数違い・非ASCII hex・空member・大文字小文字混在値を同一Queryへ混在させ、無効値だけが除外され、有効値と既存の他条件が復元・canonical出力されることを確認する。

### Tests for User Story 3

- [X] T018 [P] [US3] `app/utils/search/cardSearchQueryParser.test.ts` に5桁未満/超過、非hex、空member、値の前後空白、有効値との混在、未知Parameterとの併存を追加する
- [X] T019 [P] [US3] `app/utils/search/cardSearchQueryBuilder.test.ts` にSearchForm内の不正Short UUID、重複canonical値、有効値との混在、Short UUID以外のNatural Key collection回帰を追加する

### Implementation for User Story 3

- [X] T020 [US3] `app/utils/search/cardSearchQueryParser.ts` で不正Short UUIDを除外し、同一Query内の他の有効member・他Parameter・既存last-wins/collection処理を維持する
- [X] T021 [US3] `app/utils/search/cardSearchQueryBuilder.ts` で不正Short UUIDをcanonical Queryへ出力せず、対象外Parameterの既存validationとcategory applicabilityを変更しない

**Checkpoint**: 部分的に不正なURLでも、無効値だけを安全に落とし、有効な検索条件を利用できる。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全要件、データ整合、型安全性、回帰をまとめて検証する。

- [X] T022 [P] `app/utils/search/cardSearchQuerySchema.test.ts` と `app/utils/constants/search/items/*.json` を使い、中央の `SHORT_UUID_LENGTH` を参照して7種類のParameter data（card type、product、faction、race、effect activation type、resistance、illustrator）の全値が形式に適合する検証を追加する
- [X] T023 [P] `app/utils/search/cardSearchQueryParser.test.ts`、`app/utils/search/cardSearchQueryBuilder.test.ts`、`server/utils/cardSearch/search.test.ts` の既存回帰テストとQuickstart代表ケースを実行する
- [X] T024 `app/utils/search/cardSearchQuerySchema.ts`、`cardSearchQueryParser.ts`、`cardSearchQueryBuilder.ts`、`cardSearchQueryTestFixtures.ts` のTypeScript strict typecheckとlintを実行し、`any`追加・対象外意味論の変更・入力Mutationがないことを確認する
- [X] T025 `specs/011-short-uuid-query/quickstart.md` と `specs/011-short-uuid-query/contracts/card-search-query.md` のケースを実装結果と照合し、必要なテスト名・実行パスを更新する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。既存実装・データの棚卸しを行う。
- **Foundational (Phase 2)**: Phase 1完了後。共通定義とvalidatorが全User Storyをブロックする。
- **User Story 1 (Phase 3)**: Phase 2完了後。存在する/しない有効値の検索条件保持を実装する。
- **User Story 2 (Phase 4)**: Phase 2完了後。US1のParser挙動を共有するが、Builder/Router検証は独立して実施できる。
- **User Story 3 (Phase 5)**: Phase 2完了後。US1/US2のvalidatorを共有し、無効値の部分復元を完成させる。
- **Polish (Phase 6)**: 実装対象のUser Story完了後。全体回帰・型検査・仕様照合を行う。

### User Story Dependencies

- **US1 (P1)**: Phase 2のみ依存。MVPの検索条件保持と既存server-side意味論の保護を提供する。
- **US2 (P1)**: Phase 2のみ依存。US1と並行して作業可能だが、Parser/Builder同一ファイルの変更は調整する。
- **US3 (P2)**: Phase 2のみ依存。US1/US2と並行してテストを先行できるが、最終統合は両P1ストーリー後に行う。

### Parallel Opportunities

- Phase 1ではT002とT003を並行実施できる。
- Phase 2ではT004とT005を並行設計・作成できる。
- US1ではT007/T008を並行してテスト作成できる。
- US2ではT013/T014/T015を並行してテスト作成できる。
- US3ではT018/T019を並行してテスト作成できる。
- 各User Storyのテスト作成は、共通validator（T004）完了後、別ファイル単位で並行可能である。

## Parallel Example: User Story 1

```text
Task: "対象8 aliasのParserケースを app/utils/search/cardSearchQueryParser.test.ts に追加"
Task: "既存server-side意味論の回帰を server/utils/cardSearch/search.test.ts に追加"
```

## Parallel Example: User Story 2

```text
Task: "Builderのcanonical出力を app/utils/search/cardSearchQueryBuilder.test.ts に追加"
Task: "Router境界の往復を app/utils/search/cardSearchQueryRouter.test.ts に追加"
Task: "Parser/Builderの代表往復を app/utils/search/cardSearchQueryParser.test.ts に追加"
```

## Implementation Strategy

### MVP First (US1)

1. Phase 1で既存の対象alias・データ・server-side意味論を確認する。
2. Phase 2で `SHORT_UUID_LENGTH` と共通形式validatorを完成させる。
3. Phase 3でParserとfixture/dataをShort UUID仕様へ整合させる。
4. **停止して検証**: US1の存在値・未存在有効値・既存検索意味論の回帰を確認する。

### Incremental Delivery

1. US1を実装して、Short UUIDを検索条件として保持できる状態にする。
2. US2を追加して、canonical URLの生成・復元・Router境界を完成させる。
3. US3を追加して、部分的に不正なURLの安全な復元を完成させる。
4. Polishで全テスト、typecheck、lint、データ整合、仕様照合を実行する。

### Notes

- `[P]` は別ファイルで実施でき、未完了タスクへの依存がないタスクにのみ付与している。
- `[US1]`〜`[US3]` は `spec.md` のUser Storyに対応する。
- Short UUIDの衝突検出・解決、UUIDv7生成、master data生成・削除、既存server-side検索意味論の変更はタスクに含めない。
- 全タスクは `- [X] Txxx [P?] [US?] ... file path` のチェックリスト形式で記述している。
