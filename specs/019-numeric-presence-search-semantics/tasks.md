# Tasks — 数値条件の「すべて」と「なし」の検索動作

- Feature 019 · `fix/numeric-presence-search-semantics` · [Issue #34](https://github.com/Oosunakun/monsearch/issues/34)
- 入力は統合Human Reviewで **APPROVED** の [Spec](spec.md) と [Plan](plan.md)。
- **TasksのHuman ReviewはAPPROVED。25/25件完了、残タスク0件。** T001〜T021の実装・テストコード・文書更新と、T022〜T025のHuman検証は完了した。
- Planの「次工程」は統合Human Review時点の記述であり、実施結果と最終進捗は本書に記録する。

`[P]` は前提タスクの完了後に別ファイルで並行できる項目、`[USn]` はSpecのユーザーストーリーを示す。ファイルパスはリポジトリルート基準。受入条件 `USn-m` の末尾はSpecの各ストーリー内の番号。

## Phase 1 — 準備

既存のNuxt・Vue Router・Vitest環境を利用する。Feature 016を指す `.specify/feature.json` を保持し、Feature 019は読み取り専用のパス解決で確認した。テンプレートを直接参照して本書を作成した。実装時に承認済みの仕様・設計とコードやテストの間に新たな不整合が見つかった場合は、該当ファイル、再現条件または差分、影響する要件をHuman Reviewへ報告し、その判断に依存する変更は承認後に進める。 [Tasksテンプレート](../../.specify/templates/tasks-template.md) · [minimal-review](../../.specify/workflows/minimal-review.overlay.yml)

## Phase 2 — テストデータの準備

- [X] T001 `tests/fixtures/cardSearch/cards.ts` の `makeCard()` と `tests/fixtures/cardSearch/sources.ts` の `sourcesFor()` を基に、Matcher・Runner・APIで使うFeature 019専用の合成ケースと期待IDを用意する。テスト内で十分なケースは各テストに置き、複数のテストで共用するケースだけ `tests/fixtures/cardSearch/cards.ts` に独立したfactoryとして追加する。完了条件は、Unitと `Item` / `Equip`、Token、適用対象外、詳細・能力行・値の欠損、NULL、0、正負の値を識別でき、各期待IDを手で指定できること。既存factoryの既定値、歴史fixture、承認済みbaseline、公開カードデータを維持する。

## Phase 3 — US1 入力を保持して条件を切り替える（P1）

**独立検証**　「あり」で数値・演算子を選び、「すべて」または「なし」に切り替える。検索URLに出る条件と、同じフォームで「あり」に戻したときの値を確認する。

- [X] T002 [P] [US1] `app/utils/search/cardSearchQueryBuilder.test.ts` に7項目×4状態の表形式テストを追加する。完了条件は、比較値のある `all` で両Aliasを省略、`include` 単独と有効なComparison併記、比較値のある `exclude` でModifierのみとなることを7項目すべてで確認できること。0・負数、不正演算子・非有限値、Alias順序、フォーム非破壊、分類未指定・ユニット・装備品・Token・適用外分類の出力を含める。レベルは `lv` 単独と `lvm=include/exclude` の併記を別ケースで確認する。
- [X] T003 [P] [US1] `app/pages/cards/search.test.ts` に実コンポーネントでの入力保持の回帰テストを追加する。完了条件は、通常・追加・英雄点の代表項目で「あり → すべて → あり」「あり → なし → あり」の表示と数値・演算子が一致し、分類を切り替えても再表示時に保持されること。「すべて」「なし」で送信したときのURL、一括クリア後の既定値、およびレベル入力の常時表示も確認する。
- [X] T004 [US1] `app/utils/search/cardSearchQueryBuilder.ts` の `putFiltered` で、対象7項目とレベルのComparison出力規則を分ける。完了条件は、対象7項目の `all` で両Aliasを省略し、`include` でModifierと有効なComparison、`exclude` でModifierのみを出力すること。レベルの既定Modifier省略と有効な `lv` の出力は独立したままとし、既存の分類分岐、検証、順序、フォーム非破壊をT002・T003で確認できること。

## Phase 4 — US2 既存リンクで検索し、結果から条件を編集する（P1）

**独立検証**　`/cards?it=gte:2` と `/cards?he=eq:0` について、直接検索、条件編集、無変更の再検索、「あり」を選び直した再検索を比較する。

- [X] T005 [P] [US2] `app/utils/search/cardSearchQueryParser.test.ts` に7項目のComparison単独、明示 `all`、`exclude` とComparisonの併記を追加する。完了条件は、Modifier省略時に `all` と元の値・演算子を復元し、英雄点も `include` を合成せず、併記時は両方保持すること。不正・重複Aliasを含む場合も既存規則で復元し、他の有効条件を保持すること。Parser本体は既存処理を使う。
- [X] T006 [P] [US2] `app/utils/search/cardSearchQueryRouter.test.ts` にVue Routerを通したComparison単独URLの往復を追加する。完了条件は、元の検索URLと編集用Queryを復元でき、同じフォームからの新規送信は `all` なら比較を省略、`include` に変えれば両Aliasを出力すること。他の有効条件の維持と既存のエンコードの回帰も確認する。
- [X] T007 [P] [US2] `app/pages/cards/index.test.ts` に「条件を編集」の回帰テストを追加する。完了条件は、`it` または `he` だけの数値条件と併存する他条件が、元Queryと同じ値で `/cards/search` に渡ること。編集リンクでModifierの追加や比較の削除が起きないことも確認する。
- [X] T008 [US2] `app/pages/cards/search.test.ts` に `it=gte:2` と `he=eq:0` のSPA復元・直アクセス時の遅延復元・再読み込み相当の回帰テストを追加する。完了条件は、初期表示の「すべて」と非表示の比較値を確認し、無変更の送信で該当Aliasが省略され、「あり」で元の値・演算子から比較付きURLが生成されること。既存の `app/utils/constants/search/items/heroPointItems.json` の選択肢は1〜3のため、英雄点0の保持はフォーム状態と再送信URLで検証する。他条件と明示操作後の復元ガードが従来どおり動作することも確認する。画面本体は既存処理を使う。
- [X] T009 [P] [US2] `shared/cardSearch/runner.test.ts` にComparison単独の受信検索を追加する。完了条件は、対象7項目の有効なComparison単独と明示 `all` の併記が同じ期待ID集合に一致し、値なしは比較に一致しないこと。`he=eq:0` と `hem=include&he=eq:0` は `is_hero=false` かつ英雄点0のユニットを含むデータで区別する。

## Phase 5 — US3 「なし」で能力の対象カードだけを探す（P1）

**独立検証**　通常と追加の6項目について、Unit、Item・Equip、Token、その他の分類を含む集合から、値があるカード、値がないカード、適用対象外のカードを期待IDで区別する。

- [X] T010 [US3] `server/utils/cardSearch/search.test.ts` に通常・追加の6項目の適用判定を表形式で追加する。完了条件は、HD-01に従い、非TokenのUnitで `unit` / `unit.ability` 欠損を通常側、`Item` / `Equip` で `item.equip` / `item.equip.ability` 欠損を追加側の `exclude` に含められること。`item` が欠損するItem、戦闘スペル・地形・儀式・召喚術師・消耗品・錬金弾、反対側だけに適用可能なカードは除外する。Tokenは `is_token` と分類コードの両方から識別し、`unit` のみ、`item.equip` のみ、どちらもなしを確認する。各項目のNULL、値欠損、0、正負の値、`include` と比較のAND、`exclude` の比較無視、`cc` とのANDを期待IDで確認する。
- [X] T011 [US3] `server/utils/cardSearch/search.test.ts` に英雄点・即時召喚・レベル・所持枠の回帰を追加または補う。完了条件は、`is_hero` 真偽と英雄点NULL・0・正数の組み合わせで英雄点の単独比較と明示Modifierを区別し、`hem=exclude` が比較を評価しないこと。`lv` 単独と `lvm=include/exclude` 併記、通常・追加の所持枠 `none` では既存の適用対象・期待IDが維持されること。
- [X] T012 [US3] `shared/cardSearch/search.ts` の通常・追加6項目のMatcherに、HD-01の適用判定を追加する。完了条件は、`include` / `exclude` の両方で適用範囲を先に判定し、Unit・Item/Equipの詳細欠損、Tokenの対応詳細、対象外カードをT010の期待どおり扱うこと。受信Comparison単独・明示 `all` の比較経路、英雄点・レベル・所持枠の既存分岐をT009・T011で確認できること。

## Phase 6 — CSRとAPIの共通検索

- [X] T013 `server/api/cards.get.test.ts` に実HTTPハンドラーとCSRの正規化 → 共通Runnerの比較を追加し、`app/composables/useCardSearch.test.ts` の既存Query伝達テストを回帰確認の対象に含める。完了条件は、同一合成データでComparison単独、通常・追加の `exclude`、英雄点、レベル、他条件併記を比較し、同一の一致ID・件数・分類集計・ページ結果が両経路で得られること。両経路の一致に加えて手書き期待値でも照合する。

## Phase 7 — 正式仕様と利用者向け文書

- [X] T014 [P] `docs/architecture/query_specification.md` の§2.3・§2.4.1、§3.5、§4.6、§7.1–7.3を更新し、§1.2・§6.2の互換性記述を照合する。完了条件は、英語の本文・表・例が7項目のcanonical生成、Comparison単独URLの受理、編集再送信時の意味の変化、Parser・Builderの責務、`lvm` と `lv` の独立性について一致すること。
- [X] T015 [P] `docs/architecture/query_data_specification.md` の§2.3、§5.2–5.3、§9–10に能力照合を反映する。完了条件は、6項目の `include` / `exclude`、HD-01の非Token・Token・詳細欠損、NULLと0、比較単独の受信評価、英雄点・レベルの例外が本文・例で一致すること。
- [X] T016 `docs/architecture/query_data_specification.md` の§1.1・§4.2・§10にあるShort UUIDの旧記述をFeature 011の契約に基づいて訂正する。完了条件は、ASCII 16進固定5文字、大文字小文字を区別しない受理、小文字canonicalに統一され、Short UUIDのParser・Builder・Matcherに関する挙動変更が差分にないこと。
- [X] T017 [P] `docs/architecture/query_data_specification_note.md` のD8・D27・D35–D38・D63と、`docs/architecture/query_data_specification_revision_candidates.md` の数値Modifier・UUIDの関連節へ改訂注記や正式仕様への参照を加える。完了条件は、受信とフォーム再送信、HD-01、`exclude` とComparison併記、レベル・英雄点、Short UUIDの現行規則にたどれ、当時の判断経緯が読めること。
- [X] T018 [P] `specs/002-query-builder/contracts/card-search-query.md` と `specs/005-search-condition-edit/contracts/search-condition-edit.md` の整合注記と往復保証を更新する。完了条件は、既存の言語に合わせ、Comparison単独URLの受信時の意味と `all` による編集後の省略を区別し、正式仕様とFeature 019を参照できること。
- [X] T019 [P] `specs/010-numeric-presence-search/contracts/numeric-presence-query.md`、`specs/010-numeric-presence-search/spec.md`、`specs/010-numeric-presence-search/data-model.md`、`specs/010-numeric-presence-search/quickstart.md` に改訂注記または現行契約への参照を追加する。完了条件は、比較単独受信、フォームでの新規URL、適用範囲、入力の再表示条件を正式仕様へ照合でき、Feature 010の過去の計画・調査・タスクの履歴が保持されること。
- [X] T020 [P] `README.md` の「主な機能・検索方法」に、数値条件の「すべて」は絞り込まないこと、「なし」は能力の適用対象内を探すこと、Comparison単独URLは直接検索できること、編集後の再検索は画面のModifierに従ってURLを再生成することを簡潔に追記する。完了条件は、4点が利用者向けに読め、詳細を `docs/architecture/query_specification.md` の相対リンクから確認できること。
- [X] T021 `docs/architecture/query_specification.md`、`docs/architecture/query_data_specification.md`、T017–T020の各文書を `specs/019-numeric-presence-search-semantics/plan.md` のドキュメント検証と照合する。完了条件は、`it=gte:2` の直接検索と2通りの再検索、`itm=exclude` / `aitm=exclude` の対象と欠損、`lvm=exclude&lv=gte:2`、Short UUIDの形式が現行記述と例で一致し、README・関連文書から正式仕様へのリンクが解決すること。古い記述を履歴として残す場合は確定仕様への参照を確認する。

## Phase 8 — Humanによる検証

- [X] T022 [P] Humanが `package.json`、`vitest.config.ts` に従い、下記の個別テストを実行する。完了条件は、Builder・Parser・Router・画面・Matcher・Runner・APIの対象スイートが成功し、結果が本書に記録されること。
- [X] T023 [P] Humanが `package.json` のlintと `README.md` 記載のNuxt typecheckを下記コマンドで実行する。完了条件は、両方が成功し、コマンド別の結果が本書に記録されること。
- [X] T024 Humanが `package.json`、`vitest.config.ts` に従い全体テストを実行する。完了条件は、既存検索と他Featureの回帰を含む全体テストが成功し、結果が本書に記録されること。
- [X] T025 [P] Humanが `app/pages/cards/search.vue` と `app/pages/cards/index.vue` を開発環境のブラウザーで確認する。完了条件は、通常・追加・英雄点の代表項目で、入力保持・分類切替・「すべて」「あり」「なし」の送信、URL直アクセス・再読み込み・「条件を編集」、無変更再検索と「あり」に切り替えた再検索がSpecどおりであること。適用対象外が「なし」の結果から除外され、レベルの独立条件が動作することもURL・表示結果とともに記録する。実データに例がない欠損やTokenの境界はT022の合成テスト結果で照合する。

### Humanが実行するPowerShellコマンド

```powershell
npm.cmd test -- --run app/utils/search/cardSearchQueryBuilder.test.ts app/utils/search/cardSearchQueryParser.test.ts app/utils/search/cardSearchQueryRouter.test.ts
npm.cmd test -- --run app/pages/cards/search.test.ts app/pages/cards/index.test.ts app/composables/useCardSearch.test.ts
npm.cmd test -- --run server/utils/cardSearch/search.test.ts shared/cardSearch/runner.test.ts server/api/cards.get.test.ts
npm.cmd run lint
& ./node_modules/.bin/nuxt.cmd typecheck
npm.cmd test -- --run
npm.cmd run dev
```

実施後はT022–T025のIDごとに結果を記録する。失敗や未確認があれば、対象コマンドまたはURL、現象、本Featureへの影響を報告する。CSR/API一致の確認にはT013の開発・テスト環境を使う。 [READMEの配信構成](../../README.md)

### Human検証結果

| タスク | Humanからの報告 |
| --- | --- |
| T022 | 個別テスト **PASS** |
| T023 | lint **PASS**、typecheck **PASS** |
| T024 | 全体テスト **PASS** |
| T025 | `npm run dev` で実画面を確認し、問題なし |

T025のブラウザー確認項目は以下のとおり。

1. 通常・追加のイニシアチブ、チャージ、ディフェンダーの「なし」で、適用対象外のカード分類がヒットしない。
2. 「あり → すべて → あり」で数値と演算子を保持し、「すべて」では比較条件をURLから除外する。
3. 「あり → なし → あり」で数値と演算子を保持し、「なし」ではModifierだけをURLに出力する。
4. `/cards?it=gte:2` の直接検索、「条件を編集」、無変更の再検索は仕様どおりに動作する。
5. Comparison単独URLを編集して「あり」に変更すると、保持した比較条件が再検索のURLに出力される。
6. レベルと即時召喚Modifierは独立して動作する。
7. カード分類を切り替えると適用対象外の条件がURLから除外され、元の分類に戻すと値が保持されている。

記録はHumanから共有された結果に基づく。正確なテスト件数と実行ログは未共有。Feature 019に未決のHuman Decisionおよび残タスクはない。

## 要件・成功基準・受入条件との対応

| Specの受入条件・横断要件 | FR・SC | 対応タスク |
| --- | --- | --- |
| US1-1〜3 Modifierごとの出力と数値・演算子の保持 | FR-001〜003、SC-001 | T002–T004、T014、T020、T022、T025 |
| US2-1〜2 Comparison単独の直接検索・復元・新規検索 | FR-001、FR-004・005、SC-002 | T005–T009、T014、T017–T020、T022、T025 |
| US2-3 英雄点の単独比較と明示Modifier | FR-004・005・008、SC-002・003 | T005–T009、T011、T013–T015、T022、T025 |
| US3-1〜5 6項目の適用範囲、HD-01、Token、欠損、NULLと0 | FR-006・007、SC-003 | T001、T010、T012、T013、T015、T017、T019、T022、T025 |
| レベル・即時召喚・所持枠 | FR-009、SC-003 | T002–T004、T011–T015、T022、T025 |
| CSR/APIの一致 | FR-010、SC-004 | T001、T009、T013、T022、T024 |
| 正式仕様、関連契約、Short UUID、READMEの整合 | FR-001・004〜009、SC-001〜003、Planのドキュメント方針 | T014–T021 |

## 依存関係と実装順

- Tasks承認 → T001。T002とT003は別ファイルで並行でき、両方のテスト作成後にT004へ進む。Builderと入力保持を最初のレビュー単位とし、Featureの完了にはUS2・US3も必要。
- T004後にUS2のT005–T009を進める。T005・T006・T007・T009は別ファイルで並行できる。T008はT003と同じページテストを更新するため、T003の変更を取り込んでから着手する。
- US3はT001後にUS1・US2と並行できる。Matcherテストは同じファイルのT010 → T011の順とし、テスト作成後にT012へ進む。T013はT009・T012の後に、共通検索の両経路を検証する。
- T004・T012後に正式仕様のT014・T015を並行する。T016はT015と同じ文書のため順に実施する。正式仕様を揃えた後はT017–T020を別ファイルで並行し、T021で一括照合する。
- T013とT021まで完了した実装を対象に、HumanはT022・T023・T025を独立して確認できる。T024は対象テストT022の後に実施する。T022–T025の結果が揃うまで検証は完了扱いにしない。

## 実装後Human Reviewの記録

**APPROVED。25/25件完了、残タスク0件。** 現行仕様の正本は `docs/architecture/` に置き、完了済みFeatureの資料は当時の履歴として保存する。Query Data Specification系列の正式仕様・Decision履歴・改訂候補は、系列外の資料に頼らず理解できるように整理した。 [Planの実装後Decision](plan.md#実装後human-reviewの決定approved)

| タスク | 当初実施した作業 | 最終成果物での扱い |
| --- | --- | --- |
| T018 | Feature 002・005の契約を更新した | Human Reviewで履歴保全を優先し、Feature 019で加えた変更を撤回した |
| T019 | Feature 010の契約・Spec・データモデル・検証ガイドを更新した | Human Reviewで履歴保全を優先し、Feature 019で加えた変更を撤回した |

上記のチェック項目は当初計画と実施経緯として保持する。最終成果物はコミット `41e827d` に含まれ、Feature 002・005・010に対する変更は含まれない。ソースコードの実装と、T022〜T025の個別テスト・lint・typecheck・全体テスト・ブラウザー検証に対するHumanの承認を維持する。
