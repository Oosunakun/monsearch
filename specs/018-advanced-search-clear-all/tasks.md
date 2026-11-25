# Tasks — 詳細検索の条件を一括クリア

- Feature 018 · `feature/advanced-search-clear-all` · [Issue #33](https://github.com/Oosunakun/monsearch/issues/33)
- 入力は統合Human Reviewで **APPROVED** の [Spec](spec.md) と [Plan](plan.md)。
- Tasksレビューは **APPROVED**（修正要求なし）。実装・テストコード作成とHuman検証を含めて **14/14件完了、残タスク0件**。

`[P]` は依存タスクの完了後に独立したファイルで並行できる項目、`[USn]` は対応するユーザーストーリーを示す。ファイルパスはリポジトリルート基準。受入条件 `USn-m` の末尾はSpecの各ストーリー内の番号。

## Phase 1 — 準備

既存のNuxt・Vuetify・Vitest環境を利用する。環境・依存関係の追加作業は不要。Feature 018の承認済み文書とリポジトリのTasksテンプレートから直接作成した。`setup-tasks.ps1` でFeatureディレクトリを上書き指定すると `.specify/feature.json` に保存されるため、既存のFeature 016の設定を保つ方式を採った。 [Tasksテンプレート](../../.specify/templates/tasks-template.md) · [パス解決](../../.specify/scripts/powershell/common.ps1)

## Phase 2 — 共通のページテスト基盤

- [X] T001 `app/pages/cards/search.test.ts` のComposableモックを実際の `useCardSearchForm()` に委譲し、その `form` を観測できるようにする。`mountSuspended` の実ページ・実子コンポーネントと既存のroute・analytics・`onNuxtReady` の観測を維持する。検索ボタンの指定は `SearchActions` 内の「この条件で検索」に揃え、ボタンの位置や総数への依存を解消する。

## Phase 3 — US1 一度の操作で条件を入れ直せる（P1）

**独立検証**　複数のセクションに条件を入れ、一部の入力を分類・Modifier・枠の一致方法で非表示にする。クリアを一度押し、全7セクションが既定値に戻り、再表示しても旧値が現れないことを確かめる。

- [X] T002 [P] [US1] `app/composables/useCardSearchForm.test.ts` に、全7セクションを埋めたフォームから `resetForm()` を呼び、`createSearchForm()` と全体一致することを検証する単体テストを追加する。外側の `ref` の継続利用、古いモデルおよび別項目との配列・数値オブジェクト・枠と `slots` の参照独立性、連続クリア後の再入力も確認する。
- [X] T003 [US1] `app/pages/cards/search.test.ts` に実入力と実クリアボタンを使うページテストを追加する。分類変更でユニット・装備品・地形の条件を隠し、`exclude` で隠れる比較、枠を入力してから `none` に切り替えたときに保持される個数、数値 `0`、論理一致 `and` をケースに含める。一度の操作で確認ダイアログを挟まず、フォーム全体が既定値となり、各入力を再表示しても旧値・旧演算子・旧個数が復活しないことを確認する。
- [X] T004 [US1] `app/components/cards/search/layout/SearchActions.vue` にクリア専用の `onClear` propと、検索の後ろに置くネイティブの `v-btn`（`type="button"`）を追加する。クリアの `aria-label` は「すべての条件をクリア」。検索の既存 `color="primary"`、`variant="flat"`、`size="large"`、`class="font-weight-bold px-12"`、`@click="onExecute"` を維持する。
- [X] T005 [US1] `app/pages/cards/search.vue` で `useCardSearchForm()` の既存 `resetForm()` を取得し、ページのクリアハンドラーから呼び出す。`SearchActions` の `onClear` に接続してフォーム全体を既定値へ戻す。既定値でも操作可能とし、項目別処理や確認ダイアログを追加せず、既存検索とは独立した操作経路にする。

## Phase 4 — US2 クリア後に検索するかを自分で選べる（P1）

**独立検証**　条件付きURLからクリアしても現在のURLと履歴は維持される。検索を押すとその時点の条件で結果を表示し、検索せずに再読み込みすると元のURLの有効条件を復元する。

- [X] T006 [US2] `app/pages/cards/search.test.ts` に条件付きURLからのクリア、連続クリア、その後の検索を検証するページテストを追加する。クリア直後に検索・`router.push`・`router.replace`・履歴の追加／置換・`analytics.submit`・`finishSubmit` が発生せず、URLが維持されることを確認する。検索を押した場合は、既定値ではクエリなしの `/cards`、再入力時はその条件だけの `/cards` に一度遷移することを確認する。
- [X] T007 [US2] `app/pages/cards/search.test.ts` にhydration中のクリアと再読み込み相当のテストを追加する。遅延復元の前に既定値のままクリアし、その後 `onNuxtReady` で有効なURL条件を受け取っても既定値を保つことを確認する。同じURLでページを再マウントすると有効条件が戻ることを、SPA初期化と遅延復元の経路で確認する。クリア操作のない遅延復元、離脱・破棄、空クエリ、未知・無効条件の混在の既存挙動も回帰確認する。
- [X] T008 [US2] `app/pages/cards/search.vue` で既存の復元ガードが参照する編集フラグをページインスタンスのスコープで共有し、明示クリアで `resetForm()` を呼ぶ前に記録する。値の同一性にかかわらず同じページの遅延復元を抑え、ページを開き直せば従来どおりURLから復元する。既存の検索・履歴・analyticsの経路と、ヘッダーおよびドロワーの簡易検索状態をクリアハンドラーから操作しない。

## Phase 5 — US3 PC・スマートフォン・キーボードで操作できる（P1）

**独立検証**　PCとモバイルで左の検索、右のクリアを個別に操作できる。表示テキストが変わってもクリアのアクセシブルネームは共通で、Tab順は検索→クリアとなる。

- [X] T009 [P] [US3] `app/components/cards/search/layout/SearchActions.test.ts` を作成し、実 `SearchActions` とVuetifyボタンで、検索→クリアのDOM順、クリアが1個であること、`type="button"` と共通 `aria-label`、PC・モバイルのテキストとVuetify表示クラスを検証する。検索の既存属性と、各ボタンのクリックで対応するコールバックだけが一度呼ばれることを検証する。
- [X] T010 [P] [US3] `app/components/cards/search/layout/SearchActions.vue` で両ボタンを折り返さない横一列に配置し、Vuetifyの `md` 表示ユーティリティでクリアのテキストを「すべての条件をクリア」と「クリア」に切り替えた。クリアは確定済みのHD-02に従い、`outlined` と `font-weight-medium` を使い、配色を `.search-actions-clear-theme`、モバイル寸法を `.search-actions-clear` に定義した。検索の `px-12` を含む属性とデザイン、クリアの共通アクセシブルネーム、ネイティブのフォーカス順を維持した。

## Phase 6 — Humanによる検証

- [X] T011 Humanが `package.json` と `vitest.config.ts` に基づき、リポジトリルートのPowerShellで下記の対象テスト、lint、typecheck、全体テストを実行し、結果をこの文書に記録する。
- [X] T012 Humanが `app/pages/cards/search.vue` の実画面で全条件クリアと確認ダイアログなしの操作を確認する。PCヘッダーおよびモバイルのドロワーで簡易検索の入力と検索対象を設定してからクリアし、簡易検索と現在URLが維持され、戻る操作に余分な履歴がないことを確認する。条件付きURLの再読み込みでの復元と、クリア後に明示検索した場合の遷移も確認する。
- [X] T013 Humanが `app/components/cards/search/layout/SearchActions.vue` の実画面で、PC・モバイルの横一列、`md` 前後のラベル、アクセシビリティツリーの名前とボタン数を確認する。PCのサイドバー開閉でも配置を確認する。Tab・Shift+Tabの順とフォーカス表示、Enter・Spaceが対象ボタンだけを作動させること、クリア後のフォーカス、既存入力欄のEnter・IME動作を確認する。
- [X] T014 Humanが `specs/018-advanced-search-clear-all/plan.md` §4・§6に従い、幅320 CSS pxで操作列の有効幅、両ボタンの実幅・高さ・間隔、sticky領域の現行と実装後の高さを測る。検索の `px-12` が維持され、両ボタンの欠け・横スクロールがなく、タップで押し分けられ、sticky領域が現行の約2倍にならず最下部の入力を表示・操作できることを確認する。操作領域とクリア側の調整を優先する。それでも成立しない場合は測定値・不足幅・代替案をHuman Decisionに提示し、検索ボタンの属性や見た目は承認を得てから変更する。

### Humanが実行するPowerShellコマンド

```powershell
npm.cmd test -- --run app/composables/useCardSearchForm.test.ts app/components/cards/search/layout/SearchActions.test.ts app/pages/cards/search.test.ts
npm.cmd run lint
& ./node_modules/.bin/nuxt.cmd typecheck
npm.cmd test -- --run
npm.cmd run dev
```

最後のコマンドはT012〜T014のブラウザー確認用。320 CSS pxの計測では、実装前の画面または同じ条件のベースラインと比較する。

### Human検証結果と最終UI承認

| タスク | Human報告 |
| --- | --- |
| T011 | 個別テスト・全体テスト、lint、typecheckはすべて **PASS**。 |
| T012 | `npm run dev` で基本動作に問題なし。全条件クリア、簡易検索の維持、URL・履歴、再読み込みでの復元、明示検索はすべて問題なし。 |
| T013 | PC・モバイルの表示、ラベル、アクセシビリティ、Tab順、Enter・Space・IME操作はすべて問題なし。 |
| T014 | 320 CSS pxで横並びが成立し、ボタンの欠け・横スクロール・sticky領域・最下部の入力操作に問題なし。モバイルの主な設計基準は375 CSS pxとし、320 CSS pxも許容する。 |

最終UIはHuman承認済み。PC・モバイルとも左に検索、右にクリアを配置し、検索ボタンは既存のデザインを維持した。クリアは背景色 `#f2f7fb`、文字色 `#386b8a`、枠線 `1px solid #b6cddc`、`outlined`、`font-weight-medium` を採用した。 [Spec](spec.md) · [Plan](plan.md)

正確なテスト件数、終了コード、ボタンやsticky領域の寸法実測値は未共有。上表はHumanから共有された確認結果を記録したもの。

## 要件・成功基準・受入条件との対応

| Specの受入条件 | FR・SC | 対応タスク |
| --- | --- | --- |
| US1-1 一度の操作、確認ダイアログなし、全条件の初期化 | FR-002、SC-001 | T001–T005、T011–T012 |
| US1-2 分類を含めた初期化と非表示条件の再表示 | FR-002・FR-003、SC-001 | T002–T003、T005、T011–T012 |
| US1-3 非表示の数値・演算子・枠の個数と論理一致の初期化 | FR-003、SC-001 | T002–T003、T005、T011–T012 |
| US2-1 簡易検索・URL・履歴の維持と検索・analyticsの抑止 | FR-004、SC-002 | T005–T006、T008、T011–T012 |
| US2-2 明示検索で既定値または再入力後の条件を使用 | FR-005、SC-002 | T006、T011–T012 |
| US2-3 再読み込みでURLの有効条件を復元 | FR-006、SC-003 | T007–T008、T011–T012 |
| US3-1 横一列、ラベル切り替え、既存デザイン、狭幅とsticky領域 | FR-001・FR-007、SC-004 | T004、T009–T011、T013–T014 |
| US3-2 DOM・Tab・視覚順、アクセシブルネーム、キー操作 | FR-001・FR-007、SC-004 | T004、T009–T011、T013 |

境界ケースは、既定値でのクリア・連続クリアをT002・T006、遅延復元との競合と空・未知・無効クエリをT007・T008で扱う。

## 依存関係と実装順

- T001 → T003 → T006 → T007の順で共通のページテストを更新する。T002は単体テストのためT001・T003と並行できる。
- T004 → T005でUS1の一括クリアを接続し、T005・T007 → T008でUS2の遅延復元ガードを完成させる。US1のフォーム全体のリセットを最初に成立させ、US2の遷移・復元とUS3の表示・操作を揃えて機能を完成させる。
- US3ではT004の後、別ファイルのT009とT010を並行できる。ページ実装のT008と表示実装のT010も別ファイルで進められる。
- T011〜T014のHuman検証は完了し、結果を上記の表に記録した。
