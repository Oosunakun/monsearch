# タスク: 検索結果のデック制限表示

**入力**: `specs/013-deck-restriction-display/` の承認済み `spec.md`・`plan.md`・`research.md`・`data-model.md`・`contracts/card-search-result.md`・`quickstart.md`
**前提**: Spec / Planは2026-10-16承認済み。既存のNuxt 4・Vue 3・Vuetify・TypeScript strict mode・Vitest・Vue Test Utilsを利用する。
**テスト**: Specの受入シナリオ、Planのテスト方針、Constitution IIに従い、projection・API・Componentの振る舞いを検証する。テストを先に追加し、対象実装前に期待する失敗を確認する。
**構成**: ユーザーストーリー単位で実装・検証する。実施状況は各タスクのcheckboxで記録する。

## 形式とパス

- `- [ ] Txxx [P?] [USx?] 説明とファイルパス` を使用する。
- `[P]` は、依存タスクの完了後に異なるファイルで並行作業できることを示す。
- `[US1]`・`[US2]` はSpecの同番号のストーリーに対応する。Setup・Foundational・最終調整には付けない。
- パスはrepository rootからの相対パス。既存アプリへ追加し、依存パッケージ・DB・新APIは追加しない。

## Phase 1: Setup — 既存動作の基準を確保する

**目的**: 追加前後を比較できるよう、実装に入る前に同一データ・queryでの基準を残す。

- [X] T001 `specs/013-deck-restriction-display/quickstart.md` に実装前のcommit・データ識別情報、代表カード検索・詳細検索・各sort keyの昇順/降順・ページ/表示件数変更・0件検索の比較用queryと既存レスポンスの保存先を記録する。比較用レスポンスを `specs/013-deck-restriction-display/verification/api-baseline.json` に保存し、itemsの全既存フィールドと件数・カテゴリ別件数・順序・ページ情報を後で同じ入力と比較できるようにする

## Phase 2: Foundational — Source型と必須DTO項目

**目的**: 全ストーリーに共通する型契約を用意する。このPhase完了後にストーリーへ進む。

- [X] T002 `types/cards/finderCards.ts` に `CardModification`（`deck_restriction_count: number | '' | null`）と必須nullableの `Card.modification: CardModification | null` を追加する。既存Cardの他フィールドとSource JSONを維持する
- [X] T003 `server/types/cardSearch.ts` の `CardSearchResultItem` に必須の `deck_restriction_count: number | null` を追加する。既存の手書きCard/DTO fixtureがあれば該当テストファイルで必須項目を補い、型assertionや `any` で欠損を隠さない。`server/utils/cardSearch/project.ts` の新項目未実装による型エラーはT007で解消する

**Checkpoint**: SourceとAPIの型が承認済み契約を表す。検索条件・URL Queryの型は変更しない。

## Phase 3: User Story 1 — 禁止・枚数制限のChipを確認する (P1) — MVP

**目標**: 各カード自身の値をAPIで返し、ヘッダー付近に `0`→「禁止」、`1`→「1枚制限」、`2`→「2枚制限」を表示する。

**独立した検証**: Sourceの `0`・`1`・`2`・`3`・`4`・値のnull・空文字・`modification: null` をprojection/APIで確認し、UIでは `0`・`1`・`2` のみChipが出る。PC・モバイル双方でカード名などの既存情報と一緒に読める。

### テスト（実装前に追加）

- [X] T004 [P] [US1] `server/utils/cardSearch/project.test.ts` に実カードを複製したメモリ上のfixtureによる表形式テストを追加する。`0/1/2/3/4` の数値保持、値のnull・空文字・`modification: null` のnull正規化、全ケースで必須項目が存在してカードが残ること、Source不変、`modification` 全体などの内部情報を公開しないことを検証する
- [X] T005 [P] [US1] `server/api/cards.get.test.ts` に実handlerを呼ぶ契約テストを追加する。`M20E-002`→0、`M20E-041`→1、`M20E-073`→2、`M20A-001`と`M20A-007`→nullを確認し、実データにない3・4・値のnullは `getSourceCards` 境界のメモリfixtureで検証する。すべての返却itemで必須のnumber/null項目があり、既存 `CARD_SEARCH_FAILED` 500契約も維持されることを確認する
- [X] T006 [P] [US1] `app/components/cards/result/list/ItemHeader.test.ts` を追加する。実ヘッダーをmountし、DTOの `0/1/2` のChip文言、`3/4/null` のChip非表示と代替文言なし、カード名など既存情報の維持、同じヘッダーへのprops更新によるChipの変更・消去を検証する。VuetifyのChipをstubする場合はslotを描画し、実際の表示文言をassertする

### 実装

- [X] T007 [US1] `server/utils/cardSearch/project.ts` の `projectCard` に返却対象カード自身の `modification.deck_restriction_count` を追加する。数値は0・3以上を含めてそのまま保持し、空文字・値のnull・改訂情報nullだけをnullに正規化する。truthiness判定・数値変換を避け、既存の必須フィールド検査と `projectCards` の除外条件を維持してT004・T005を通す
- [X] T008 [US1] `app/components/cards/result/list/ItemHeader.vue` に受け取った値の `0/1/2` との明示的一致によるVuetify Chipを追加し、既存情報と併せてヘッダー付近に配置する。PC・モバイルで折返し可能な最小限のスタイルとし、T006を通す。必要な場合のみ `app/components/cards/result/list/ItemDeckRestriction.vue` に表示を分離し、ヘッダー経由のテストを維持する
- [X] T009 [US1] `specs/013-deck-restriction-display/quickstart.md` にprojection/API/ヘッダーのテスト実行結果と代表カードのAPI確認結果を記録する。`npx vitest run server/utils/cardSearch/project.test.ts server/api/cards.get.test.ts app/components/cards/result/list/ItemHeader.test.ts` を実行し、未確認のPC・モバイル目視確認は完了扱いにしない

**Checkpoint**: US1を単独で検証でき、APIからヘッダーまでのMVPが成立する。

## Phase 4: User Story 2 — 一覧操作後も対応する制限を確認する (P1)

**目標**: 検索条件・表示順・ページ変更後もカードとChipの対応を保ち、既存検索結果を維持する。

**独立した検証**: 同一データ・queryについて新項目のみを除外したAPIレスポンスが実装前と一致する。同名・異なるID・異なる制限値のカードを並べ替えたり入れ替えたりしても、各カード自身のChipを表示する。0件時は既存の空表示となる。

### 回帰テストと統合検証

- [X] T010 [P] [US2] `server/api/cards.get.test.ts` に検索条件、`id/rarity/atk` の昇順・降順、page、`perPage=20/50/100`、0件を網羅する回帰テストを追加する。T001の `specs/013-deck-restriction-display/verification/api-baseline.json` と新項目のみを除いたレスポンスを比較し、itemsの全既存フィールド・ID/順序・`totalCount/categoryBreakdown/page/perPage/totalPages/sort` の一致を検証する。同名・異なるID・異なる制限値のメモリfixtureでも操作後のIDと値の対応を確認し、nullのカードが除外されないことを検証する
- [X] T011 [P] [US2] `app/components/cards/result/layout/ResultList.test.ts` を追加する。実 `ResultItem` と `ItemHeader` を含む描画で、同名・異なるID・制限値0/1/2/nullのカードを渡し、順序変更とページ相当のcards差替え後に各カードのChipが追従することを確認する。PC/モバイルの `useDisplay` を切り替え、無関係な本文・背景・操作UIのみ必要に応じてstubし、名前だけでChipを照合しない
- [X] T012 [P] [US2] `app/pages/cards/index.test.ts` に実ページの描画テストを追加する。`useCardSearch` の成功結果を差し替えて結果カードとChipが更新されること、0件時に既存の「該当するカードはありません」が表示され結果カードとChipが存在しないことを確認する。route query・composableの境界をmockし、既存のloading/error表示の検証を保つ
- [X] T013 [US2] `specs/013-deck-restriction-display/quickstart.md` の回帰確認手順に従いT010〜T012と既存の `server/utils/cardSearch/search.test.ts`・`server/utils/cardSearch/sort.test.ts`・`server/utils/cardSearch/paginate.test.ts`・`app/composables/useCardSearch.test.ts` を実行する。検索条件・sort・ページ/表示件数変更・ブックマーク再表示のURL Queryが維持されることも確認し、比較結果を同文書に記録する。失敗が今回の変更に起因する場合のみ該当するprojection/ヘッダーを修正する

**Checkpoint**: US2の操作・同名カード・0件ケースが検証でき、既存検索ロジックの変更なしで両ストーリーが成立する。

## Phase 5: 最終調整と横断的な確認

**目的**: 型・変更範囲・表示品質を確認し、Human Verificationの結果を明示する。

- [X] T014 `specs/013-deck-restriction-display/quickstart.md` に `npx nuxt typecheck`、変更したTS/Vueファイルに対するESLint、追加・変更テストの結果を記録する。`types/cards/finderCards.ts`・`server/types/cardSearch.ts`・`server/utils/cardSearch/project.ts`・`app/components/cards/result/list/ItemHeader.vue` を中心にdiffを確認し、別JSONとのjoin、日付チェック/バイパス、解除フラグ、`modification_text` の解析/表示、検索/URL変更、Source JSONや009 OpenAPIの変更が混入していないことを確認する
- [X] T015 `specs/013-deck-restriction-display/quickstart.md` のPC・モバイル手順を実施し、代表カード・長いカード名・非表示ケース・一覧操作後の表示をHuman Verification用に提示して結果を記録する。Humanから配置・配色の調整指示があれば `app/components/cards/result/list/ItemHeader.vue`（分離した場合は `app/components/cards/result/list/ItemDeckRestriction.vue`）へ反映し関連テストを再実行する。Human未確認ならその状態を明記し承認済みと記録しない

**T015結果（2026-10-17）**: PC・モバイルのスクリーンショットをHumanが確認し、Chipの配置・配色・視認性を承認した。現在の表示デザインで問題なく、今回の追加UI修正は不要。細かなデザイン調整は後日Humanが行う。検証記録は `quickstart.md` を参照。T001〜T015の全15タスク完了。

## 依存関係と実行順序

```text
T001 → T002 → T003
                 ├→ T004 ─┐
                 ├→ T005 ─┼→ T007 ─┐
                 └→ T006 ─┴→ T008 ─┴→ T009（US1 / MVP）
                                          ├→ T010 ─┐
                                          ├→ T011 ─┼→ T013（US2）→ T014 → T015
                                          └→ T012 ─┘
```

- Phase 1 → Phase 2 → US1 → US2 → 最終調整の順に進める。同優先度のUS2はUS1のAPI/Chipを操作下で検証するためUS1に依存する。
- T004・T005・T006は別ファイルで並行作成できる。各テストを実装前に実行し、期待した未実装による失敗を確認する。
- T007はT004・T005、T008はT006の後に実装する。T007とT008は型契約を共有して別ファイルで作業できるが、MVPの統合確認は両方の完了後に行う。
- T010はT005完了後の同ファイルへの追加であり、T005と並行編集しない。T010・T011・T012はUS1完了後に互いに並行作成できる。
- US2は既存の値の受渡しと `card_id` のkeyを検証する工程であり、根拠のない検索・sort・pagination処理の改修タスクを設けない。

## ストーリー別の並行実行例

### US1

```text
並行グループA（T003完了後）:
  T004: server/utils/cardSearch/project.test.ts
  T005: server/api/cards.get.test.ts
  T006: app/components/cards/result/list/ItemHeader.test.ts

対応する失敗テストを確認した後の並行グループB:
  T007: server/utils/cardSearch/project.ts
  T008: app/components/cards/result/list/ItemHeader.vue

全完了後: T009
```

### US2

```text
並行グループ（T009完了後）:
  T010: server/api/cards.get.test.ts
  T011: app/components/cards/result/layout/ResultList.test.ts
  T012: app/pages/cards/index.test.ts

全完了後: T013
```

## 実装戦略

1. 既存レスポンスの基準を保存し、Source型と単一の必須DTO項目を追加する。
2. US1のテスト・projection・ヘッダー表示を完了してMVPを検証する。最小提供範囲はUS1だが、Feature全体の完了にはUS2も必要。
3. US2で検索・並び替え・ページ操作・同名カード・0件の回帰を確認する。
4. 型とlint、変更範囲、PC・モバイルのHuman Verificationを確認する。自動テスト合格とHuman確認は区別して記録する。

## 要件の対応と完了条件

| 要件 | 主なタスク |
|---|---|
| FR-001: カード自身の値のみ | T002、T004、T007、T010、T014 |
| FR-002〜FR-005: 0/1/2の表示、3以上の保持、欠損の扱い | T004〜T008 |
| FR-006〜FR-007: 日付・解除フラグ・説明解析などを追加しない | T007、T008、T014 |
| FR-008: ヘッダー付近、PC・モバイル | T006、T008、T011、T015 |
| FR-009: 必須nullable数値の内部API契約 | T003〜T005、T007 |
| FR-010: 検索・sort・pagination・URLと対応関係の維持 | T001、T010〜T013 |
| SC-001〜SC-002 | T004〜T009 |
| SC-003 | T015（Human Verification） |
| SC-004 | T010〜T013 |

**集計**: 全15タスク。Setup 1、Foundational 2、US1 6、US2 4、最終調整2。`[P]` は6件。すべてのタスクに一意の連番ID・checkbox・具体的なファイルパスを付け、ストーリーフェーズの全タスクに対応するStoryラベルを付ける。
