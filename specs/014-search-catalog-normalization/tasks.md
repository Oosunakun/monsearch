---
description: "Search Catalog Normalizationの依存順タスク"
---

# Tasks: Search Catalog Normalization

**入力**: `specs/014-search-catalog-normalization/` の承認済み `spec.md`、`plan.md`、`research.md`、`data-model.md`、`contracts/catalog-search.md`、`contracts/acceptance-evidence.md`、`quickstart.md`。

**参照**: `docs/architecture/query_search_normalization_memo.md` H1〜H10、`AGENTS.md`、`CONTEXT.md`、`.cursorrules`、`.specify/memory/constitution.md`。正式QDSは参照用であり、承認済みの暫定例外を上書きしない。

**Feature**: `014-search-catalog-normalization`。文書上のBranch表記 `feature/search-catalog-normalization` を維持し、新Feature・ブランチは作成しない。

**Human Review原則**: TasksのHuman Review承認前にImplementationを開始しない。承認後は承認済みのSpecification・Plan・Tasksに従って実装・検証を進める。

**Tests**: Specification FR-010/011・SC-001〜004、Plan・受入契約で明示された自動テストを含める。各Storyのテストを対応する実装変更より先に追加し、想定した契約差による失敗を確認してから実装する。環境起因の失敗を期待したテスト失敗と扱わない。

## 形式とパス

- `- [ ] Tnnn [P?] [USn?] 説明とファイルパス` を使用する。
- `[P]` は、明記した前提を満たした後、同一グループの別ファイル作業と並行できるタスクだけに付す。Story間で同じファイルを変更する作業は直列にする。
- 全パスはRepository root相対。`verification/` の記録先はすべて `specs/014-search-catalog-normalization/verification/` 配下とする。
- 既存Nuxt/TypeScript strict/Vitest構成を使い、依存追加・更新、UI追加、永続モデル・cache・索引の追加を行わない。
- `app/utils/mockData/items/cards.json` は読取入力。原文・JSON・is_token・正式QDS・Decision履歴を変更しない。提供工程の調査・作業、定量性能測定、公開・deploy、Git commit / pushはタスクに含めない。

## Phase 1: Setup — 入力識別と既存baseline

**目的**: 実装前の同一入力・既存失敗を保全する。既存プロジェクトの再初期化は不要。

- [X] T001 `app/utils/mockData/items/cards.json` を読取り、path・version・カード件数・card_id対応・両catalogの存在／型／空値状態を `specs/014-search-catalog-normalization/verification/data-audit.json` に記録する。現行482件の事前PASSと今回の確認結果を区別し、固定点の実装後確認はT012/T017へ委ね、再提供待ちGateやruntime補修を追加しない。
- [X] T002 `specs/014-search-catalog-normalization/quickstart.md` §1の既存Unit/API・フォーム／検索ページ回帰コマンドを実装前に実行し、catalog条件なしの代表queryごとの全ID・順序・件数・分類・ページ・応答項目を `specs/014-search-catalog-normalization/verification/baseline.json`、command・exit code・既存失敗を同 `verification/baseline.log` に保存する。T001の入力に紐づけ、古い別Featureのbaselineだけで代用しない。

**Checkpoint**: 受領済み入力を識別でき、catalog条件なしの回帰と、旧catalog無視・連結依存のテスト失敗を区別できる。

## Phase 2: Foundational — 共有型と独立oracle

**目的**: 両Storyが共用する境界を確定する。Phase 1完了後に開始する。

- [X] T003 [P] `types/cards/finderCards.ts` の `SearchSupport.full_text` と `archetype_text` を `?: string | null` として定義し、正常入力はN₀済みstring、optional/nullableは欠測fixtureの境界である旨を記す。`is_token: boolean`、`FinderCards.version`、公開DTOを維持し、`any` を導入しない。
- [X] T004 [P] `specs/014-search-catalog-normalization/verification/expected-catalog-results.json` に、受領JSONを直接読んで選定したkw・att・併用のqueryと固定期待全card_id集合、固定fixture A/Bと境界例の入力・期待IDを定義する。catalogだけの語／表示だけの語を分離し、期待値を本番normalizer・matcherから生成しない。実データに陽性例がないケースは明示してfixtureで補う。

**Checkpoint**: 両専用値の型と、実装から独立した期待集合が揃う。新規データ基盤は不要。

## Phase 3: User Story 1 — catalogによるキーワード検索（P1、MVP）

**目標**: kwがN₀変換済み検索語で `search_support.full_text` だけをliteral部分一致検索する。

**独立テスト**: kwだけを指定し、Ｍ２０Ａ－００１／m20a-001、主要記号・半角カナ、catalog固有語、表示だけの語、欠測・空条件・未正規化targetで固定期待全ID集合をUnit/API双方から検証できる。

### テスト・固定vector（実装より先）

- [X] T005 [P] [US1] `server/utils/cardSearch/normalizeCatalogText.fixtures.json` に `id/input/expected` 形式の固定vectorを仕様から定義する。全角ASCII94・半角カナ等63・全角空白1・その他幅対応14の計172文字、ASCII大文字26文字、混在例、U+FFE3→U+00AF、U+FF60/FFA0/FFE7/FFEF、非ASCII大小・supplementary code point、内部連続空白・改行・タブ、非同一視、ｶﾞ/ﾊﾟの非合成を含める。結合記号等はescapeで識別し、本番変換から期待値を作らない。
- [X] T006 [P] [US1] `server/utils/cardSearch/search.test.ts` の旧kw連結・catalog無視期待を新契約へ置き換え、T004の固定期待ID、catalogだけ／表示だけの語、欠損/null/空文字、未指定／Parser後空、未正規化targetを補修しない例、literalの `* + ( ) [`、内部空白・改行・タブ、非同一視、カナ非合成、他条件ANDを追加する。無関係な既存失敗の期待値は変更しない。
- [X] T007 [P] [US1] `server/api/cards.get.test.ts` にkwの固定fixture／実データ全ID集合の契約テストを追加し、kwの期待を `matchesCardSearch` 等から算出する自己比較を置き換える。全ページを巡回して固定全ID集合・順序・件数を比較し、代表ラベル・記号・半角カナ・欠測・literal・非同一視・target非補修を確認する。
- [X] T008 [US1] T005完了後、`server/utils/cardSearch/normalizeCatalogText.test.ts` にvector全数の固定期待一致、指定範囲の網羅性、N₀(N₀(x))=N₀(x)、trimなし・内部空白保持・非ASCII小文字化なし・カナ合成なしのテストを追加し、T006/T007とともに実装前の期待失敗を確認する。

### 実装とStoryの検証

- [X] T009 [US1] `server/utils/cardSearch/normalizeCatalogText.ts` に純粋関数 `normalizeCatalogText(value: string): string` を実装する。限定幅変換後にASCII A〜Zだけを小文字化し、NFC/NFKC・カナ合成・汎用case conversion・trim・内部空白圧縮を行わず、既存Effect正規化には手を加えない。
- [X] T010 [US1] `server/utils/cardSearch/search.ts` に `createCardSearchMatcher(criteria)` を導入し、有効なkeywordをfactory内で一度だけN₀変換してclosureに保持する。kwをfull_textへの直接includesへ切り替え、欠測非ヒット・空条件skipとし、`keywordVisibleText`／旧kw照合helperを廃止する。`matchesCardSearch` は単一カード用互換wrapper、`searchCards` は走査前factory一回＋predicateのfilterへ変更する。attはT016で切り替え、他条件・Effect正規化・Token判定を維持する。
- [X] T011 [US1] `server/api/cards.get.ts` をParser後・filter前の `createCardSearchMatcher(criteria)` 一回呼出へ接続し、filter内で単一カードwrapperを呼ばないようにする。`sourceIndex`、filter→sort→paginate→project、集計、エラー契約、応答DTOを維持し、`server/api/cards.get.test.ts` の旧helper名に固定された構造期待を実際のfactory境界へ更新する。
- [X] T012 [US1] `server/utils/cardSearch/normalizeCatalogText.test.ts` へ受領 `app/utils/mockData/items/cards.json` のfull_textの全件存在・string型・空値状態・N₀(value)=valueを確認する入力契約テストを追加する。正常入力の契約とT006の欠測境界を区別し、結果を `specs/014-search-catalog-normalization/verification/data-audit.json` に反映する。
- [X] T013 [US1] `server/utils/cardSearch/normalizeCatalogText.test.ts`、`server/utils/cardSearch/search.test.ts`、`server/api/cards.get.test.ts` のUS1対象を実行し、固定vector・kw全期待ID集合・件数・順序、意図した旧対象との差、既存失敗／新規差分を `specs/014-search-catalog-normalization/verification/us1.md` に記録する。

**Checkpoint**: kwの対象切替をAPIまで独立検証できる。MVPはPhase 1〜3だが、Feature全体完了にはUS2・US3と最終検証が必要。

## Phase 4: User Story 2 — archetype専用値による検索（P2）

**目標**: attが表示種族・カード種別の連結値を使わず、 `search_support.archetype_text` だけを検索する。

**独立テスト**: att単独で専用値だけの語が一致し、表示種族・カード種別だけの語は不一致となる。kw・att併用では固定期待集合の共通部分だけを返す。共用実装がUS1にあるため、その完了後に開始する。

### テスト（実装より先）

- [X] T014 [P] [US2] `server/utils/cardSearch/search.test.ts` の旧archetype連結期待を置き換え、T004の専用値だけ／表示種族・カード種別だけの語、欠損/null/空文字、空条件skip、英字大小・文字幅、literal・内部空白・非同一視・カナ非合成、未正規化targetの非補修、kw/att/他条件のANDを固定IDで検証する。Quick Searchのrace-type→att経路も新catalog fixtureで維持する。
- [X] T015 [P] [US2] `server/api/cards.get.test.ts` にatt単独・kw併用の固定fixture／実データの独立期待全ID集合テストを追加する。全ページのID・順序・件数を比較し、欠測・表示だけの語・文字幅・literal・非同一視・カナ非合成・target非補修を確認して、T014とともに実装前の期待失敗を確認する。

### 実装とStoryの検証

- [X] T016 [US2] `server/utils/cardSearch/search.ts` のfactoryで有効なarchetypeTextも一度だけN₀変換し、archetype_textへの直接includesへ切り替える。`archetypeVisibleText`／旧att照合helperを廃止し、kwと同じ欠測・空条件規則を適用する。API・searchCardsは既存のprepared matcherを共用し、Token／Effect／他条件を変更しない。
- [X] T017 [US2] `server/utils/cardSearch/normalizeCatalogText.test.ts` に受領JSONのarchetype_text全件の存在・string型・空値状態・N₀固定点を確認する入力契約テストを追加し、両専用値の確認結果を `specs/014-search-catalog-normalization/verification/data-audit.json` に揃える。入力不適合時もJSONやruntimeで補修しない。
- [X] T018 [US2] `server/utils/cardSearch/search.test.ts`、`server/utils/cardSearch/normalizeCatalogText.test.ts`、`server/api/cards.get.test.ts` のUS2対象とUS1回帰を実行し、att／kw併用の固定全ID集合・正常入力と欠測境界・既存差分分類を `specs/014-search-catalog-normalization/verification/us2.md` に記録する。

**Checkpoint**: att単独とkw併用の新契約を検証でき、US1の検索を保持する。

## Phase 5: User Story 3 — 原文と既存検索を保って負荷を軽減する（P2）

**目標**: 入力・URL・表示原文・既存検索を維持し、両bulk経路の走査中にcatalog全文生成・再正規化・query再変換がないことを自動検証する。factoryとAPI接続の実装はT010/T011/T016で行い、本Storyで専用受入条件を確認する。

**独立テスト**: T002の同一入力baselineに対してcatalog条件なしの結果を比較し、Unit/APIでqueryのN₀呼出時点・引数・回数を観測する。CPU時間やブラウザー操作を判定に用いない。

### 構造・保持・回帰テスト

- [X] T019 [P] [US3] `server/utils/cardSearch/search.test.ts` にnormalizerのspy等でfactory準備時のkw/att各一回、predicate反復中の追加呼出ゼロ、未指定／空queryの呼出ゼロを確認するテストを追加する。kwのみ・attのみ・併用・両方空とカード数増加・空配列を検証し、`searchCards` が走査前に準備すること、単一カードwrapperの互換動作、別requestのqueryをglobalに保持しないこと、未正規化target非補修と表示値非代用を確認する。
- [X] T020 [P] [US3] `server/api/cards.get.test.ts` に実handlerのnormalizer呼出観測を追加し、有効な各queryがカード参照／判定前に一回だけ変換され、走査中ゼロ・カード数増加でも不変となることを確認する。kwのみ・attのみ・併用・空条件・空データを含め、targetがnormalizer引数に渡らず、全件wrapper反復・全文生成に戻らないことをfixture結果と併せて検証する。
- [X] T021 [P] [US3] `app/utils/search/cardSearchQueryParser.test.ts` にkw/attの全角・大小・半角カナ・内部空白・改行・タブ・複数query値を含む例を追加し、既存の末尾値選択・前後trim以外にN₀を入力表現へ適用しないことを確認する。Parser本体への照合用変換の移設は行わない。
- [X] T022 [P] [US3] `app/utils/search/cardSearchQueryBuilder.test.ts` にkw/attの原表現と内部空白・改行・タブを維持するURL query生成／解析round tripを追加し、既存前後trimを保持してSearchFormを変更しないことをsnapshot等で確認する。Builder本体へのN₀適用は行わない。
- [X] T023 [US3] T019完了後、`server/utils/cardSearch/search.test.ts` へcriteria・カード原文不変、nm/rlの既存小文字化、etxのnormalizeQdsText・カナ合成・効果本文のみ・同一Effect条件、数値・枠・コストとのAND、同名別カードの独立判定、is_tokenと既存Token分類を確認する回帰を補完し、catalog条件なしの全ID・順序をT002のbaselineと比較する。
- [X] T024 [US3] T020完了後、`server/api/cards.get.test.ts` にcatalog条件なしのT002 baseline比較と、catalog条件ありの独立oracle比較を分けて追加する。items・totalCount・categoryBreakdown・全sort key/asc/desc・perPage=20/50/100・page境界・totalPages・応答項目・CARD_SEARCH_FAILEDを確認し、入力原文のprojection保持、catalogが公開DTOへ漏れないこと、Token分類と既存集計を維持することを検証する。
- [X] T025 [US3] `server/utils/cardSearch/search.ts` と `server/api/cards.get.ts` の最終呼出経路をT019/T020に照らして確認し、構造テストが失敗するFeature内の箇所を修正する。`normalizeQdsText`／`normalizeEffectText`／`composeKanaMarks`／`textIncludes` の既存挙動を保持し、`server/utils/cardSearch/dataSource.ts`、`sort.ts`、`paginate.ts`、`project.ts` の責務・sourceIndexを維持する。不要なリファクタリングは行わない。
- [X] T026 [US3] `specs/014-search-catalog-normalization/quickstart.md` §2の対象Unit/APIと既存 `app/composables/useCardSearchForm.test.ts`・`app/pages/cards/search.test.ts` を実行し、入力・URL・フォーム独立状態・URL復元／遷移・原文・既存検索・呼出構造の結果、T002との既存失敗／新規差分を `specs/014-search-catalog-normalization/verification/us3.md` に記録する。

**Checkpoint**: SC-003/004をRepository内の自動検証で判定できる。query変換は各一回、対象全文生成・対象再正規化・走査中query再変換はゼロである。既存失敗・環境失敗を隠して全件成功としない。

## Phase 6: Polish — 横断品質確認と受入記録

**目的**: 全Storyの結果をG1〜G5へまとめる。全Story完了後に開始する。

- [X] T027 `specs/014-search-catalog-normalization/quickstart.md` §2に従って対象回帰、`npm run lint`、`npx --no-install nuxt typecheck`、`npm run build` を実行し、command・exit code・失敗内容を `specs/014-search-catalog-normalization/verification/quality.log` に保存する。同一最終コードで既に完了した対象回帰は記録を再利用できる。依存・設定・権限を独断で変更せず、環境失敗と実装不具合を区別する。
- [X] T028 [P] `specs/014-search-catalog-normalization/verification/qds-differences.md` にFR-012の暫定差異（catalog対象の事前N₀、kw/attのカナ合成省略、nm/rlの既存未対応）を覚書H1〜H10・§5と対応づけ、etx維持と正式QDS／D22/D23等の履歴を上書きしていないことを記録する。新たなDecision・外部作業・測定Gateは追加しない。
- [X] T029 [P] `specs/014-search-catalog-normalization/verification/structure.md` にT019/T020の呼出時点・回数・引数・fixture結果と、`server/utils/cardSearch/search.ts`／`server/api/cards.get.ts` の対象全文生成・対象再正規化の除去箇所を対応づけてG4・SC-004の証跡をまとめる。定量CPU・実機・ブラウザー速度を測定済みと記載せず、構造確認から実行環境の性能適合や公開可否を保証しない。
- [X] T030 `specs/014-search-catalog-normalization/verification/acceptance.md` にG1〜G4・SC-001〜004、通常品質検証、固定期待ID集合と旧対象との差、既存失敗／新規差分／環境失敗／未実施項目をまとめ、G5のHuman Review状態を記録する。`specs/014-search-catalog-normalization/tasks.md` の完了状態は実際の実行結果だけで更新し、事前データPASS・設計整合性・実装テスト成功を区別する。

**Checkpoint**: 全要件の実結果と未解決事項をHuman Reviewへ提示できる。

## 依存関係と実行順序

```text
T001 → T002
  → Phase 2: T003 ∥ T004
  → US1: (T005 ∥ T006 ∥ T007) → T008 → T009 → T010 → T011 → T012 → T013
  → US2: (T014 ∥ T015) → T016 → T017 → T018
  → US3: (T019 ∥ T020 ∥ T021 ∥ T022)
           T019 → T023、T020 → T024
           (T019〜T024完了) → T025 → T026
  → 最終: T027 → (T028 ∥ T029) → T030
```

- Phase 1は実装前baseline取得のため、すべてのコード変更に先行する。
- US1は他Storyに依存しない。US2はUS1のN₀・factory・API接続を再利用するためUS1後、US3は両catalogのbulk経路を検証するためUS2後とする。検証シナリオは各Storyで独立させるが、共有ファイル変更を無理に並行化しない。
- T008はT005の固定vectorを使用する。T009以降は対応するテストを追加し、期待した契約失敗を確認してから着手する。
- T012/T017はN₀実装後の受領入力固定点確認。T001は実装前の入力識別であり、固定点PASSを先取りしない。
- T023/T024はそれぞれT019/T020と同じテストファイルを変更するため、先行タスク完了後に行う。T025の実装修正後は関連テストを再実行する。
- T027は全Story後、T030はすべての検証と差異記録後。環境起因の失敗では根拠を保存し、承認済み範囲から逸脱する対処を行わない。

## Story別の並行実行例

以下は並行実行可能な作業の組合せを示す。`[P]` は複数Codexセッションの同時起動を必須としない。Windows Sandboxの運用上、Implementationは単一Codexセッションで依存順に順次処理する。この運用方針はFeature要件を追加するものではない。

| Story | 共通前提 | 並行できる作業 | 合流後 |
|---|---|---|---|
| US1 | T003/T004完了 | T005: vector JSON、T006: matcher test、T007: API test | T008でvector testと期待失敗を確認し、T009以降を直列実装 |
| US2 | T013完了 | T014: matcher test、T015: API test | T016でatt切替後、T017/T018 |
| US3 | T018完了 | T019: matcher構造、T020: API構造、T021: Parser、T022: Builder | T023はT019後、T024はT020後。全テスト追加後T025/T026 |

基盤のT003/T004、最終記録のT028/T029も互いに別ファイルで並行可能。T023とT024は相互には別ファイルだが、先行する構造テストの完了を確認してから開始する。

## Specification・設計との対応

| 要件／成功基準 | タスク | 参照契約・Human Decision |
|---|---|---|
| FR-001: kw対象 | T004、T006〜T007、T010〜T013 | catalog-search、G1/G2、H5/H6 |
| FR-002: att対象・正常入力と欠測型 | T003〜T004、T014〜T018 | data-model §1、catalog-search、G1/G2、H7 |
| FR-003/004: N₀全対応・非合成・非同一視・空白・冪等性 | T005、T008〜T009、T012、T017 | research §2、data-model §2/4、G2、H9 |
| FR-005: 対象全文生成・再正規化なし | T006〜T007、T010〜T012、T014〜T017、T019〜T020、T025、T029 | G1/G4、H5〜H7 |
| FR-006: literal・欠測・空条件・AND | T006〜T007、T010、T014〜T016 | catalog-search照合条件、G2 |
| FR-007: 入力・URL・原文維持 | T019、T021〜T024、T026 | G3、H1/H6 |
| FR-008: nm/rl/etx維持 | T023〜T026、T028 | G3、H2/H3 |
| FR-009: 分類・結果処理・公開契約維持 | T002、T011、T023〜T027 | G3、catalog-search、is_token対象外 |
| FR-010: 固定vector・入力契約・独立oracle | T001〜T002、T004〜T008、T012〜T015、T017〜T018 | G1/G2、H4/H8 |
| FR-011: 走査前query各一回 | T010〜T011、T016、T019〜T020、T025〜T026、T029 | G4、H6/H7 |
| FR-012: 正式QDSとの暫定差異 | T028、T030 | 覚書§5、H2/H3/H9/H10 |
| SC-001: 172文字＋26文字・冪等性・入力固定点 | T005、T008〜T009、T012〜T013、T017〜T018 | G1/G2 |
| SC-002: kw/att/併用の固定全ID集合 | T004、T006〜T007、T013〜T018、T024 | G2 |
| SC-003: 非catalog回帰・原文・API不変 | T002、T021〜T027 | G3 |
| SC-004: query各一回・全文生成／再変換ゼロ | T019〜T020、T025〜T026、T029 | G4 |
| G5: 自動確認・未実施・Human Review状態の区別 | T027〜T030 | acceptance-evidence、H8 |

## 実装戦略とHuman Review

1. TasksのHuman Review承認後、承認済みのSpecification・Plan・Tasksに従ってPhase 1の入力・baselineを保全し、Phase 2を整える。
2. Phase 3を最小の検証可能なMVPとして実装し、US1の固定期待値と全ID集合を確認する。これはFeature全体の完了を意味しない。
3. Phase 4でattとkw併用を加え、US1の回帰を確認する。
4. Phase 5で両経路の呼出構造・既存検索・原文・URLの保持を検証し、Phase 6で通常品質検証とG1〜G5をまとめる。
5. 承認済みSpecification・Planから外れる問題が生じた場合は根拠と未解決事項を提示する。外部提供工程や定量性能Gateを追加しない。

## 履歴: 2026-10-25 Tasks生成時の静的確認

以下はTasks生成時点の確認結果であり、Implementationの操作指示ではない。以後の実装・検証には上記のHuman Review原則を適用する。

- 全30タスク（Setup 2、Foundational 2、US1 9、US2 5、US3 8、Polish 4）をT001〜T030で連番化し、各タスクに対象ファイルパスを付した。
- Story内の22タスクに対応する `[US1]`／`[US2]`／`[US3]` を付し、Story外のタスクには付していない。`[P]` は13タスク。
- FR-001〜012、SC-001〜004、G1〜G5、3つのStoryの受入条件と設計上の主要entity／内部関数を上表と各Phaseへ対応づけた。
- `.specify/extensions.yml` には `hooks.before_tasks`／`hooks.after_tasks` の登録がなく、Tasks用hookの実行対象はなかった。旧Workflowの再実行・resumeは実施していない。
- 設計上の未決事項・外部作業依存はなかった。Tasks生成時点では全タスク未着手で、Implementation・自動テスト・品質コマンドは未実施だった。Specification・PlanのHuman Reviewはユーザー申告により承認済みであり、タスク一覧をHuman Reviewへ提示した。
