# Implementation Plan — 詳細検索の条件を一括クリア

- Feature 018 · `feature/advanced-search-clear-all`
- Spec・Plan統合Human Review **APPROVED**（`minimal-review`）。実装後のHuman ReviewでHD-02の最終デザインも確定。
- [Spec](spec.md) · [Tasks](tasks.md) · [Issue #33](https://github.com/Oosunakun/monsearch/issues/33)

## 1. 技術コンテキストと現行実装

Nuxt 4・Vue 3・Vue Router・Vuetifyの既存画面を対象とする。テストはVitestのNuxt環境で、`@nuxt/test-utils/runtime` の `mountSuspended` とVue Test Utilsを利用する。永続化された詳細検索条件の復元元はページのURL。 [package.json](../../package.json) · [vitest.config.ts](../../vitest.config.ts)

| 調査対象 | 現行実装と課題 |
| --- | --- |
| 初期化と検索 | `search.vue` は `parseCardSearchQuery(route.query)` を `useCardSearchForm()` に渡し、各セクションに同じ `form` を `v-model` で配る。`executeSearch()` はその時点の `form.value` をBuilderに渡し、`analytics.submit('advanced', query)` と `finishSubmit` を伴って `/cards` に `router.push` する。Queryが空の場合は `{ path: '/cards' }`。検索ボタンと、カード名・種族・タイプ・キーワード・参照ラベルのEnterが検索経路。 [検索ページ](../../app/pages/cards/search.vue) · [Builder](../../app/utils/search/cardSearchQueryBuilder.ts) · [検索Enter](../../app/utils/search/handleSearchEnter.ts) |
| アクション | `SearchActions.vue` は下端stickyの `SectionCardShell` 内で、`primary` / `flat` / `large` の検索ボタンを `px-12` 付きで中央に1個表示する。PCとスマートフォンで共通のテンプレート。ボタンのclickは `onExecute` propを呼ぶ。既存の行単位クリアは `SearchRow` のアイコン、所持枠選択内のクリアはグレー系の `text`。一括操作はどちらからも呼べない。 [SearchActions](../../app/components/cards/search/layout/SearchActions.vue) · [SearchRow](../../app/components/cards/search/shared/SearchRow.vue) · [所持枠セレクター](../../app/components/cards/search/shared/SearchSlotSelector.vue) |
| 非表示条件 | 分類未選択・トークンではユニット、装備品、地形の各セクションを表示する。その他は分類に応じて `v-show` で切り替え、フォーム内の値を保持する。Builderは分類に適用できる条件だけを出力する。存在Modifierや `none` による `v-if` でも、内部の比較・個数が親モデルに残り得る。検索URLが空かどうかだけではクリアの完全性を判定できない。 [検索ページ](../../app/pages/cards/search.vue) · [Builder](../../app/utils/search/cardSearchQueryBuilder.ts) · [数値・Modifier](../../app/components/cards/search/shared/SearchFilterWithOperator.vue) · [所持枠セレクター](../../app/components/cards/search/shared/SearchSlotSelector.vue) |
| URL・hydration | 初回のParserに加え、クライアントのhydration時に `onNuxtReady` が最新のURLを一度読み直す。深い同期watchは初期フォームとJSON比較し、実際の値編集を記録する。ページ離脱・破棄・編集後の上書きは回避できるが、初期値と同じ値へのクリアは比較で検知できない。 [検索ページ](../../app/pages/cards/search.vue) · [既存ページテスト](../../app/pages/cards/search.test.ts) |
| 簡易検索 | `default.vue` が `useQuickSearch()` の独立した `quickSearchState` を所有し、PCは `AppHeader`、モバイルは `AppNavigationDrawer` の `QuickSearchBar` に渡す。`searchText`・`selectedSearchType`・`selectedCardPool` はページの `SearchForm` に含まれない。 [レイアウト](../../app/layouts/default.vue) · [簡易検索](../../app/composables/useQuickSearch.ts) · [ヘッダー](../../app/components/layout/AppHeader.vue) · [ドロワー](../../app/components/layout/AppNavigationDrawer.vue) |

条件編集の共有URL・再読み込み・適用外値の扱いはFeature 005を、Modifierの意味はFeature 010とQuery Specificationを参照する。Feature 017で追加された `archetypeText` も現行のフォーム・Parser・Builderの対象。 [条件編集](../005-search-condition-edit/spec.md) · [数値存在検索](../010-numeric-presence-search/spec.md) · [種族・タイプ](../017-advanced-search-archetype/spec.md) · [Query Specification](../../docs/architecture/query_specification.md)

## 2. フォーム全体の初期化（FR-002・FR-003）

`useCardSearchForm()` は初期状態を `structuredClone` して `ref<SearchForm>` に保持する。`resetForm()` は同じ `ref` に新しい `createSearchForm()` の結果を代入する。ページ、セクション、各入力の `v-model` / `defineModel` が新しい値を受け取る経路は、既存の遅延URL復元でも使われている。確認した条件入力はモデルのプロパティを参照し、所持枠のチップも `slots` から算出する。選択UIの開閉や候補検索文字列はそのUI自身の `ref` で管理され、Specの対象外に該当する。 [Composable](../../app/composables/useCardSearchForm.ts) · [Factory](../../app/utils/search/cardSearchFormFactory.ts) · [モデル](../../app/types/ui/search.ts) · [ユニットセクション](../../app/components/cards/search/layout/SearchFormUnit.vue) · [所持枠セレクター](../../app/components/cards/search/shared/SearchSlotSelector.vue)

`resetForm()` の本体はそのまま再利用できる。Factoryは各配列、数値条件オブジェクト、枠条件とその `slots` オブジェクトを呼び出しごと、項目ごとに生成する。置換後の編集が以前のフォームや他項目の入れ子に伝播しない設計なので、項目を列挙して消したり、子コンポーネントを再マウントしたりする必要はない。ページにクリア操作の入口を設け、そこで既存の `resetForm()` を呼ぶ。

| `SearchForm` の範囲 | Factoryの既定値 |
| --- | --- |
| 基本情報 | `name`・`cardCategory`・`keyword`・`archetypeText` は空文字、属性・タイプは空配列 |
| カードセット・所属 | カードセット・勢力・ブロックは空配列 |
| ユニット | レベル・英雄点・イニシアチブ・チャージ・ディフェンダーはModifier付き数値の既定値、攻撃・防御は数値の既定値、移動・種族・耐性は空配列、アイテム・スペル所持枠は枠の既定値 |
| 装備品 | 追加攻撃・防御、追加イニシアチブ・チャージ・ディフェンダー、追加所持枠は対応する既定値、追加耐性は空配列 |
| 地形 | リミットは数値の既定値、地形分類は `all` |
| 特殊能力・カード効果 | アイテム・スペル・その他コストは枠の既定値、効果・発動タイプ・発動分類は空配列、効果テキストは空文字 |
| その他 | 稀少度・イラストレーターは空配列、参照ラベルは空文字 |

- 数値条件は `operator: 'gte'`（以上）、`value: null`。数値の `0` も解除する。Modifier付き数値には `filterType: 'all'`（すべて）を設定する。
- 所持枠・コスト条件は `slots: {}`、`match: 'or'`（いずれかを含む）。`and` や `none` と、画面に出ていない個数も解除する。

## 3. 状態遷移と副作用（FR-004〜FR-006）

| 操作・状態 | フォームと外部状態 |
| --- | --- |
| 初回表示・再読み込み | ページのセットアップでURLをParserに渡す。必要に応じて既存のhydration時の遅延復元で最新Queryを読む。URL条件のない場合は既定値になる。 |
| 一括クリア | 同じページインスタンス内の明示的な編集として記録し、`resetForm()` を呼ぶ。詳細検索フォームだけが既定値になる。`executeSearch`、analyticsの送信開始・終了、`router.push` / `replace`、History APIへの書き込みは起こさない。簡易検索の状態は維持される。 |
| クリア後に遅延復元が到着 | 値がすでに既定値でも明示的なクリアを検知できるよう、ページのクリアハンドラーで既存の編集フラグを立ててからリセットする。フラグはページインスタンスのスコープで共有する。同値の初期通知を無視するwatch、編集後に元へ戻した場合のガード、復元の一回性・離脱時の破棄は現行通り。 |
| クリア後に検索 | 現行の `executeSearch()` が最新のフォームをBuilderに渡す。既定値のままなら `/cards` へQueryなしで遷移し、再入力した場合はその時点の有効条件を使う。 |
| クリア後に検索せず再読み込み | クリアの記録はページのインスタンスとともに失われ、変更されていないURLから初回表示と同じ手順で復元する。 |

## 4. ボタン・レスポンシブ設計（FR-001・FR-007）

検索は現行の `onExecute` を使い、クリアにはページの専用ハンドラーを呼ぶ `onClear` propを追加する。既存の検索ボタンと、新しく `type="button"` を指定するクリアボタンを同じsticky領域に置く。Enter・Spaceはネイティブのボタン動作を利用する。既存の入力欄EnterとIMEガードは既存経路を使う。クリアは既定値でも操作でき、実行後もフォーカスを維持できる設計とする。

| Human Decision | 承認済みの内容 |
| --- | --- |
| **HD-01 配置** | PC・モバイルとも左に検索、右にクリアを横一列に置く。DOM順・視覚順・Tab順は検索→クリアで揃える。 |
| **HD-02 デザイン** | 既存の検索ボタンのデザインと属性を維持する。クリアは `variant="outlined"` と `font-weight-medium` を使う。`.search-actions-clear-theme` に背景色 `#f2f7fb`、文字色 `#386b8a`、枠線 `1px solid #b6cddc` を定義する。モバイルの寸法は `.search-actions-clear` に定義する。表示テキストはPCで「すべての条件をクリア」、モバイルで「クリア」。アクセシブルネームは共通で「すべての条件をクリア」。 |

実装制約として、検索の `v-btn` には現行の `color="primary"`、`variant="flat"`、`size="large"`、`class="font-weight-bold px-12"`、`@click="onExecute"` を維持する。既存検索ボタンの属性の追加・変更や、CSSによるボタン固有の見た目・寸法の上書きは行わない。ボタン群のコンテナは折り返さず、DOM順どおりの横一列とする。クリアは一つの `v-btn` とし、`aria-label="すべての条件をクリア"` を指定する。その中でPC用とモバイル用のテキストを、既存のVuetify表示ユーティリティ `d-none d-md-inline` と `d-md-none` で切り替える。`mobileBreakpoint: 'md'` に合わせる。インストール済みVuetifyの `md` は840 CSS px。単一のボタンで表示テキストを切り替えるため、フォーカス順とアクセシブルネームは画面幅に依存しない。 [Nuxt設定](../../nuxt.config.ts) · [既存の表示切り替え](../../app/components/layout/AppHeader.vue)

### 幅320 CSS pxでの成立性とsticky領域

既存レイアウトと実装済みのCSSを基に、ルートフォントサイズ16pxで概算した。ボタンの実幅はフォントや表示環境で変わる。T014では幅320 CSS pxでも横並びが成立したとHumanが報告した。主な設計基準は375 CSS px。寸法実測値は未共有。 [Tasks](tasks.md) · [レイアウト](../../app/layouts/default.vue) · [コンテナ](../../app/components/common/layout/ContentMaxWidthContainer.vue) · [外枠](../../app/components/common/layout/SectionCardShell.vue) · [ボタン](../../app/components/cards/search/layout/SearchActions.vue) · [フォント設定](../../assets/css/main.css)

| 対象 | 概算と設計 |
| --- | --- |
| 変更前の操作列の有効幅 | レイアウトの `pa-4` が左右16pxずつ、コンテンツコンテナの `pa-0` は0px、`SectionCardShell` の内側余白は左右 `0.95rem`（約15.2px）ずつ。320pxから引くと約258px。 |
| 既存検索ボタン | `large` は1rem・高さ44px。7文字を各16pxで見積もり、`px-12` の左右48pxずつと字間を加えると幅約209px。 |
| モバイルのクリア | `.search-actions-clear` で `min-width: 64px`、`padding-inline: 8px`、`font-size: 0.875rem`（14px）を指定する。両ボタンとも `size="large"` で高さ44px。間隔はモバイル6px、PC8px。モバイルで必要な幅は `209 + 64 + 6 ≈ 279px`。 |
| 実装後の操作列の有効幅 | モバイルでは `SearchActions` の `SectionCardShell` 内側の横余白を左右2pxずつに設定する。列の有効幅は `320 - 32 - 4 = 284px`、約279pxの一列に対し余裕は概算で約5px。検索ボタンの `px-12` は維持する。 |
| sticky領域の高さ | ボタンの高さ44pxと外枠の上下余白 `0.75rem` ずつで、カード本体は約68px。一列分に収まる見込みで、変更前後の高さとモバイルの最下部の入力欄を表示・操作できることをT014で確認する。 |

許容できるタップ領域と間隔を確保した上で320 CSS pxに収まらない場合は、実測幅と不足分を示してHuman Decisionに戻す。代替案はモバイルで操作領域だけをレイアウトの外側余白まで広げる方法と、既存検索ボタンの横余白にモバイル限定の例外を設ける方法。後者には検索ボタンの設定を維持する決定の変更が必要となる。

## 5. 変更予定ファイルと影響範囲

| ファイル | 実装時の変更 |
| --- | --- |
| `app/pages/cards/search.vue` | `resetForm` を取得し、明示編集を記録するクリアハンドラーを `SearchActions` に渡す。 |
| `app/components/cards/search/layout/SearchActions.vue` | クリアボタンと専用のコールバックを追加する。両ボタンを横一列に置き、クリアの表示テキストをVuetifyの表示ユーティリティで切り替える。クリアの配色とモバイル寸法を別のクラスで定義し、既存検索ボタンの属性を維持する。 |
| `app/composables/useCardSearchForm.test.ts` | 全モデルの既定値と入れ子の参照独立性を検証する。 |
| `app/components/cards/search/layout/SearchActions.test.ts`（新規候補） | 実ボタンのDOM順、両表示テキストと切り替えクラス、共通のアクセシブルネーム、コールバック、検索ボタンの既存属性、クリアボタンの `type` を検証する。 |
| `app/pages/cards/search.test.ts` | 実ページ・実入力・実リセットの回帰を検証する。各ボタンは画面幅に依存しない名前で特定する。 |

`useCardSearchForm.ts`・`cardSearchFormFactory.ts`・`SearchForm`・フォーム各入力は既存実装を再利用する。URL Query仕様・Parser・Builder・Matcher・簡易検索・結果画面は変更範囲の外。環境や依存関係の追加も不要。

## 6. 検証方針

| 層 | 検証方法と期待結果 | 対応要件 |
| --- | --- | --- |
| 単体 | 既存の `useCardSearchForm.test.ts` は初期フォームとの独立性と既定値への復帰を検証する。全7セクションを埋めたフォームからリセットし、既定値との全体一致、外側の `ref` の継続利用、配列・数値オブジェクト・枠と `slots` の参照独立性、連続クリア後の再入力を検証する。既存Factoryテストは一部の数値条件が独立して初期化されることを確認済みのテスト定義として参照する。 | FR-002・003 |
| コンポーネント | Nuxt環境で実 `SearchActions` とVuetifyボタンをマウントする。検索→クリアのDOM順、クリアボタンが1個であること、二つの表示テキストとVuetify表示クラス、共通の `aria-label` を確認する。検索の既存 `color`・`variant`・`size`・`class`、クリアの `type="button"` と、クリック一回につき対応するコールバックだけが一回呼ばれることを確認する。表示クラスによる切り替えの実表示、配置、フォーカス、キー操作はブラウザーで確認する。 | FR-001・004・007 |
| ページ | 既存の `mountSuspended` は実ページ・実の子コンポーネントを使い、フォームComposableは `form` だけを返すmockに置換する。実Composableに処理を委譲し、既存の状態観測が必要なら返された `form` をテスト側で捕捉する。Vuetifyのオーバーレイは既存のTeleport／`VDialog`スタブを必要なケースに限って使う。`SearchActions` 内で検索は既存ラベル、クリアは共通の `aria-label` を使って取得する。これによりモバイル用の表示テキストや両テキストがDOMに存在することに依存せず、実ボタンからのクリアと検索を検証できる。 | FR-001〜007 |

ページテストでカバーするケース

1. 条件付きURLから始め、実入力でテキスト・複数選択・数値・所持枠を操作する。分類変更で非表示の値を作り、クリア後にフォーム全体を `createSearchForm()` と比較する。入力値・分類・トグル・枠チップを確認し、セクションや比較欄・枠の内訳を再表示しても旧値が復活しないことを確認する。既存の代表fixtureがカバーする数値 `0`・`and` に加え、`exclude` で隠れる比較も用意する。Parserは `none` の復元時に枠数を破棄するため、枠数が残った `none` は実UIで枠数を選んでから一致方法を切り替えて作る。テストは既存の選択肢か固定fixtureを使う。 [ページテスト](../../app/pages/cards/search.test.ts) · [代表fixture](../../app/utils/search/cardSearchQueryTestFixtures.ts) · [所持枠テスト](../../app/components/cards/search/shared/SearchSlotSelector.test.ts) · [Parser](../../app/utils/search/cardSearchQueryParser.ts)
2. クリア直後は `push`・`replace`・検索analyticsが0回で `route.path/query` を維持する。続けて検索をクリックした場合だけ、Queryなしの `/cards` に一度遷移する。再入力した場合は、その条件だけが遷移先Queryに入る。既存のフィールドEnter・IME・分類非適用値の回帰も確認する。
3. クリア後にアンマウントし、同じQueryで再マウントするとURL由来の条件を再表示する。SPA初期化と、`onNuxtReady` を保留したhydrationのそれぞれを使う。初期値が既定値である間にクリアしてからQueryを確定し、遅延復元がそのクリアを上書きしないケースを追加する。条件なし、未知・無効な値の混在、クリアのない遅延復元も既存動作を確認する。

### Human確認

- PC・モバイルとも左に検索、右にクリアが横一列で表示されることを確認する。PC・モバイルの表示テキストと、既存の `md` 境界の前後で切り替わることを確認する。ブラウザーのアクセシビリティツリーで、両表示ともクリアボタンが1個であり、名前が「すべての条件をクリア」であることを確認する。
- PCのサイドバー開閉時と、幅320 CSS pxのモバイルで、ラベルやボタンの欠け、横スクロールを確認する。モバイルでは操作列の有効幅、両ボタンの幅と高さ、間隔を測り、タップで押し分けられることを確認する。検索の `px-12` を含む現行デザインの維持も確認する。
- モバイルでは同じビューポートで現行と実装後のsticky領域の高さを比較し、一列分に近く、現行の約2倍の高さを占有していないことを確認する。スクロールして最下部の入力欄を表示・操作でき、sticky領域に遮られないことを確認する。
- PC・スマートフォンとも、Tabが検索→クリア、Shift+Tabが逆順で移動し、フォーカスが見えることを確認する。Enter・Spaceが対象ボタンだけを作動させ、クリア後も操作を続けられることを確認する。既存の入力欄Enter・IME変換確定を含む検索操作も確認する。
- PCヘッダーとスマートフォンのドロワーで、簡易検索に値と検索対象を設定してから詳細検索だけをクリアし、入力と選択が維持されることを確認する。条件付きの詳細検索URLでアドレスが維持され、戻る操作でクリア前と同じ遷移元に戻れることを確認する。再読み込みで有効条件が戻り、クリア後に明示検索したケースでは条件なしの結果へ移ることを確認する。

## 7. 回帰リスクと承認ゲート

| リスク | 設計・検証での対処 |
| --- | --- |
| 遅延URL復元によりクリアが取り消される | クリア意図をページスコープに記録し、値がすでに既定値のケースを回帰テストに含める。 |
| モデル置換時に子の選択表示や入れ子に旧値が残る | Factoryの新規参照を使い、再表示した実入力とフォーム全体の両方で確認する。 |
| 一括クリアが検索に結び付く、または既存の検索・Enterが誤動作する | ボタンのコールバックを独立させ、位置に依存するテストをラベルに切り替える。クリア前後の遷移・analyticsと検索の既存動作を検証する。 |
| 320px幅でボタンがはみ出す、sticky領域が入力を遮る、隣の操作を誤って押す | モバイルの短いラベルと操作領域の横余白で一列を確保する。ブラウザーで実効幅・タップ領域・sticky領域の高さ・フォーカス順・最下部の入力を確認する。収まらない場合は測定値と代替案をHuman Decisionに提示する。 |

Constitution確認では既存の型、ページとComposableの責務、最小変更、単体から実画面までの検証方針、Human ReviewによるUI決定を反映した。SpecのFR-001〜007とSC-001〜004の検証を本Planに記載した。`minimal-review` の統合Human Reviewは **APPROVED**。HD-01・HD-02は確定済み。Human検証は完了し、結果はTasksに記録した。 [Tasks](tasks.md)
