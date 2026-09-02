---

description: "カードセット収録カード検索の実装タスク"
---

# Tasks: カードセット収録カード検索

**Input**: `/specs/008-open-card-set-results/` の設計成果物

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/card-set-navigation.md、quickstart.md

**Tests**: Constitution の Testability 原則および仕様の検証要件に従い、pure builder、UI navigation boundary、URL Query 復元の focused tests を含める。

**Organization**: 各ユーザーストーリーを独立して実装・検証できるよう、優先度順にタスクを編成する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 未完了タスクへの依存がなく、異なるファイルで並行実行できる
- **[Story]**: 対応するユーザーストーリー（US1、US2、US3）
- すべてのタスク説明に対象ファイルパスを明記する

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: brownfield の既存検証基盤と変更前の状態を確認する

- [X] T001 `package.json` の既存 script を使って `npm test -- --run`、`npx vue-tsc --noEmit`、`npm run lint` の変更前 baseline を確認する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全ユーザーストーリーが共有する、表示 identity と検索 identity を分離した型付き一覧データを用意する

**⚠️ CRITICAL**: この Phase が完了するまでユーザーストーリーの実装を開始しない

- [X] T002 `ProductRow` に required の `searchValue: Product` を追加し、検索 option 型を参照するよう `app/components/products/ProductTable.vue` を更新する
- [X] T003 [P] `productItems.json` の一意な許可値を各 row の `searchValue` に明示対応させ、重複している table `id` も一意にするよう `app/utils/mockData/indexPage.ts` を更新する
- [X] T004 [P] `productItems.json` の一意な許可値を各 row の `searchValue` に明示対応させるよう `app/utils/mockData/restrictions.ts` を更新する

**Checkpoint**: `/` と `/restrictions` の全一覧 row が、表示名や `id` から推測しない検索 identity を持つ

---

## Phase 3: User Story 1 - カードセットから収録カードを開く (Priority: P1) 🎯 MVP

**Goal**: `/` と `/restrictions` の desktop/mobile 一覧でカードセット名を選ぶと、その row のカードセット1件だけを `pd` 条件に持つ `/cards` を開く

**Independent Test**: 任意の有効なカードセット名を pointer または keyboard で選択し、起点画面や viewport にかかわらず `{ path: '/cards', query: { pd: searchValue } }` が生成され、同名 row はそれぞれ固有の値で区別されることを確認する

### Tests for User Story 1

- [X] T005 [P] [US1] 有効値、同名を想定した異なる許可値、Unicode 表示名、`pd` 以外を含まない出力、入力の不変性を table-driven test で定義する `app/utils/search/productSearchLocation.test.ts`
- [X] T006 [P] [US1] desktop/mobile のカードセット名が pointer/keyboard で同じ location を開く component test を追加する `app/components/products/ProductTableRow.test.ts`
- [X] T007 [P] [US1] `/` と `/restrictions` の同一 `searchValue` が同じ navigation contract に渡される page boundary test を追加する `app/pages/product-set-navigation.test.ts`

### Implementation for User Story 1

- [X] T008 [US1] `PRODUCT_VALUES` で検証した値だけを `{ path: '/cards', query: { pd: value } }` に変換し、事前 encode や既存 query の merge を行わない pure builder を実装する `app/utils/search/productSearchLocation.ts`
- [X] T009 [US1] 各 row の `searchValue` を共通 row component へ渡すよう table slot を接続する `app/components/products/ProductTable.vue`
- [X] T010 [US1] desktop/mobile のカードセット名だけを semantic link とし、builder の location を使って pointer/keyboard navigation を提供する `app/components/products/ProductTableRow.vue`

**Checkpoint**: User Story 1 が単独で動作し、両画面・両 viewport から同一 contract で収録カード検索を開ける

---

## Phase 4: User Story 2 - 結果がない場合も選択内容を確認する (Priority: P2)

**Goal**: 有効なカードセットは結果0件でも `pd` 条件を保持して既存の結果なし表示へ到達し、無効 row やカードセット名以外からは遷移しない

**Independent Test**: 収録カード0件の有効値では `/cards?pd=<value>` と既存 empty state が表示され、空・未知値、備考、発売日、略称、行余白の操作では navigation が発生しないことを確認する

### Tests for User Story 2

- [X] T011 [P] [US2] 空・未知の candidate が location を返さず bare `/cards` へ fallback しない fail-closed test を追加する `app/utils/search/productSearchLocation.test.ts`
- [X] T012 [P] [US2] invalid `searchValue` と備考・発売日・略称・行余白が navigation を開始しない desktop/mobile component test を追加する `app/components/products/ProductTableRow.test.ts`
- [X] T013 [P] [US2] 有効な `pd` で検索結果0件となる場合も query を保持して既存の結果なし表示を使う boundary test を追加する `app/pages/cards/index.test.ts`

### Implementation for User Story 2

- [X] T014 [US2] invalid location では link/navigation を生成せず productName の表示だけを維持する fail-closed 分岐を実装する `app/components/products/ProductTableRow.vue`

**Checkpoint**: User Story 2 が単独で検証でき、0件と不正入力を誤った全件検索から区別できる

---

## Phase 5: User Story 3 - 検索結果を再利用する (Priority: P3)

**Goal**: カードセット名から生成した canonical URL を reload、bookmark、別 tab、共有相当の新しい route state で開いても同じ1件の product 条件を復元する

**Independent Test**: builder が生成した location を memory router で開き直し、毎回 `parseCardSearchQuery` が `products: [searchValue]` とほかの既存 default fields を復元することを確認する

### Tests for User Story 3

- [X] T015 [P] [US3] product location の初回遷移、reload 相当、別 tab・bookmark・共有相当の fresh router で logical URL と percent encoding が安定する round-trip test を追加する `app/utils/search/cardSearchQueryRouter.test.ts`
- [X] T016 [US3] canonical `pd` の再読込時に `products` が選択した1件だけとなり、ほかの fields が既存 defaults へ戻る parser restoration test を追加する `app/utils/search/cardSearchQueryParser.test.ts`

**Checkpoint**: User Story 3 が Feature 固有 state なしで独立して検証でき、URL Query だけから検索条件を再現できる

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全ストーリーを横断する回帰、安全性、受け入れ条件を確認する

- [X] T017 `npm test -- --run`、`npx vue-tsc --noEmit`、`npm run lint`、`npm run build` を実行し、`package.json` に定義された既存品質 gate の回帰がないことを確認する
- [X] T018 `specs/008-open-card-set-results/quickstart.md` の manual/edge validation を `/`、`/restrictions`、desktop、mobile の matrix で実施する
- [ ] T019 SC-003 の選択から結果確認可能までの p95 と SC-004 の説明なし初回成功率を測定し、結果を `specs/008-open-card-set-results/quickstart.md` の Success Criteria Measurement に記録する
  - Human Acceptance: SC-003 は development server での測定では基準未達、SC-004 は個人開発のため定量的 usability session を実施していない。`npm run dev` による目視・操作確認でリンク識別性と実用上の応答性に問題がないことを確認し、人間判断により Feature を受け入れた。詳細は `quickstart.md` の Human Acceptance を参照。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし
- **Foundational (Phase 2)**: Setup 完了後に開始し、全ユーザーストーリーを block する
- **User Story 1 (Phase 3)**: Foundational 完了後に開始する MVP。共通 builder と navigation UI を提供する
- **User Story 2 (Phase 4)**: Foundational と User Story 1 の builder/UI 実装に依存する
- **User Story 3 (Phase 5)**: Foundational と User Story 1 の builder に依存し、User Story 2 には依存しない
- **Polish (Phase 6)**: 提供対象の全ユーザーストーリー完了後に実施する

### User Story Dependencies

```text
Setup → Foundational → US1 (MVP) ─┬→ US2 ─┐
                                  └→ US3 ─┴→ Polish
```

- **US1 (P1)**: 共通基盤完了後、ほかの story への依存なし
- **US2 (P2)**: US1 の location builder と row interaction を拡張する
- **US3 (P3)**: US1 の canonical location を既存 parser で再読込する。US2 と並行可能

### Within Each User Story

- 対応 test を先に追加して失敗を確認してから実装する
- typed row data → pure builder → table/row integration の順に接続する
- story の checkpoint を満たしてから次の優先度へ進む

### Parallel Opportunities

- T003 と T004 は T002 完了後に並行実行できる
- T005、T006、T007 は Foundational 完了後に異なる test ファイルで並行実行できる
- US1 完了後、US2 と US3 は並行実行できる
- T011、T012、T013 は異なる責務の test として並行実行できる
- T015 は US2 の作業と並行実行できる

---

## Parallel Example: User Story 1

```text
Task: "builder contract を定義する app/utils/search/productSearchLocation.test.ts"
Task: "desktop/mobile interaction を定義する app/components/products/ProductTableRow.test.ts"
Task: "両 page の contract 一致を定義する app/pages/product-set-navigation.test.ts"
```

## Parallel Example: User Story 2 と User Story 3

```text
Developer A: T011 → T012 → T013 → T014 (US2)
Developer B: T015 → T016 (US3)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 の baseline を確認する
2. Phase 2 で typed `searchValue` と両画面の row mapping を整備する
3. Phase 3 の test を先に失敗させ、builder と共通 UI を実装する
4. US1 の Independent Test を `/` と `/restrictions`、desktop と mobile で実施する
5. MVP としてレビュー可能な状態で停止する

### Incremental Delivery

1. Setup + Foundational → 一覧 row の検索 identity を確立
2. US1 → 有効なカードセットから検索結果を開く MVP
3. US2 → 結果0件と非 navigation 領域を保証
4. US3 → reload・bookmark・別 tab・共有での復元を保証
5. Polish → repository 全体の gate と成功基準を確認

### Parallel Team Strategy

1. Setup と Foundational を順に完了する
2. US1 の test 3件を異なる担当で並行作成し、builder/UI を依存順に統合する
3. US1 完了後、US2 と US3 を並行実装・検証する
4. 全 story の checkpoint 後に Polish を共同実施する

---

## Notes

- `[P]` は異なるファイルまたは独立した責務で、未完了タスクに依存しない作業を示す
- `[US1]`、`[US2]`、`[US3]` は spec.md の各ユーザーストーリーへ対応する
- `docs/architecture/query_specification.md` の canonical `pd` と既存 `PRODUCT_VALUES` / `parseCardSearchQuery` を Source of Truth とする
- Feature 固有 state、検索 engine、結果判定、既存 empty state は変更しない
- 各 test task は実装前に失敗することを確認する
- 各 task または論理的な task group ごとに commit する
