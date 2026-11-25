---
description: "Feature 017 の実装・検証タスク"
---

# Tasks — 詳細検索「種族・タイプ」

- **対象** `feature/advanced-search-archetype` · [Issue #32](https://github.com/Oosunakun/monsearch/issues/32)
- **入力** 統合 Human Review で承認済みの [Spec](spec.md) と [Plan](plan.md)
- **ステータス** 13/13 件完了。実装とテストコード作成、Human によるテスト実行とブラウザー確認が完了し、残タスクはない。
- **担当** 実装とテストコードの作成は Codex。検証コマンドの実行とブラウザー確認は人間。

タスクは `- [ ] Tnnn [P] [USn] 作業内容とファイルパス` 形式。`[P]` は独立して進められる作業、`[USn]` は対応するユーザーストーリーを示す。パスはリポジトリルート基準。以下の受入条件番号は、各ストーリー内の番号を指す。

## Phase 1・2 — 準備と共通基盤

既存の Nuxt/Vuetify 環境とテスト構成を使うため、セットアップ・基盤変更のタスクはない。`SearchForm`、`SearchRow.vue`、Enter ヘルパー、Parser、Builder、Matcher、簡易検索と検索結果画面の本体は現行の処理を利用する。実装差分の範囲は Plan §3 の2コンポーネントと2テストファイル。 [Plan](plan.md)

## Phase 3 — US1 検索結果から値を確認して再検索する（P1）

**独立検証**　簡易検索の結果から「条件を編集」を開くと入力欄に値が表示される。他条件を含む共有検索結果でも、未変更で再検索したときに同じ有効条件と一致カードが維持される。

- [X] T001 [P] [US1] `app/pages/cards/index.test.ts` に、対象ケースで実際の `ResultControls` を描画し、「条件を編集」で `att` と他条件を含む同じ query が `/cards/search` に1回渡ることを検証するテストを追加する。
- [X] T002 [P] [US1] `app/pages/cards/search.test.ts` に、行の位置、ラベル、placeholder、ネイティブ input の `aria-label`、未指定時の空表示を検証するテストを追加する。SPA 遷移での即時復元、直接表示での遅延復元、ready 前の入力が維持されること、未変更でのボタン検索が他条件を含む有効な query を送ることも実コンポーネントで検証する。
- [X] T003 [US1] `app/components/cards/search/basic/SearchFieldArchetypeText.vue` を作成する。既存の `SearchRow` と `v-text-field` を使い、`model.archetypeText` に双方向バインドする。行ラベルは「種族・タイプ」、placeholder は `種族・タイプを入力...`、`v-text-field` の属性は `aria-label="種族・タイプ"` とする。カード名・キーワードと同じ入力欄と余白の設定を使う。
- [X] T004 [US1] `app/components/cards/search/layout/SearchFormBasic.vue` に新しい行を「タイプ」の直後へ追加し、既存と同じ区切りとフォームモデルを接続する。カード分類を問わず表示し、既存行の相対順序を維持する。T003 に依存する。

## Phase 4 — US2 詳細検索で値を追加・変更・解除する（P1）

**独立検証**　他条件を指定してから「種族・タイプ」を追加・変更・クリアし、各操作後にボタンで検索する。結果 URL と一致カードに操作後の条件が反映される。

- [X] T005 [US2] `app/pages/cards/search.test.ts` に、空欄からの入力、復元値の変更、個別クリア、空白だけの入力を実 DOM で操作するケースを追加する。初期・クリア後のボタン無効化、入力・クリア時点での遷移抑止、検索時の `att` の設定・省略と他条件の維持を検証する。
- [X] T006 [US2] `app/components/cards/search/basic/SearchFieldArchetypeText.vue` で、入力文字列が空でないときに既存 `SearchRow` のクリアを有効にする。`reset` で `archetypeText` だけを `''` にし、変更は既存の明示検索で適用する。T003 に依存する。

## Phase 5 — US3 Enter と日本語 IME の操作を両立する（P2）

**独立検証**　値を日本語 IME で変換・確定する間は詳細検索に留まり、確定後の通常 Enter で最新の値による検索が1回行われる。リピートで追加検索が起きない。

- [X] T007 [US3] `app/pages/cards/search.test.ts` の通常 Enter のケースに新しい欄を追加し、最新の `att` と他条件を含む遷移、analytics が各1回であることを検証する。`isComposing`、`keyCode === 229`、`repeat` では遷移と analytics が0回で、既定動作が維持されるケースを追加する。カード名・キーワード等の既存ケースを残す。
- [X] T008 [US3] `app/components/cards/search/basic/SearchFieldArchetypeText.vue` で既存の `handleSearchEnter` を使って `submit` を発行する。`app/components/cards/search/layout/SearchFormBasic.vue` で `submit` を親の既存検索処理に中継する。T003・T004 に依存する。

## Phase 6 — 人間による検証と回帰確認

- [X] T009 `app/pages/cards/search.test.ts` と `app/pages/cards/index.test.ts` を人間が PowerShell で対象実行する。使用するコマンドは `specs/017-advanced-search-archetype/plan.md` §7 に従い、実行結果を記録する。
- [X] T010 `package.json` の lint、ローカル Nuxt CLI の typecheck、`vitest.config.ts` に基づく全体テストを人間が PowerShell で実行する。コマンドは `specs/017-advanced-search-archetype/plan.md` §7 に従い、実行結果を記録する。T009 の後に行う。
- [X] T011 `specs/017-advanced-search-archetype/plan.md` §7 に従い、人間が簡易検索と共有 URL の条件編集から未変更で再検索し、条件と一致カードを比較する。詳細検索での追加・変更・クリア後に URL と一致カードを比較し、`ct` / `ra` など他条件の維持、直接表示での復元、0件結果からの再編集も確認する。
- [X] T012 `specs/017-advanced-search-archetype/plan.md` §7 に従い、人間が PC とスマートフォンのブラウザーで配置、ラベル、placeholder、入力のアクセシブルネーム、既存行と揃った表示、入力、個別クリアを確認する。
- [X] T013 `specs/017-advanced-search-archetype/plan.md` §7 に従い、人間が実際の日本語 IME で変換中・確定時に検索されず、確定後の通常 Enter だけで検索されることを確認する。リピート時の追加検索抑止は T009 の合成イベントの結果も参照する。

### Human 検証結果

- T009 の対象2ファイルの個別テストと T010 の全体テストは、いずれも成功したと Human が報告した。`lint`・`typecheck`・`npm run dev` も問題なしと報告した。
- T011〜T013 の条件編集と再検索、PC・スマートフォンでの表示と操作、日本語 IME の確認は、いずれも問題なしと Human が報告した。
- 正確な実行ログ、テスト件数、終了コードは未共有。

検証は実測した結果を記録し、未実施の項目は未実施として扱う。既知の間欠的 Timeout の調査・対応は [Issue #15](https://github.com/Oosunakun/monsearch/issues/15) の対象とする。

## Spec との対応

| ストーリー・受入条件 | 機能要件と成功基準 | 対応タスク |
| --- | --- | --- |
| US1-1・2　復元と未変更での再検索 | FR-002・FR-005、SC-001 | T001–T004、T009、T011 |
| US2-1　配置・表示文言・アクセシブルネーム | FR-001、SC-003 | T002–T004、T009、T012 |
| US2-2・3　追加・変更・クリアと他条件の維持 | FR-003・FR-004（ボタン）・FR-005、SC-002・SC-003 | T003–T006、T009、T011–T012 |
| US3-1・2　IME・通常 Enter・リピート | FR-004、SC-004 | T007–T009、T013 |

境界ケースは T002（直接表示と遅延復元）、T005（空白入力）、T011（0件からの再編集）で確認する。重複 `att`・Unicode の既存処理は T010 の Parser・Builder 回帰テストで確認する。

## 依存関係と実装順

- 最初に US1 の表示・復元と未変更での再検索を成立させる。T001 と T002 は別のテストファイルを編集するため並行化できる。共有コンポーネントは T003 → T004 の順で接続する。
- 続けて US2 の個別クリアと US3 の Enter 接続を加える。詳細検索ページのテストは T002 → T005 → T007、同じコンポーネントを変更する実装は T003・T004 → T006 → T008 の順に扱う。
- 人間による検証は実装とテストコードが揃ってから行う。T009 → T010 の順で PowerShell の検証を行い、T011–T013 でブラウザー操作を確認する。リリース範囲は US1–US3 とする。

## 作成方法

既定の `setup-tasks.ps1` は Feature 016 を参照する。`SPECIFY_FEATURE_DIRECTORY` を Feature 017 に指定して実行すると `.specify/feature.json` にその指定を保存するため、Feature 017 の承認済み文書を直接読み、リポジトリの Tasks テンプレートに沿って手動で作成した。 [setup-tasks.ps1](../../.specify/scripts/powershell/setup-tasks.ps1) · [common.ps1](../../.specify/scripts/powershell/common.ps1) · [Tasks テンプレート](../../.specify/templates/tasks-template.md)
