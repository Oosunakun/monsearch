# 詳細検索「種族・タイプ」実装 Plan

対象は [Issue #32](https://github.com/Oosunakun/monsearch/issues/32)。作業ブランチは `feature/advanced-search-archetype`。ステータスは **APPROVED**（[機能仕様書](spec.md) と統合 Human Review 済み）。実装は [タスク一覧](tasks.md) のレビュー後に開始する。

## 1. 現状と問題の原因

- 詳細検索の `/cards/search` は、初期表示で開いている「基本情報」の `SectionCardShell` に `SearchFormBasic` を配置する。現在の表示順は「カード名 → カード分類 → 属性 → タイプ → キーワード」で、各行の間に `SearchFieldDivider` が入る。 [search.vue](../../app/pages/cards/search.vue) · [SearchFormBasic.vue](../../app/components/cards/search/layout/SearchFormBasic.vue)
- カード名とキーワードは、フィールドごとのコンポーネントで `defineModel<SearchForm>` を受け、`SearchRow` 内の `v-text-field` を対応プロパティへ直接バインドする。`SearchRow` が個別クリアボタンを表示し、各フィールドが文字列の長さで有効状態を決め、`reset` を受けて自分の値を `''` にする。Enter は `handleSearchEnter` を経由して `submit` を通知する。 [SearchFieldName.vue](../../app/components/cards/search/basic/SearchFieldName.vue) · [SearchFieldKeyword.vue](../../app/components/cards/search/basic/SearchFieldKeyword.vue) · [SearchRow.vue](../../app/components/cards/search/shared/SearchRow.vue) · [handleSearchEnter.ts](../../app/utils/search/handleSearchEnter.ts)
- 簡易検索は「種族・タイプ」を `race-type` として保持し、`buildQuickSearchQuery` が前後の空白を除いた値を `att` に割り当てて `/cards` へ遷移する。詳細検索モデルの `archetypeText` は既に `string` として定義され、`createSearchForm` の初期値は `''`。`useCardSearchForm` は渡された初期値のコピーをリアクティブな `ref` として保持する。 [useQuickSearch.ts](../../app/composables/useQuickSearch.ts) · [quickSearchQueryBuilder.ts](../../app/utils/search/quickSearchQueryBuilder.ts) · [search.ts](../../app/types/ui/search.ts) · [cardSearchFormFactory.ts](../../app/utils/search/cardSearchFormFactory.ts) · [useCardSearchForm.ts](../../app/composables/useCardSearchForm.ts)
- 検索結果ページは `route.query` を `ResultControls` に渡し、「条件を編集」が同じ query で `/cards/search` へ遷移する。詳細検索は `parseCardSearchQuery(route.query)` でフォームを初期化する。SPA 遷移で取得済みの query は即時に反映する。初回の hydration では、入力前かつページに留まっている場合に限り `onNuxtReady` で最新 query を再取得する。 [index.vue](../../app/pages/cards/index.vue) · [ResultControls.vue](../../app/components/cards/result/controls/ResultControls.vue) · [search.vue](../../app/pages/cards/search.vue)
- Issue の記載どおり、Parser・Builder・Matcher は `att` に対応済み。`SearchFormBasic` に `archetypeText` を参照する行がないため、復元した条件はそのまま再検索に使われる一方、詳細検索の利用者は値を確認・変更・解除できない。

## 2. 実装方針と採用理由

1. `basic/` に `SearchFieldArchetypeText.vue` を追加し、既存フィールドと同じ `defineModel<SearchForm>` を通じて `model.archetypeText` を操作する。復元・入力・個別クリアを同じフォーム状態に反映する。
2. `SearchRow`、Vuetify の `v-text-field`、`handleSearchEnter` を再利用する。`SearchFormBasic` が子の `submit` を既存の `executeSearch` に中継し、検索ボタンと同じ Builder、遷移、analytics を通す。
3. 既存フィールドの責務分割を踏襲し、再利用の単位を `SearchRow` と Enter ヘルパーにする。新しい UI の接続とテストに変更を絞る。

### Spec Kit との関係

- Issue #32 の利用者要件と受入条件は [Spec](spec.md) に記載し、調査・実装設計・検証手順は本 Plan に記載する。`minimal-review` が定める `review-plan` の統合ゲートで両文書をレビューし、承認後に `tasks` と実装へ進む。 [Constitution](../../.specify/memory/constitution.md) · [Spec Kit ワークフロー](../../.specify/workflows/speckit/workflow.yml) · [minimal-review overlay](../../.specify/workflows/overlays/speckit/minimal-review.yml)
- Feature 016 を指す `feature.json` の設定を保つため、Spec・Plan・Tasks は Feature 017 のディレクトリを直接指定して編集する。 [feature.json](../../.specify/feature.json)
- 過去の Bug Extension 記録では、当時の `att` の検索未接続を解消し、詳細検索の入力 UI を別要件として扱った。現行の照合経路はその後の catalog 正規化を反映している。Issue #32 はその UI の追加として扱う。 [過去の修正記録](../../.specify/bugs/archetype-text-search-missing/fix.md) · [catalog 正規化の仕様](../014-search-catalog-normalization/spec.md)
- 承認後の `tasks` では、本 Plan のファイル一覧・操作仕様・テストケースを作業単位にする。Constitution に沿って既存の型と構成を使い、UI の振る舞いを自動テストで確認できるようにする。

## 3. 変更予定ファイル

| ファイル | 変更内容 |
| --- | --- |
| `app/components/cards/search/basic/SearchFieldArchetypeText.vue`（新規） | テキスト入力、`archetypeText` との双方向バインド、個別クリア、Enter による `submit` を実装する。 |
| [SearchFormBasic.vue](../../app/components/cards/search/layout/SearchFormBasic.vue) | 「タイプ」と「キーワード」の間に新しい行と区切りを追加し、`submit` を親へ中継する。 |
| [search.test.ts](../../app/pages/cards/search.test.ts) | 実コンポーネントの input とボタンを操作し、復元、再検索、編集、クリア、Enter、IME、キーリピートを検証する。 |
| [index.test.ts](../../app/pages/cards/index.test.ts) | 対象ケースだけ `ResultControls` の実コンポーネントを使い、「条件を編集」の遷移リクエストに `att` と他条件が含まれることを確認する。検索結果の取得は既存のモックを使う。 |

## 4. UI 配置と操作仕様

- 表示順は「カード名 → カード分類 → 属性 → タイプ → 種族・タイプ → キーワード」。既存行の相対順序を維持し、関連する分類項目と自由入力のキーワードの間に置く。基本情報内でカード分類を問わず表示する。
- 行ラベルは「種族・タイプ」。`SearchFieldArchetypeText.vue` の `v-text-field` に `aria-label="種族・タイプ"` を設定し、入力のアクセシブルネームを指定する。placeholder は `種族・タイプを入力...`。カード名・キーワードと同じ `compact`、`outlined`、`hide-details`、`flat`、`rounded mb-3` を使い、`useDisplay().mobile` に応じて `mt-4` / `mt-1` を適用する。既存の `SearchRow` をそのまま使い、PC の `md` 以上ではラベル・クリアと入力を横並び、狭い画面では縦並びにする。
- 初期値・復元値は入力欄に表示する。クリアボタンは文字が入っている間に有効となり、押すと `archetypeText` だけが空文字になり、ボタンが無効になる。入力・クリア後も検索は明示操作で実行する。
- ネイティブ input の通常 Enter は `handleSearchEnter` を通り、既定動作と伝播を止めて検索を1回実行する。`isComposing`、IME 確定時の `keyCode === 229`、`repeat`、キャンセル済みイベントは共通ヘルパーで抑止する。`この条件で検索` ボタンも同じフォーム値で実行する。

## 5. URL 生成・復元・検索処理への影響

- Parser は `att` が複数あるとき最後の文字列を採用し、前後の空白を除去する。値がなければ `archetypeText` は `''` になる。Builder は値を trim し、空なら `att` を省略する。値を変えずに検索すれば、既存 Builder が正規化した同じ有効条件が再送される。エンコードは Vue Router に任せる。 [Parser](../../app/utils/search/cardSearchQueryParser.ts) · [Builder](../../app/utils/search/cardSearchQueryBuilder.ts) · [Query Specification](../../docs/architecture/query_specification.md)
- `/cards` の現行経路は `useCardSearch` がデータセットを読み込み、`prepareCardSearch` / `runCardSearch` を呼ぶ。API も同じ runner を使う。`createCardSearchMatcher` は検索語を既存の `normalizeCatalogText` で走査前に正規化し、`search_support.archetype_text` に対してリテラル部分一致を評価する。検索語を含まないカードや値が欠けたカードは、有効な `att` があるときに除外される。ほかの有効条件と併用した場合は両方が適用される。 [useCardSearch.ts](../../app/composables/useCardSearch.ts) · [runner.ts](../../shared/cardSearch/runner.ts) · [Matcher](../../shared/cardSearch/search.ts) · [cards.get.ts](../../server/api/cards.get.ts) · [Query Data Specification](../../docs/architecture/query_data_specification.md)
- 「タイプ」の選択条件 `ct` とユニット欄の「種族」の選択条件 `ra` は、短縮 UUID を使う独立した条件。追加行が操作するのは自由入力の `att`。`att` は Builder のカテゴリ適用判定より前に出力されるため、行の表示にもカテゴリ制限を設けない。 [Query Schema](../../app/utils/search/cardSearchQuerySchema.ts) · [Builder](../../app/utils/search/cardSearchQueryBuilder.ts) · [SearchFieldRace.vue](../../app/components/cards/search/unit/SearchFieldRace.vue)

## 6. 追加・修正するテスト

既存の詳細検索ページテストは Nuxt の `mountSuspended` で実コンポーネントを描画し、ルート・遷移・analytics をモックしている。復元のタイミングと DOM の入力操作をこのテストに追加する。検索結果ページのテストは通常 `ResultControls` をスタブしているため、遷移の検証ケースで実コンポーネントを使用する。 [search.test.ts](../../app/pages/cards/search.test.ts) · [index.test.ts](../../app/pages/cards/index.test.ts)

| 対象 | ケースと期待値 |
| --- | --- |
| 結果ページ | `att` と `cc` / `kw` を含む query で「条件を編集」を押すと、`navigateTo` が `/cards/search` と同じ query で1回呼ばれる。 |
| 詳細検索の表示・復元 | 「タイプ」の直後に指定のラベルと placeholder があり、input の `aria-label` が「種族・タイプ」である。query なしでは空で、クリアは無効。SPA 遷移時には `att` を input に即時反映し、直接表示の hydration で遅れて届く query は `onNuxtReady` 後に input に反映する。ready 前に追加欄を編集した場合は、その入力が遅延復元に上書きされない。 |
| 検索ボタン・個別クリア | `att` と他条件を復元し、編集せずボタン検索すると元の有効条件を維持する。実 input で変更すると `att` が新値に置き換わる。行のクリアを押すと input が空になりクリアが無効化され、再検索時に `att` だけを省く。入力・クリアの時点では遷移しない。 |
| キーボード | 既存の Enter 成功ケースに `att` を追加する。日本語入力値の前後の空白が除去され、他条件を含む query で遷移と analytics が各1回実行されることを確認する。追加欄で `isComposing`、`keyCode === 229`、`repeat` のいずれも遷移と analytics が発生せず、イベントの既定動作が維持されることを確認する。 |

カード名・キーワード等の既存ケースは残す。Parser・Builder の単体テストは、重複・空白・Unicode の往復を既に確認している。簡易検索には `race-type` → `att` の Builder・composable テストと Enter のコンポーネントテストがある。Matcher のテストは catalog の部分一致・正規化・他条件との併用を確認し、実データ統合テストは `att` の一致 ID 集合を検証する。新規ケースは UI の接続で生じる回帰に集中させる。 [Parser テスト](../../app/utils/search/cardSearchQueryParser.test.ts) · [Builder テスト](../../app/utils/search/cardSearchQueryBuilder.test.ts) · [簡易検索 Builder テスト](../../app/utils/search/quickSearchQueryBuilder.test.ts) · [簡易検索 composable テスト](../../app/composables/useQuickSearch.test.ts) · [QuickSearchBar テスト](../../app/components/layout/QuickSearchBar.test.ts) · [Matcher テスト](../../server/utils/cardSearch/search.test.ts) · [実データ統合テスト](../../tests/integration/cardSearchRealData.test.ts)

## 7. 回帰確認と実行担当

- PC 幅とスマートフォン幅の実ブラウザーで、行順、横並びと縦並び、余白、ラベルと placeholder、入力のアクセシブルネーム、入力と個別クリアを確認する。日本語 IME で確定の Enter による遷移が起きず、続く通常 Enter で検索することを確認する。
- 簡易検索で「ドラゴン」など結果のある語を選び、`/cards?att=...` の結果を記録する。「条件を編集」で表示を確認し、変更せず検索して同じ検索結果になることを確認する。別の語への編集後は新しい `att` の結果を確認し、クリア後は他条件だけで検索した場合の結果と比較する。`ct` / `ra` を使うケースでは各選択が保持されることも確認する。
- 他条件を含む共有検索結果でも、条件編集と未変更の再検索で同じ有効条件と一致カードの集合を維持することを確認する。詳細検索の空欄から値を追加するケースでは、同じ条件を表す URL と一致カードを確認する。一致しない語の検索では、0件表示から条件編集に戻って値を変更または解除できることを確認する。
- カード名・キーワードの Enter と個別クリア、詳細検索ボタン、空のフォームからの `/cards` 遷移、共有 URL の直接表示、カテゴリ別の表示と非適用条件の除外、検索結果の描画・ソート・ページ送りを既存テストで回帰確認する。
- 実装時に Codex がテストコードを作成・修正し、検証コマンドは人間が PowerShell で実行する。変更対象を先に個別確認し、その後に lint、typecheck、全体テストを行う。以下は承認・実装後に人間が実行するコマンド。

```powershell
npm.cmd test -- --run app/pages/cards/search.test.ts app/pages/cards/index.test.ts
npm.cmd run lint
& ./node_modules/.bin/nuxt.cmd typecheck
npm.cmd test -- --run
```

現在の検証状況は未実施。検証結果は実測に基づいて記録する。既知の間欠的 Timeout の調査・対応は Issue #15 の対象とする。 [Issue #15](https://github.com/Oosunakun/monsearch/issues/15)

## 8. ドキュメント更新の要否

実装時の追加更新は不要と判断する。Query Specification と Query Data Specification は既に `att` を定義しており、簡易検索と条件編集の仕様も利用できる。`specs/002-query-builder` の `att` 未公開の記述と Bug Extension の記録は、各作業時点の履歴として参照する。README の詳細検索の項目一覧は例示であり、`docs/src/advanced-search.html` は現行の Vue 画面と項目構成が異なる静的資料。利用者向けの挙動は [Spec](spec.md) に、検証手順は本 Plan に記載する。 [条件編集の仕様](../005-search-condition-edit/spec.md) · [簡易検索の仕様](../006-quick-search-url-query-builder/spec.md) · [Query Builder の旧 Plan](../002-query-builder/plan.md) · [README](../../README.md) · [静的 HTML](../../docs/src/advanced-search.html)

## 9. リスク・未決事項

- 隣接する「タイプ」の選択 UI と区別できるよう、テキスト入力の見た目、placeholder、空時のクリア無効化を既存のテキスト欄に合わせる。
- 実機の IME イベント順序・ソフトウェアキーボード・画面幅による余白は、合成イベントの自動テストと併せてブラウザーで確認する。既存ページテストの間欠的 Timeout は Issue #15 を参照する。
- Spec と Plan は承認済み。残る確認はタスクのレビューと実装後の検証。
