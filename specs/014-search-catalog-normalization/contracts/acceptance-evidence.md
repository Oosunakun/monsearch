# 受入・自動検証記録の契約

本契約のFeature固有確認はRepository内のcards.json、TypeScript検索処理、Unit Test、API Testを対象とする。通常の品質検証として既存のフォーム／検索ページ回帰・lint・typecheck・buildもquickstartに従って行う。提供工程の証跡・作業を要求しない。G1〜G4の結果をG5へまとめる。実装は仕様・PlanのHuman Review承認後に行う。

## G1: Repository入力（FR-001/002/005/010）

現行482件の両catalogは受領済みで、存在・string型・N₀固定点のCodex事前検証はPASS。新たな受領待ちGateを設けない。

実装後の入力確認はRepository内で行い、必要な結果をverification/data-audit.jsonまたはテスト記録へ残す。

| 項目 | 必須確認の範囲 |
|---|---|
| 入力識別 | cards.jsonのpath・version・件数。再現用hashは必要に応じ記録 |
| 専用値 | 両項目の存在・型・空値状態、N₀(value) = value |
| 対応 | card_idで入力を識別し、期待ID集合と対応付ける |
| 原文保持 | 固定fixtureの原文不変と、既存APIレスポンスの回帰 |

正常入力のstring契約と、matcherの欠損・null非ヒット境界を区別する。不適合が見つかっても検索時に補修しない。追加Runtime全件検査は不要。検証を入力境界より前の工程へ拡張しない。

## G2: N₀・固定期待ID集合（SC-001/002）

- Repository内の固定vectorで幅対応172文字、ASCII大文字26文字、内部空白・改行・タブ、literal、非同一視、カナ非合成、境界文字を確認する。
- 期待変換は仕様から固定し、本番normalizerから生成しない。全例の一致と冪等性を確認する。
- catalogだけの語、表示だけの語、欠損・null・空文字、kw / att / ANDで独立した固定期待ID集合と比較する。
- 未正規化catalogは照合時に補修しないことを境界fixtureで確認する。
- API Testでは全ページのID集合・件数・順序を確認する。先頭ページ・件数だけで代用しない。
- 実データと固定fixtureの結果を区別し、hitのない実データ例を陽性検証済みとしない。

## G3: 既存検索・分類・原文（SC-003）

同じRepository入力でcatalog条件なしの事前baselineを保全する。nm / rl / etx、数値・枠・コスト、複合条件、sort各方向、page / perPage境界を既存Unit/APIで確認する。

is_tokenの値と既存Token分類を維持する。items・totalCount・categoryBreakdown・sort・page / perPage / totalPages・応答項目・エラー契約を比較する。catalog条件ありは新契約の固定期待集合を基準にし、旧連結値との差を新規不具合と混同しない。

criteria・カード原文の不変性、既存Parser/BuilderのURL表現保持、投影される表示原文を自動テストで確認する。既存のuseCardSearchForm.test.tsとapp/pages/cards/search.test.tsも回帰対象に含める。ブラウザー操作や人間の実動作確認は必須としない。

既存失敗と新規差分は事前baseline・logに紐づけて分類する。無関係なbaseline更新を完了条件にせず、既存失敗を含むsuite全件成功とも表現しない。

## G4: 繰返し処理除去の自動確認（FR-005/011、SC-004）

| 対象 | 必須の構造 |
|---|---|
| query準備 | 有効なkw / attそれぞれN₀を走査前に1回だけ適用 |
| predicate | カード数を増やしても、走査中のquery N₀追加呼出は0回 |
| catalog対象 | kw / att全文の生成・再正規化なし |
| 呼出経路 | APIとsearchCardsが各走査で一つのprepared matcherを使う |
| 既存結果処理 | 分類・AND・集計・sort・pagination・projectionを維持 |

固定fixtureの検索結果、normalizerの呼出回数確認、未正規化catalogを補修しない境界確認を組み合わせる。未指定・空のcatalog条件はskipする。単一カード用互換wrapperの動作と、API / searchCardsのbulk走査を区別する。

性能改善の必須判定はこの構造要件とする。CPU反復測定・中央値改善、実機測定、ブラウザー速度、人間による実動作確認は必須記録でも完了Gateでもない。その未実施を完了済みとせず、Implementation未完了の理由にもしない。実行環境の性能適合・公開可否の保証とは区別する。

## G5: Human Reviewと現在のGate

G1〜G4・SC-001〜004の自動確認結果、意図した旧対象との差、既存失敗・新規差分を報告する。設計資料の整合確認、事前データPASS、将来の実装・テスト結果を混ぜない。

仕様・PlanのHuman Review承認前に実装しない。承認後は承認された範囲で実装・検証を進め、未実施の項目を成功扱いしない。新たな未決定事項・提供工程依存はない。
