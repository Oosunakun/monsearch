# Search Catalog Normalization 実装・受入記録（T030）

**最新Human Decision（2026-10-25）**: effect_name API baseline正常化の追加修正は **APPROVE**、Feature 014のG5は **APPROVE_WITH_EXCLUSIONS**。除外対象は残存する`.memo`内の旧テスト13件。本体の失敗は0件。判断の根拠・再検証結果・除外範囲は末尾「最終Human Reviewの記録」に追記した。

以下の初回実装・検証記録は、追加修正前の状態を示す履歴として保持する。当時の「最終Human Review待ち」や失敗件数を現在の状態として読み替えず、最新状態は上記と末尾の追記を参照する。

## 初回実装・検証時点の記録（履歴）

2026-10-25。T001/T002はHuman Review承認済みとして保持し、再実行・ロールバックなしでT003から単一セッションで順次実行した。**T001〜T030の作業は完了。最終Human Reviewは待機中。**

## 実装結果と主要判断

- US1: kwをsearch_support.full_textだけのliteral部分一致へ切替。独立したN₀は指定幅変換とASCII小文字化のみ。カナ合成・trim・汎用case conversionなし。
- US2: attをsearch_support.archetype_textだけへ切替。kw/att/他条件はAND。正常入力は事前N₀済みstring、optional/nullableは欠測境界として型で表現する。
- US3: createCardSearchMatcherで有効な各queryを走査前に一回だけ準備し、API/searchCardsでpredicateを再利用。対象全文の生成・再正規化・表示値fallbackを除去。単一カードwrapperは互換維持。
- nm/rl/etx、is_token・Token分類、Parser/Builder本体、表示原文、URL、sort/pagination/集計/公開DTO/エラー契約は維持。新規依存・cache・索引・永続モデルなし。

## タスクとStory

| 区分 | タスク | 結果・証跡 |
|---|---|---|
| Setup | T001〜T002 | 既存の承認済み成果物を保持。baseline.json等は差分なし |
| Foundational | T003〜T004 | 共有型と独立した固定期待集合 |
| US1 | T005〜T013 | 固定vector、kw専用照合、API接続、full_text固定点。us1.md |
| US2 | T014〜T018 | att専用照合、kw/att AND、archetype_text固定点。us2.md |
| US3 | T019〜T026 | 呼出構造、入力/URL/原文、既存検索・分類・全ページ回帰。us3.md |
| Polish | T027〜T030 | 通常品質・差異・構造・本受入記録。quality.txt、qds-differences.md、structure.md |

## 実行結果

| 検証 | 終了コード | 結果 |
|---|---:|---|
| US1最終3ファイル（本体） | 1 | 395成功/3既存失敗。us1-verified.txt |
| US2最終3ファイル（本体、US1回帰含む） | 1 | 485成功/3既存失敗。us2-verified.txt |
| US3の指定対象（.memo除外） | 1 | 733成功/3既存失敗、16ファイル。us3-final.txt |
| 型修正後の最終指定対象（.memo含む） | 1 | **932成功/16失敗、31ファイル**。regression-verified.txt |
| npm run lint（最終テスト境界を含む） | 0 | PASS。quality-lint-verified.txt |
| npx --no-install nuxt typecheck（修正後） | 0 | PASS。quality-typecheck-final.txt |
| npm run build | 0 | PASS。Cloudflare Pages presetの生成完了。quality-build.txt |

Vitestは承認されたローカル直接方式を使用した。commandと終了コードはcheck-results.jsonとquality.log/quality.txtに保存。Story単位では`--exclude '**/.memo/**'`だけを追加して本体に限定し、元の設定は変えていない。最終実行ではexcludeを外してquickstartと同じ指定対象を確認した。Repository内すべてのテストを実行したとの意味ではない。

lint初回は重複type importの2件、typecheck初回は追加fixtureのundefined推論とunion narrowingの10件で失敗し、今回のテスト側不具合として修正した。テスト境界の修正後に最終回帰とlintを再実行した。本番Parserの型を緩めたり、無関係な期待値を変えたりしていない。

ビルドには既存のuseLayout auto-import衝突警告とplugin timings警告が出たが終了コードは0。今回の実装中にregistry拒否等の環境失敗は再発しなかった。過去のregistry拒否の根因やallowlist制約を解消したという意味ではなく、セキュリティ設定は未変更。

## 失敗の分類と旧対象との差

final-failures.jsonでT002のFAIL行と最終FAIL行を比較した。

- **保持された既存失敗15件**: 本体APIのeffect_name差3件と、.memo複製の既存12件。既存期待値は未変更。
- **置き換えた既存失敗1件**: 本体の旧null full_text/catalog無視テストはT006の対象として新契約へ更新。入力契約と欠測fixtureを分離している。
- **新たに観測された複製側差分1件**: .memoの旧構造テストが本体handler内にmatchesCardSearchという文字列を要求する。承認済みfactory接続に伴う古い構造期待との差で、本体の新規機能不具合とは扱わない。.memoを修正して隠していない。
- **残る本体の新規不具合・今回の環境失敗は0件**。suite全件成功とは報告しない。

新catalogは旧連結対象と異なるため、旧kw/att結果の完全一致は要求しない。expected-catalog-results.jsonの固定全IDで判定した。kwのラベル1件、スペル記号51件、攻撃力記号25件、＆13件、半角カナ3件、読み3件、対象399件、attドラゴン53件・サモナー10件、併用47件がUnit/APIで一致した。英字DRAGONは実データでは0件で、陽性はfixtureで補う。catalogだけのA/表示だけのB、欠測・literal・非同一視・未正規化target・カナ非合成も固定期待で確認した。

## FR受入

| 要件 | 状態 | 根拠 |
|---|---|---|
| FR-001 | PASS | kw専用値、固定ID/表示非代用、US1 |
| FR-002 | PASS | att専用値、正常stringと欠測型の区別、US2 |
| FR-003 | PASS | 指定幅172文字＋ASCII大文字26文字の全数vector |
| FR-004 | PASS | 固定vectorの冪等性、内部空白・非ASCII大小・カナ非合成・非同一視 |
| FR-005 | PASS | 直接includes、未正規化target非補修、構造確認 |
| FR-006 | PASS | literal、欠測/空条件、kw/att/他条件ANDのUnit/API |
| FR-007 | PASS | criteria/カード不変、Parser/Builder round trip、完全投影比較 |
| FR-008 | PASS | 既存helper群の同一性、nm/rl/etx・同一Effect回帰 |
| FR-009 | PASS | Token、全sort/perPage/ページ境界/集計/公開DTO/エラー回帰 |
| FR-010 | PASS | 固定vector、受領両catalog、独立した固定期待集合 |
| FR-011 | PASS | factory/Unit/APIの時点・引数・回数spy、件数増加/空データ |
| FR-012 | PASS | qds-differences.md、正式QDS/Decision履歴の未変更 |

## SC・Gate受入

| 項目 | 状態 | 実結果 |
|---|---|---|
| SC-001 | PASS | vector213件。172幅文字・26大文字・境界、冪等性。両catalog各482件の固定点 |
| SC-002 | PASS | kw/att/併用、fixture/境界の固定期待全IDが一致。全ページを巡回 |
| SC-003 | PASS（既存失敗・複製差分は別記） | T002の38ケース・371ページ・114境界の完全応答/順序が一致。フォーム・URL・原文・既存検索・分類を保持 |
| SC-004 | PASS | 有効query各一回を走査前に適用。対象全文生成/再正規化・走査中再変換ゼロ |
| G1 | PASS | 同一入力SHA-256、存在・型・空値・固定点。data-audit.jsonのimplementationVerificationに実結果を追記 |
| G2 | PASS | 独立oracleとN₀ vector、Unit/APIで一致 |
| G3 | PASS（suite全件成功ではない） | 非catalog baseline/原文/分類/API契約が一致。上記の既存失敗・複製構造期待は残る |
| G4 | PASS | structure.mdの呼出構造・fixture結果 |
| G5 | **最終Human Review待ち** | 仕様・Plan・Tasks・T001/T002は承認済み。今回の最終実装承認は未取得 |

T001の元の監査フィールド（fixedPointsの当時未実施という記録を含む）を保持し、T012/T017の実装後固定点検証だけをimplementationVerificationへ追記した。事前データPASS・設計整合性と、今回の実装テスト結果を区別している。

## 変更範囲・Planとの差・残課題

本番変更はtypes/cards/finderCards.ts、server/utils/cardSearch/normalizeCatalogText.ts、search.ts、server/api/cards.get.ts。関連テスト5ファイルと固定vectorを追加・更新した。全変更・追加ファイルはfiles-changed.md参照。検証記録はすべて本verification配下。

設計上のPlanとの差はない。実行上の差は承認済みのローカルVitest直接起動、Story検証時の.memo除外、観測用runnerとGit対象外logを保持するtxt複製。正式QDS・Decision・cards.json・依存・既存結果処理・Specification・Plan・契約・T002 baselineは未変更で、preservation.jsonで確認した。

未実施: 定量CPU、実機、ブラウザー速度、人間の手動動作確認。これらは必須完了条件ではなく、成功扱いにもしていない。構造改善から公開可否や実環境性能を保証しない。

残課題は既存API期待値と受領effect_nameの差、.memoの既存実行問題・古い構造期待、既存警告、最終Human Review。今回はFeature外修正へ進まない。Sandbox/allowlist/権限変更、Git commit/push/branch操作、Workflow run/resume、公開・deployは行っていない。

Implementation用before/after hookの登録はなく、実行対象なし。Human Review待ちで停止する。

## 最終Human Reviewの記録（2026-10-25追記）

ユーザーによる今回のHuman Review結果を、過去の判断・検証結果とは分けて記録する。

| 対象 | Human Decision | 範囲 |
|---|---|---|
| effect_name API baseline正常化・再検証 | **APPROVE** | 現行fixtureの分離とAPIテストのimport変更、および再検証結果 |
| Feature 014・G5 | **APPROVE_WITH_EXCLUSIONS** | `.memo`内の旧テスト13件を除外して承認。本体の失敗は0件 |

これは今回の成果物と確認済み結果に対する判断であり、今後のHuman Reviewによる微調整や再検証を妨げない。過去の承認・待機状態は上の履歴と各検証資料に保持する。

### データ訂正の根拠とfixture分離

`effect_name`の空文字は正常データである。データ修正コミット`c0df4c4c71ae8f6b4a5410761243d38f797e336e`（`c0df4c4`）で削除された`Effect 1`・`Effect 2`は誤った仮値だった。このHuman Decisionを根拠に、正しい現行APIではなく、旧入力に依存していたテスト期待値を正常化した。

- Feature 013の`specs/013-deck-restriction-display/verification/api-baseline.json`は、当時のcommit・入力hashに紐づく履歴証跡として未変更で保持した。
- 現行テスト用に`server/api/fixtures/cards-response-baseline.json`を分離。旧baselineの16ケースを基に、card_idとEffect indexで特定した60箇所だけを空文字へ訂正した。40カード・46効果に対応し、`Effect 1`が52箇所、`Effect 2`が8箇所。その他の応答値・構造は不変で、元baselineのcommit・入力hash、修正commit、現行入力hashを出典情報として記録した。
- `server/api/cards.get.test.ts`はimport一行だけを切り替えた。assertion・比較対象・`deck_restriction_count`除外処理を維持し、`effect_name`の比較も省略していない。
- 現行APIと16ケースすべてで完全一致した。詳細は[追加修正の報告](effect-name-baseline/review.md)、[60箇所の対応表](effect-name-baseline/fixture-diff.json)、[API比較結果](effect-name-baseline/api-comparison.json)を参照する。

### 追加修正後の再検証結果

以下は追加修正時に実際に実行した結果であり、上の初回実装時の932成功・16失敗等を置き換えるものではない。今回の文書整理ではテストを再実行せず、保存済みの[実行結果](effect-name-baseline/results.json)と[command・終了コード](effect-name-baseline/commands.txt)を反映した。

| 検証 | 終了コード | 再検証結果 |
|---|---:|---|
| APIテスト（本体、`.memo`除外） | 0 | **204件成功・0件失敗** |
| quickstartの指定回帰（`.memo`含む） | 1 | **935件成功・13件失敗**、948テスト・31ファイル。本体の失敗は0件 |
| lint | 0 | PASS |
| typecheck | 0 | PASS |
| build | 0 | PASS |

### 除外範囲と受入状態

残る13件はすべて`.memo`内の旧テストで、内訳は旧baselineのeffect_name差3件、旧null full_text期待1件、旧helper名への構造期待1件、Vue runtimeの描画失敗8件。[失敗比較](effect-name-baseline/failure-comparison.json)で、初回最終検証から本体APIの3件が解消し、新規失敗が0件であることを確認した。`.memo`は未修正であり、指定回帰全体を全件成功とは扱わない。

Feature 014の実装とFR・SC・G1〜G4の既存自動確認結果を維持し、G3/SC-003で別記していた本体API fixtureの残課題は解消した。G5の最新状態は上記の **APPROVE_WITH_EXCLUSIONS**。残る`.memo`の旧テストと既存警告は区別して保持する。

Feature 014のT002 baseline、cards.json、実装コード、既存のbaseline・実行ログ・過去のHuman Decisionは未変更。[保持確認](effect-name-baseline/preservation.json)に記録した79ファイルのhash一致を根拠とする。今回の記録整理で変更したのは本書とfiles-changed.mdだけであり、ソース・テスト・fixture・入力JSON・`.memo`・依存設定は変更していない。Git commit・push・branch操作は行わず、記録整理を終えて停止する。
