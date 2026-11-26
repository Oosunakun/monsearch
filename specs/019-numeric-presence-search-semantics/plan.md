# Feature 019 実装計画

**ブランチ** `fix/numeric-presence-search-semantics`  
**作成日** 2026-11-25  
**状態** APPROVED（`minimal-review` のSpec・Plan統合Human Review）  
**関連** [Spec](spec.md) · [Issue #34](https://github.com/Oosunakun/monsearch/issues/34)

## 概要と技術前提

詳細検索のBuilderで対象7項目のURL出力を制御する。共通Matcherでは、通常・追加の6項目の明示的な存在性判定に能力の適用条件を加える。受信時はParserで復元したComparisonを評価できる既存経路を利用する。TypeScript strict、Nuxt 4、Vue 3、Vue Router、Vitestを用いる既存構成で、フォーム型、カードデータ形式、API入出力は既存のものを使う。

`.specify/workflows/minimal-review.overlay.yml` の統合ゲートでSpec・Planを承認済み。Feature 019は空いており、`.specify/feature.json` はFeature 016を参照しているため、対象ディレクトリに2ファイルを直接作成した。調査結果、データ境界、契約、受入確認はこの2ファイルに収録した。Repositoryに `.ai/guide/` は見つからなかったため、`AGENTS.md`、`.specify/` の憲章・ワークフロー・テンプレートとFeature 002のPlanを作業規約として参照した。

## 現行実装と原因

| 責務 | 調査結果 |
| --- | --- |
| SearchForm・既定値 | `app/types/ui/search.ts` の `FilteredNumericCondition` で `filterType` と `operator` / `value` を保持する。`app/utils/search/cardSearchFormFactory.ts` が7項目とレベルを `{ filterType: 'all', operator: 'gte', value: null }` で個別に生成する。 |
| Modifier UI | 通常3項目・英雄点と追加3項目の `SearchField*.vue` は、親フォームの3プロパティを `SearchFilterWithOperator.vue` にバインドする。Modifier用トグルは `filterType` のみを操作する。数値・演算子は `include` のときに `SearchValueWithOperator.vue` で表示され、非表示時も親に保持される。レベルは `SearchFieldLevel.vue` の `alwaysShowValue` で常時表示。分類変更時は `app/pages/cards/search.vue` がセクションを `v-show` で隠す。 |
| Builder | `app/utils/search/cardSearchQueryBuilder.ts:37` の `putFiltered` は、`all` のModifierを省略した後も有効なComparisonを出す。非表示の保持値が `it=gte:2` などとして残る直接原因。通常の `exclude` はすでにModifierのみを出力し、レベルは `alwaysShowValue=true` で比較を出力する。分類の出力制御は同ファイルのグループ分岐と `cardSearchQuerySchema.ts:51` 以降にある。 |
| Parser | `app/utils/search/cardSearchQueryParser.ts:18`–`31` の `parseComparison` / `applyFiltered` はModifierとComparisonを別々に検証し復元する。Modifierなしでは `all` が残る。値は `gte/eq/lte` と有限数を受理し、小数も実装上は受理する。Query Data Specification §5.1の整数記述とは差があるが、文法変更は今回の範囲外。 |
| Matcher | `shared/cardSearch/search.ts:50`–`54` では `all` でも比較値があれば評価し、`exclude` は値が `null` / `undefined` なら一致する。6項目の呼び出し（同 `222`–`234` 行）は `unit?.ability` / `equip?.ability` から値だけを渡す。カードに対象詳細がない場合も、適用対象で能力がない場合も `undefined` になり、戦闘スペル・地形・反対側の能力グループまで一致する。既存の分類比較（同 `195`–`199` 行）は `cc` が指定された場合の条件で、能力ごとの適用判定は行わない。 |
| 既存の例外 | Matcherの英雄点は `unit` と `is_hero`、レベルは `unit` と `is_instant_summon` を参照する。所持枠の `none` には `unit` / `equip` の必須チェックがある。これらの分岐を今回の6項目へまとめて変更する必要はない。 |
| 結果・条件編集 | `app/pages/cards/index.vue` は元の `route.query` で検索する。`ResultControls.vue` は元のQueryのまま `/cards/search` へ遷移する。詳細検索ページは初期化時にParserで復元し、直アクセス時の遅延復元にも同じParserを使う。検索ボタン・Enterは `executeSearch` に合流し、Builderの出力を検索イベントと `/cards` への遷移に渡す。 |
| 共通検索 | CSRの `app/composables/useCardSearch.ts` は `normalizeClientSearchQuery` を経由し、APIの `server/api/cards.get.ts` は `getQuery` を経由して、ともに `shared/cardSearch/runner.ts` の `prepareCardSearch` → `runCardSearch` を呼ぶ。前者でParserからMatcherを作り、後者で絞り込み後にソート・ページ分割・投影・分類集計する。`server/utils/cardSearch/search.ts` は共通Matcherを再エクスポートする。受信検索にはBuilderが介在しない。 |

## 設計

### URL生成と受信

- Builderで `putFiltered` の規則を変更する。7項目は `all` なら両Aliasを省略、`include` ならModifierと有効なComparison、`exclude` ならModifierのみ。レベルは例外でModifierの既定値省略とComparison出力を独立に行う。既存の有効性チェック・Alias順序・分類分岐を再利用し、入力フォームを変更しない。
- ParserはModifier省略時の `all`、明示 `all`、`exclude` とComparisonの併記を含め、現在の復元を継続する。表示するModifierと受信検索の意味は、同じフォーム型からそれぞれの処理で決まる。Parserで値を削除したり、`include` を補ったりする必要はない。
- 具体例は `/cards?it=gte:2` → 2以上で検索 → `/cards/search?it=gte:2` で `{ filterType: 'all', operator: 'gte', value: 2 }` → そのままなら `/cards`、「あり」なら `/cards?itm=include&it=gte:2`。他の有効条件があれば再検索URLに引き継ぐ。`he=eq:0` も同じ遷移で、`hem=include` は利用者が選んだときだけ加わる。既存のURLを直接開く、結果画面で並べ替える、APIを直接呼ぶ場合は受信時の意味を適用する。

### 通常・追加の能力適用判定

能力が適用できるかを、各能力値の有無とは独立して判定する。Tokenの識別は既存の `search_support.is_token` または大小文字を区別しない `card_category_code='Token'` に合わせる。通常・追加の6項目の適用条件と欠損時の扱いは、承認済みのHD-01に従う。

| カード | 適用条件 | 欠損時の `exclude` |
| --- | --- | --- |
| 非TokenのUnit | `card_category_code === 'Unit'` なら通常側に適用 | `unit`、`unit.ability`、対象値の欠損はいずれも一致 |
| 非TokenのItem・Equip | `card_category_code === 'Item'` かつ `item.item_category_code === 'Equip'` なら追加側に適用 | `item.equip`、`item.equip.ability`、対象値の欠損はいずれも一致。`item` 自体の欠損はEquipと識別できず適用対象外 |
| Token | `unit` があれば通常側、`item.equip` があれば追加側にそれぞれ適用 | 対応詳細があれば能力行や対象値の欠損は一致。対応詳細の欠損は該当グループの適用対象外 |
| その他の非Token | 戦闘スペル・地形・消耗品・錬金弾などは両グループの適用対象外 | 一致しない |

| 入力 | 共通Matcherでの評価 |
| --- | --- |
| `all`・Comparisonなし | 該当項目で絞り込まない |
| Comparison単独または明示 `all` とComparison | 既存の数値比較。既存URLの結果を維持するため、新しい存在性の適用判定はかけない |
| `include` | 適用対象かつ非NULL・非欠損。Comparison併記時はAND |
| `exclude` | 適用対象かつ対応詳細・能力行・対象値の欠損、または対象値がNULL。Comparisonは評価しない |

6項目の既存値比較を再利用し、通常側・追加側ごとに適用判定を共有する。実カードの `cc` フィルターと存在性条件はそれぞれANDで働く。0や負数は値として残し、英雄点・即時召喚・所持枠は既存の個別分岐で評価する。

## 変更予定ファイルと影響範囲

| ファイル | 予定 |
| --- | --- |
| `app/utils/search/cardSearchQueryBuilder.ts` | 7項目のcanonical出力とレベルの独立出力を区別する。 |
| `shared/cardSearch/search.ts` | 6項目に適用対象の判定を加える。変更はCSR・API双方に反映される。 |
| `app/utils/search/cardSearchQueryBuilder.test.ts`、`cardSearchQueryParser.test.ts`、`cardSearchQueryRouter.test.ts`（同ディレクトリ） | 7項目の出力、独立復元、実際のルート遷移を確認する。 |
| `app/pages/cards/search.test.ts`、`app/pages/cards/index.test.ts` | 実コンポーネントの入力保持、直アクセス・条件編集と再検索を確認する。既存の一括クリアと遅延復元を回帰対象に含める。 |
| `server/utils/cardSearch/search.test.ts`、`shared/cardSearch/runner.test.ts`、`server/api/cards.get.test.ts` | 適用判定、検索結果の期待ID、実APIとCSR経路の一致を確認する。`app/composables/useCardSearch.test.ts` の既存ルートQuery伝達テストも回帰確認に利用する。 |
| `tests/fixtures/cardSearch/cards.ts`、`sources.ts`、`app/utils/search/cardSearchQueryTestFixtures.ts` | 既存factoryを再利用する。複数テストで同じカード集合が必要な場合に限り、独立したfixtureシナリオを追加する。 |

Parser、Schema、SearchForm factory、7項目の入力コンポーネント、ページ間のQuery受け渡しは現行処理で要件を満たすため、実装の変更は不要と判断した。共通Runner、CSR・APIの入口、server側のre-exportは共通Matcherを既に利用しており、これらにも実装変更は不要。詳細検索イベントに渡すQueryも出力規則に従って変化し、分析イベントの実装は既存のまま利用する。Quick SearchのBuilderは詳細検索の `putFiltered` を使っていない。

## テストマトリクス

| 境界 | 設計するケースと期待結果 |
| --- | --- |
| Builder | 7項目 × 4状態（`all`、`include` 数値なし、`include` 数値あり、`exclude`）。`all` / `exclude` には保持済み比較を与え、Comparisonが出ないことを保証する。0、負数、不正演算子、非有限値、Alias順序、フォーム非破壊も確認。分類なし・`unit`・`item-equip`・`token`・非適用分類で出力を確認する。 |
| Parser・Router | 7項目のComparison単独を `all` と元の値・演算子に復元し、Builder再生成で省略。`include` に切り替えて生成すると両Aliasが出る。明示 `all`、`exclude&Comparison`、不正・重複パラメータ、他条件の保持を確認する。 |
| UI・条件編集 | 実子コンポーネントで「あり → すべて → あり」と「あり → なし → あり」の表示・値・演算子保持を通常・追加・英雄点の代表項目で確認する。結果から元Queryを渡し、無変更で再検索した場合と「あり」に変えた場合のURLを比較する。分類切替後の再表示、直アクセス・再読み込み、一括クリアも確認する。 |
| 6項目のMatcher | 各項目で対象カードの能力行なし・NULL・値欠損・0・正数・負数と、適用対象外のカードの混合集合を使用する。`include`、`exclude`、両者のComparison併記、Comparison単独を期待IDで判定する。戦闘スペル・地形・儀式・召喚術師・消耗品・錬金弾、通常側と追加側の相互除外、`cc` とのANDを確認する。 |
| 非Tokenの詳細欠損 | Unitで `unit` または `unit.ability` が欠損すれば通常側の `exclude` に一致。Item・Equipで `item.equip` または `item.equip.ability` が欠損すれば追加側の `exclude` に一致。Itemで `item` が欠損すれば追加側の `include` / `exclude` ともに不一致。適用対象でも値を取れないケースは `include` とComparison単独に不一致。 |
| Token | `unit` のみ、`item.equip` のみ、どちらもなしを用意し、対応グループの詳細があって能力行がない場合の `exclude` 一致と、対応詳細がない場合の不一致を確認する。分類コードと `is_token` の双方を識別経路としてカバーする。 |
| 英雄点・レベル・所持枠 | 英雄点は `is_hero` 真偽と `hero_point` のNULL・0・正数を組み合わせ、`he` 単独、`hem=include`、`hem=exclude&he=…` を分ける。レベルは `lv` 単独および `lvm=include/exclude` 併記、所持枠は通常・追加の `none` を回帰確認する。 |
| CSR・API | 同じfixture・受信Queryで、Comparison単独、通常・追加の `exclude`、英雄点、レベル、他条件併記を実APIハンドラーとCSRの `normalizeClientSearchQuery` → 共通Runnerで比較する。一致ID・件数・分類集計・ページ結果を期待値で確認する。両経路同士の一致に加え手書き期待値も使用する。 |

既存テストにはイニシアチブのModifier単独・0・`exclude` 抑止、追加イニシアチブのAlias、レベル例外、Parserの `exclude` 併記復元、画面のチャージ非表示・保持、Matcherの0/NULL・英雄点・即時召喚がある。主な不足は、全7項目の `all` 抑止、Comparison単独の画面往復、通常・追加を横断した適用対象別の一致集合である。既存テストは読み取りで照合した。

### Fixtureと回帰リスク

- `makeCard()` はUnitを既定にする。`boundaryCards().parentAbsent` はUnitのまま `unit:null` になり、`boundaryCards().equipment` は装備品詳細を足しても分類がUnitのまま。既存の装備品factoryも `item_category_code:'equip'` で、分類照合の正式コード `Equip` と異なる。新規の適用テストでは `Item` / `Equip`、他の分類、対応詳細を明示し、対象外カードに既定のUnit詳細を残さない。既存fixtureの共通既定値は維持する。
- 読み取った歴史fixtureと開発用mockは各482件で、いずれもToken 7件中6件に `unit` があり、1件は対応する通常・追加詳細がない。装備品詳細を持つToken、および分類と対応詳細が食い違う非Tokenの境界は合成fixtureで扱う。歴史fixture、承認済みbaseline、公開データを期待値合わせのために再生成しない。
- `all` を検索Matcherの非活性条件へ一律変更すると、Comparison単独URLの意味を失う。英雄点の自動 `include` は英雄属性を新たに要求する。どちらも別の受入ケースで検出する。
- Builderの共通処理を変える際に `lv` を巻き込むと、即時召喚の選択時にレベル比較を失う。通常・追加のMatcherを同時に変更する際は所持枠や英雄点の既存分岐との混同を避ける。
- カード値の `NaN` / `Infinity` は通常のJSON入力で数値として流通しない。`matchesFiltered` の存在判定は現行ではnullishチェックで、Feature 010のデータモデルの「有限数のみ」という記述とは異なる。今回の設計では入力Comparisonの非有限値拒否と、保存データのNULL・欠損・0を主な検証対象とし、異常カード値の取り扱い変更は対象外とする。
- Comparison単独URLを編集して無変更で送信した場合は結果が広がり得る。元URLの直接検索には従来の比較が適用される。既存ボタンの範囲外の比較値は表示に選択済みボタンがなくても内部に復元できるため、既存の数値選択肢で表示可否を判断するテストと、URL・内部状態で保持を確認するテストを用意する。

## ドキュメント更新方針

実装時はQuery SpecificationをURL契約、Query Data Specificationを能力の適用・照合契約の基準とし、両文書を先に揃える。関連文書はこの2つの正式仕様へ参照を向け、当時の意思決定は後続仕様の注記を添えて履歴として保持する。

| 確認した実在文書 | 実装時の更新方針 |
| --- | --- |
| 英語 `docs/architecture/query_specification.md` | §2.3・§2.4.1の7項目、§3.5のComparison省略条件、§4.6・§7.1–7.3のcanonical再生成・Parser・round tripの記述を同期する。受信Comparison単独が有効であること、フォームの `all` からは両Aliasが省略されること、無変更の編集再検索でも条件が変わり得ること、レベルの独立規則を例示する。§1.2と§6.2も参照し、既存URL互換の保証が受信時の検索に適用されることを揃える。 |
| 日本語 `docs/architecture/query_data_specification.md` | §2.3・§5.2に6項目の `include` / `exclude` の適用判定、HD-01の非TokenのUnit・Item・Equipと詳細欠損、Equipと識別できないItemの除外、Tokenの対応詳細、受信Comparison単独の意味を明記する。§5.3のレベルの独立性と§9–10の例・改訂表を照合する。Short UUIDの古い長さ記述は§1.1、§4.2、§10の3箇所で、ASCII 16進固定5文字、受理時は大文字小文字を区別せず、小文字canonicalへ訂正する。 |
| 日本語 `specs/010-numeric-presence-search/` | `contracts/numeric-presence-query.md`、`spec.md`、`data-model.md`、`quickstart.md` に新契約への参照または改訂注記を加え、比較単独の受信とUI再生成、適用範囲、UI再表示条件の現行契約を揃える。過去の計画・調査・タスクは履歴として扱う。 |
| 日本語 `specs/005-search-condition-edit/contracts/search-condition-edit.md` と英語 `specs/002-query-builder/contracts/card-search-query.md` | 実在する整合注記をFeature 019へ更新し、無変更の往復は常に同じ意味になるという記述にComparison単独URLからの再検索の例外を記載する。 |
| 日本語 `docs/architecture/query_data_specification_note.md`、`query_data_specification_revision_candidates.md`（同ディレクトリ） | 補足のD27・D35–D38付近と改訂候補の「合意した意味」「数値・所持条件」に、HD-01、受信Comparison単独とフォーム再検索の違い、および `exclude` 併記時の確定規則への参照・改訂注記を加える。D8にはレベルの独立性と `hem=exclude` の既存例外を示す正式仕様を参照させる。D63とShort UUIDの関連候補にはFeature 011での確定形式への参照を添える。 |
| 日本語 `README.md` | 「主な機能・検索方法」の詳細検索と「条件を編集」の案内に、数値条件の「すべて」は数値で絞り込まないこと、「なし」はその能力の適用対象カードから探すこと、Comparison単独の共有URLは直接検索できること、編集後の再検索では画面のModifier選択からURLを再生成することを簡潔に補足する。詳細は「関連ドキュメント」にある既存の「検索URLの仕様」と同じ相対パス `docs/architecture/query_specification.md` で参照する。 |

Query Specificationの別日本語版やQuery Data Specificationの別英語版は見つからなかった。Feature 011の `spec.md` と `contracts/card-search-query.md`、`cardSearchQuerySchema.ts` の `SHORT_UUID_LENGTH` とASCII検証・小文字化をShort UUID訂正の根拠とする。別言語版の新設やShort UUIDのParser・Builder・Matcher変更は対象外。

### ドキュメントの検証

- 正式仕様2文書、関連契約、READMEの説明をテストマトリクスと照合する。代表例として `/cards?it=gte:2` の直接検索・無変更の再検索・「あり」へ切り替えた再検索、`itm=exclude` と `aitm=exclude` の対象・欠損別の一致、`lvm=exclude&lv=gte:2` の独立評価を確認する。
- READMEからQuery Specificationへの相対リンクが解決し、4点の案内と正式仕様が一致することを確認する。正式仕様の現行ルールに残る旧Short UUID長や「長さ未決定」の記述を確認し、歴史的記述には確定仕様への参照があることを確認する。

## Human Decisionとレビューゲート

**HD-01（A案、APPROVED）** をMatcher設計とテストマトリクスに反映した。Query Data Specificationの更新時は、FR-006・FR-007と同じ期待結果を明記する。未決のHuman Decisionはない。

憲章の型安全性、テスト可能性、段階的変更、既存の責務分割を設計に反映した。統合Human Reviewの決定はSpec・Planへ反映済み。Tasks作成と既存ドキュメント・READMEの更新は次工程で行う。

## 実装後Human Reviewの決定（APPROVED）

現行の承認済み仕様の正本を `docs/architecture/` に置き、完了済みFeatureの要件・設計・判断・検証資料を当時の履歴として保存する方針を承認した。上記「ドキュメント更新方針」は当初の計画として残す。

当初はFeature 002・005・010の資料を更新する計画で、T018・T019として一度変更した。実装後のHuman Reviewで履歴保全を優先し、その変更を撤回した。現行の規則は正式Specificationに反映し、Query Data Specification系列の3文書は、系列内で検索意味論・Decision履歴・改訂候補を理解できるように整理した。

Feature 019の最終成果物はコミット `41e827d` に含まれる。ソースコードの実装、テスト・lint・typecheckの結果、ブラウザー検証に対するHumanの承認は維持する。 [実施記録と最終状態](tasks.md#実装後human-reviewの記録)
