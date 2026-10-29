# タスク: 検索結果の並び順の拡張・整理

**入力**: `specs/015-search-result-sorting/` の spec.md、plan.md、research.md、data-model.md、contracts/search-result-sorting.md、quickstart.md

**作成日**: 2026-10-29

**状態**: Run `befa1dec`の`review-plan` Gate承認後、既存Spec Kit WorkflowがTasks・Implementationを実行し、実装・自動検証・隔離generateを実施。2026-10-29にT022生成物のローカル静的配信でのHuman確認PASS・Human Review APPROVEDを受領し、T023を含む**25/25タスク完了**。先行する`npm run dev`の確認結果は別の履歴として保持する。今回の記録更新ではSpec・PlanやWorkflow記録は変更していない。詳細は verification/summary.md と verification/human-ui.md。

**構成**: Setup → 共通基盤 → US1（P1）→ US2（P2）→ US3（P2）→ 横断検証。仕様の受入シナリオ・成功基準とPlanの検証要求に従い、テストタスクを含む。

## 形式とパス

各タスクは `- [ ] Tnnn [P?] [USn?] 説明とファイルパス` とする。パスはリポジトリルート相対。`[P]` は、明記された前提の完了後、別ファイルのタスクと並行実行できることを示す。同じファイルを更新するタスクは直列実行する。

本体の変更予定は `shared/cardSearch/types.ts`、`shared/cardSearch/sort.ts`、`app/components/cards/result/layout/ResultList.vue` の3ファイル。既存runner・composable・controls・server re-exportは既存動作を利用する。想定外の本体変更が必要なら理由と最小範囲を提示し、Schema・原データ・静的配信の変更が必要なら停止して確認する。

## Phase 1: Setup — 現状と保全対象の確定

**目的**: 新依存や新プロジェクトを作らず、既存環境と旧oracleの保全基準を記録する。

- [X] T001 branch/HEAD・開始差分・既存依存の準備状態を確認し、`app/utils/mockData/items/cards.json`、`package-lock.json`、Feature 014のSpec・Plan・oracle・検証記録、`server/api/fixtures/cards-response-baseline.json` の保全用hashを `specs/015-search-result-sorting/verification/implementation-baseline.md` に記録する
- [X] T002 `specs/015-search-result-sorting/verification/implementation-baseline.md` に `shared/cardSearch/runner.test.ts` と `server/api/cards.get.test.ts` の旧atk期待値利用箇所、維持するid/rarity完全応答・hash照合、既存テスト環境と隔離generate出力先を記録する（既存成果物を上書きせず、既存環境外の準備が必要なら先に確認する）

## Phase 2: Foundational — 共通の入力契約と独立期待値

**目的**: 全ストーリーの前提となる6キーと、実装に依存しない期待値を用意する。

- [X] T003 `shared/cardSearch/types.ts` の許可キー定数と派生unionを `id / level / atk / defense / initiative / rarity` へ拡張し、既存order・DTO構造・server側re-exportを維持する
- [X] T004 [P] `specs/015-search-result-sorting/verification/sort-fixtures.ts` に既存 `Card`・`SourceCard` 型を使う合成カードと手書き期待ID順を作成する（契約のUn/U0a/U0b/U5/En/E0/E3/N1/N2、level専用例、id/rarity例、NULL・親なし・全件欠損・両詳細併存を含め、comparator/runnerを期待値生成に使わない）

**チェックポイント**: T003・T004完了後、各ストーリーの作業を開始できる。T004はT003と別ファイルであり、既存型で作成できる。

## Phase 3: US1 — カードの特性で比較する（P1・MVP）

**目的**: 6項目・2方向の比較と表示名を提供し、集合・集計・カード内容を維持する。

**独立検証**: 合成カードの12組を手書き期待順と比較する。4数値キーのgroup固定・0/NULL・正負数・sourceIndex順、id/rarityの従来規則、入力非破壊を確認する。実データは015固定順序と014の不変DTO・集計を併用する。

### テスト・期待値（本体変更前に追加し、意図した失敗を確認）

- [X] T005 [P] [US1] `server/utils/cardSearch/sort.test.ts` にT004の固定例を使った6キー×2方向のテストを追加する（group固定、levelはunitのみ、0・負数・NULL・親なし、全件欠損、unit/equip併存時のunit優先・欠損時equip採用、シャッフル後のsourceIndex tie-break、idのcard_id比較、rarity未知=0、入力配列・card非破壊を含む）
- [X] T006 [P] [US1] `specs/015-search-result-sorting/verification/expected-sort-results.json` に実データの4数値キー×2方向の全件期待ID順を固定し、`specs/015-search-result-sorting/verification/oracle-provenance.md` に参照値・groupごとの独立確認方法と正本hashを記録する（旧atkのasc/desc×20/50/100に使える全件順を含め、本番sort/runner出力を転記しない）
- [X] T007 [P] [US1] `shared/cardSearch/runner.test.ts` に6キー受理・契約固定例・criteria非破壊を追加し、旧atk6ケースをT006の新順序と旧oracleの完全DTO・集合・分類集計で検証する形へ切り替える（旧id/rarity等の完全応答・hash照合を維持し、ケースをskipしない。T006完了後に実行）
- [X] T008 [P] [US1] `server/api/cards.get.test.ts` の旧 `unit.attack ?? 0` 由来の期待値を固定期待値へ置換し、6キー×2方向の合成契約・015実データ順序・CSR parityを検証する（旧atk6ケースの順序/hash要求だけを新版期待値へ移行し、旧DTO・集合・集計と不変ケースの完全照合を維持。T006完了後に実行）

### 実装・統合

- [X] T009 [US1] `shared/cardSearch/sort.ts` にlevel/unit.level、atk/unit.attack・equip.attack、defense/unit.defense・equip.defense、initiative/unit.ability.initiative・equip.ability.initiativeの値取得とgroup比較を実装する（unit有値→equip有値→値なし、levelはequip不使用、数値差のみ方向適用、同値はsourceIndex昇順、id/rarityと非破壊性を維持し、reverse・永続補助値・キャッシュを追加しない。T005〜T008の失敗確認後）
- [X] T010 [P] [US1] `app/components/cards/result/layout/ResultList.vue` の既存sortOptionsを「カードNo/id、レベル/level、攻撃力/atk、防御力/defense、イニシアチブ/initiative、出現頻度/rarity」の順へ更新し、既存共通props・watchを維持する
- [X] T011 [US1] `server/utils/cardSearch/sort.test.ts`、`shared/cardSearch/runner.test.ts`、`server/api/cards.get.test.ts` のfocused testを実行し、12組の比較・新旧oracleの使い分け・DTO/集計・parityの結果を `specs/015-search-result-sorting/verification/automated.md` に記録する

**チェックポイント**: 共通sortとUI選択肢が利用できるMVP。US2/US3固有の操作検証は後続で完了する。

## Phase 4: US2 — PC・モバイルで同じ設定を使う（P2）

**目的**: 両レイアウトで同一の選択肢・方向・適用状態を確認できる。

**独立検証**: 実際のPC/モバイルcontrolsを通じて6項目の名称・順序と12組の選択を検証する。初期id/ascと無効key/orderの個別補正を確認し、同じ入力の結果ID順が一致することを確認する。

- [X] T012 [P] [US2] `app/composables/useCardSearch.test.ts` に6キー×2方向の結果、初期id/asc、無効key＋有効order・有効key＋無効orderの個別補正と返却設定の反映を追加する（routeのsort復元・URL書込みは追加しない）
- [X] T013 [P] [US2] `app/components/cards/result/layout/ResultList.test.ts` のmount構成を調整し、ResultDisplaySettingsおよびDesktop/Mobile controlsを実コンポーネントとして通す（必要なVuetify環境・breakpointを既存テスト構成に合わせ、controls全体をstubしない）
- [X] T014 [US2] `app/components/cards/result/layout/ResultList.test.ts` にPC/モバイルの6名称・表示順、初期選択、6キー×2方向の操作・選択表示・適用結果の一致、補正済み設定の表示を追加する（T013後。T012のcomposable結果検証と結び付け、props列挙だけで完了させない）
- [X] T015 [US2] `app/composables/useCardSearch.test.ts` と `app/components/cards/result/layout/ResultList.test.ts` を実行し、両UIの実操作と設定補正の結果を `specs/015-search-result-sorting/verification/automated.md` に追記する

## Phase 5: US3 — 全結果を順序どおりに閲覧する（P2）

**目的**: 全件ソート後のページ順序と、操作時の設定保持・先頭ページ復帰を保証する。

**独立検証**: 全6キー×2方向×20/50/100件でページを連結し、固定全件順と照合する。中間・末尾・範囲外・0件・1件を確認し、PC/モバイルで項目・方向・件数変更のpage resetと設定保持を確認する。

- [X] T016 [P] [US3] `shared/cardSearch/runner.test.ts` に6キー×2方向×20/50/100件の全ページ連結、先頭・中間・最終・範囲外clamp、0件page=1/totalPages=1、1件の検証を追加する（固定ID順、重複欠落0、完全DTO、totalCount/totalPages/categoryBreakdown不変を照合。US1で改訂したテストを再利用する）
- [X] T017 [P] [US3] `server/api/cards.get.test.ts` にT016と同じページ境界・全ページ順・DTO/集計のAPI検証とCSR parityを追加し、旧atk6ケースの先頭・中間・末尾・範囲外を含む既存coverageが維持されることを確認する
- [X] T018 [P] [US3] `app/composables/useCardSearch.test.ts` に2ページ目以降からsort/order変更でpage=1・perPage維持、ページ移動でsort/order維持、20/50/100変更でpage=1・sort/order維持を追加する（ready・query変更・retry・世代管理・unmount保護の既存回帰と、sort変更によるJSON追加取得0・API fallbackなしも確認する）
- [X] T019 [P] [US3] `app/components/cards/result/layout/ResultList.test.ts` にPC/モバイルで2ページ目から項目・方向変更、ページ移動、20/50/100変更を実操作するテストを追加し、page resetと選択状態・表示件数・結果の整合を検証する（T014完了後）
- [X] T020 [US3] T016〜T019のfocused testを実行し、全ページ連結の期待順序・集合・DTOと両UIの操作結果を `specs/015-search-result-sorting/verification/automated.md` に追記する

## Phase 6: Polish — 横断検証と証跡

**目的**: 全ストーリーの品質とSSG＋CSR構成を検証し、自動実測とHuman確認を分けて報告する。

- [X] T021 `specs/015-search-result-sorting/quickstart.md` に記載のfocused test、`npm run test -- --run`、`npm run lint`、`.\node_modules\.bin\nuxt.cmd typecheck` を実行し、終了code・失敗原因・未実施を `specs/015-search-result-sorting/verification/automated.md` に記録する（失敗を期待値変更だけで隠さない）
- [X] T022 T002で決めた新しい隔離出力先で `npm run generate` を実行し、8ページと404、公開cards.jsonのbytes/SHA一致、no-cache、公開Worker/SSR renderer/API snapshot不在、全件JSONのJS/HTML/payload非埋め込みをimport経路と生成物の両面から監査して `specs/015-search-result-sorting/verification/static-generation.md` に実行場所・終了code・警告・根拠を記録する（設定や旧成果物を変更しない）
- [X] T023 [P] `specs/015-search-result-sorting/verification/human-ui.md` にquickstartのPC/モバイル確認手順と結果欄を用意し、ローカル静的配信で6項目×2方向、ページ操作、戻る/進む、検索条件変更、ダメージ149件・アーニャ3件、JSON追加取得0・通常API通信0・Console/HydrationエラーをHuman確認する（T022後。観測者と根拠を記録し、Human未確認は未確認とする）
- [X] T024 [P] `specs/015-search-result-sorting/verification/scope-audit.md` に最終差分とT001のhash再照合を記録し、正本JSON・Schema・検索条件・nuxt.config・public/_headers・lock・旧Feature 014のSpec/Plan/oracle/検証記録・旧API fixtureが不変であること、新依存・API公開・URL永続化の追加がないことを確認する
- [X] T025 `specs/015-search-result-sorting/verification/summary.md` にFR-001〜008・SC-001〜004とテスト/静的生成/Human画面証跡の対応、実施結果、残件、想定外変更の有無をまとめる（未実施をPASSにせず、T021〜T024の結果を参照する）

## 依存関係と実行順

```text
T001 → T002 → [T003 ∥ T004]
                    ↓
                  US1
                    ↓
               [US2 ∥ US3]
                    ↓
                 T021
                    ↓
                 T022 → T023
                    ∥ T024
                    ↓
                 T025
```

- US1は共通基盤に依存する。T005とT006は並行可能。T006完了後にT007/T008を並行で追加し、失敗確認後にT009を実装する。T010はT005〜T009のテスト/比較実装とファイル競合せず並行可能。T011はT005〜T010に依存する。
- US2はUS1のキー・比較・選択肢を利用する。T012とT013は並行可能。T014はT013、T015はT012/T014に依存する。
- US3はUS1の比較と独立oracleに依存する。T016/T017/T018は別ファイルで並行可能。T019はUS2のT014を再利用するため、この部分だけUS2に依存する。各ストーリーの受入結果は個別に判定できる。
- US2とUS3を並行する場合、同じ `useCardSearch.test.ts` はT012→T018、同じ `ResultList.test.ts` はT013→T014→T019の順にする。T015とT020による同じ検証記録への追記も直列で行う。
- 横断検証は全ストーリー完了後。T024はT021〜T023と並行可能だが、最終コード・テスト変更後に照合する。T023はT022の生成物を使う。T025は全記録が揃ってから行う。

## ストーリー別の並行実行例

| ストーリー | 並行できる作業 | 前提・競合回避 |
|---|---|---|
| US1 | T005 合成比較テスト ∥ T006 実データ固定期待値 | T003/T004後。T006後はT007 runner ∥ T008 API、失敗確認後はT009 comparator ∥ T010 選択肢 |
| US2 | T012 composable契約 ∥ T013 UI mount構成 | US1後。T013→T014を直列化 |
| US3 | T016 runnerページ ∥ T017 APIページ ∥ T018 composableページ ∥ T019 UIページ | US1後。T018はT012後、T019はT014後。同一ファイルの先行作業完了が条件 |

この表は実装時の作業分割例であり、このタスク生成でagentの起動や実装を行う指示ではない。

## 要件対応

| 要件・成功基準 | 主なタスク |
|---|---|
| FR-001 / SC-001（6項目・名称・順序） | T003、T005、T009、T010、T014 |
| FR-002・FR-005・FR-006 / SC-001（比較規則・欠損・安定順） | T004〜T009、T011 |
| FR-003 / SC-002（集合・DTO・集計・全件ソート） | T006〜T008、T016、T017 |
| FR-004 / SC-003（ページ・件数・設定保持） | T016〜T020 |
| FR-007 / SC-004（両UIの一致） | T010、T013〜T015、T019、T023 |
| FR-008 / SC-004（既定値・個別補正） | T012、T014、T015 |
| D2・静的構成・既存Lifecycleの維持 | T001、T002、T006〜T008、T018、T021〜T025 |

## 実装戦略

1. Setupと共通基盤を完了し、独立期待値と履歴保全の境界を確定する。
2. US1をMVPとする。比較規則の失敗テスト→最小本体変更→runner/API照合を完了し、6項目を利用可能にする。
3. US2で両レイアウトと補正表示を検証し、US3で全ページ順序・設定保持を検証する。ファイル競合を避けられる部分のみ並行化する。
4. 全体品質・隔離静的生成・Human画面確認を行い、証跡を分離してまとめる。実装範囲や業務判断の追加が必要なら独断で拡張しない。

## 完了時の判定

合計25タスク（共通基盤等4、US1 7、US2 4、US3 5、横断5）。MVPはPhase 1〜3。各チェックは実施後に更新し、環境制約による失敗は実装不具合と区別して根拠を記録する。権限昇格・Sandbox外実行など実行方法の変更は事前にユーザーへ確認する。






