# R24 Human Decision記録

**記録日**: 2026-10-31。R24の承認済み方針とHuman Review結果をGit管理下で追跡する正式Artifact。[仕様](spec.md)・[Plan](plan.md)と併せて読む。作業メモの取得は不要。Q1〜Q4およびHD-C08（B）は承認済み。今回は設計Artifactの更新のみで、Tasks生成・Implementationの開始は指示されていない。

## 1. 承認履歴と適用範囲

Humanから「Q1〜Q4はすべて推奨案Aで承認済み」と通知され、その後「R24 Human Decision反映」でQ3の追加条件が確定した。本記録はその指示を整理したもので、新たな承認を推定しない。

| 質問ID | 通知された結果・判断内容 |
|---|---|
| Q1 | A承認：歴史的全件Fixture＋小規模Fixture＋最新C/D |
| Q2 | A承認：既存Oracle・検証記録の保全 |
| Q3 | A承認：全テストの依存調査と問題箇所の段階的移行。cards.json以外のmockData・検索用JSONも含む。次節の追加条件を含む |
| Q4 | A承認：Spec Kit Minimal、Human Review後のImplementation、最終検証Gate |

初回記録ではQ番号と方針の対応が不明だったが、今回の「R24 Human Review最終Decision反映」でHumanが上表の対応を明示したため補完した。Q1〜Q4を再質問しない。Q4の承認は、今回の「設計Artifact更新のみ」という工程制限を解除しない。

## 2. Q3の追加条件とScope

Humanが確定した条件：

> 今後cards.json、その他のmockData、検索用JSONデータが追加・変更・削除されても、仕様に適合するデータ更新が原因で既存テストが不要に失敗する設計を解消すること。

- 既知の13直接依存ファイルは調査起点であり上限ではない。全テストの直接・間接依存を、共有helper・Mock・再export・選択肢生成・ファイル読込まで調べる。
- cards.json以外のmockData・検索用JSON・検索選択肢JSONも含む。固定件数・特定ID・特定本文・選択肢の固定配列等を棚卸しする。
- 仕様上の固定契約と更新可能な観測値を分け、元の検証意図を固定Fixtureまたは仕様ベースの不変条件で維持する。
- 最新データが必要な統合テストは残す。正常な追加・変更・削除への耐性と、不正データ・仕様違反を引き続き検出できることを両立する。
- 調査で問題が確認されたテストだけを変更する。件数・陽性例の消失を理由に検証を弱めず、固定入力に陽性・陰性を残す。

静的調査結果と実際の変更候補は[test-inventory.md](test-inventory.md)を正本とし、本記録へ複製しない。調査時点の件数を将来の固定値にしない。

## 3. 継承する重要方針

| 方針 | 承認内容・制限 | 詳細の参照先 |
|---|---|---|
| 検証責務 | A:固定検索回帰、B:独立完全DTO、C:最新入力整合性、D:最新入力統合を分離 | [契約](contracts/search-test-data.md) |
| 歴史的Oracle | Feature014・015の仕様・設計・Oracle・検証済み期待値・承認済み検証記録、既存API期待値を削除・上書きしない。015の承認済み旧atk補正を保持 | [research §1〜2](research.md)、[015契約](../015-search-result-sorting/contracts/search-result-sorting.md) |
| 固定入力 | 歴史的全件入力を対応Oracleと組にして保全し、小規模の明示Fixtureと併用する。通常のマスター更新では変更しない | [data-model](data-model.md) |
| 入力来歴 | 元Revision・path・blob・bytes・SHA-256・対応Oracleを追跡する。通常テストにGit履歴やネットワークを要求しない | [research §2](research.md#2-歴史的入力と来歴) |
| 独立した期待値 | Production検索・sort・投影の出力から期待値を自動生成しない。完全DTO比較や適用hash、境界・異常系を維持。parityだけに置換しない | [契約 §1](contracts/search-test-data.md#1-ab-固定入力と独立した正解) |
| 最新データ | 最新入力に対して仕様に基づくC/Dを維持。過去の全文・件数・特定IDとの一致を要求しない。新たなデータ品質仕様は独断で追加しない | [research §4〜6](research.md)、[契約 §3〜5](contracts/search-test-data.md) |
| 変更制限 | 検索仕様・UIの振る舞い・本番Schemaを変更しない。Productionコードは原則変更しない。必要と判明した場合は根拠・最小案・影響を提示して判断を受ける | [spec](spec.md)、[plan](plan.md) |
| 完了判定 | 正常な追加・変更・削除への耐性、固定回帰能力、不整合検出、Oracle保全、Assertion対応表、全体PASSを確認する。未実行・環境失敗をPASSとしない | [quickstart](quickstart.md) |

入力hash対応は確認済み事実であり、Fixtureファイルの作成・接続後のPASSは未検証。元入力とOracleの対応表・取得方法はresearch/data-modelを再利用する。過去の176 failed / 854 passedはHuman環境での既報であり、この設計修正で得た実行結果ではない。

## 4. 今回のHuman Review指摘の反映

- US3・US4をP1へ変更する。US1〜US4のすべてをR24完了に必須とし、部分実装で完了としない。
- C08はFeature008を根拠に再確認し、初回レビューでは意図的無効行の識別を新規判断として提示した。今回HD-C08のB承認により、下記のとおり公開全行を対象とする方針が確定した。
- 正式な仕様・設計・承認記録は本ディレクトリで理解できるようにする。Git管理外の作業メモは補助的記録であり、唯一の根拠・必須入力にしない。
- 今回は設計Artifactの調整のみ。今回承認されたQ1〜Q4・HD-C08の範囲を正式に反映し、Tasks生成・Implementation・Gitコミットには進まず停止する。実行検証・R24実装完了の承認とは区別する。

## 承認済み HD-C08 商品行の参照検査対象

**状態**: Human Decision **B承認済み**（2026-10-31、「R24 Human Review最終Decision反映」）。

**確認済み事実**: [Feature008 data-model §2](../008-open-card-set-results/data-model.md#2-product-row)は許可済みsearchValueをvalid、その他をinvalidとしてnavigationを抑止する。[UI契約](../008-open-card-set-results/contracts/card-set-navigation.md)も同じ境界を定義する。実装の[builder](../../app/utils/search/productSearchLocation.ts)と[ProductTableRow](../../app/components/products/ProductTableRow.vue)はこのmembershipによって遷移可否を決める。行が意図的に無効なのか、参照先の誤削除なのかを示す独立した属性・分類規則は確認できない。

**判断経緯**: Feature008のUI fail closedだけでは、マスター整合性検査から除外してよい行の意図は決まらなかった。初回案では独立した例外記録の導入も候補に挙げたが、今回Humanは意図的無効行が現時点で存在しないことを明示し、例外機構を導入しないBを承認した。以前の例外案は今回の実装対象外である。

**確定内容**:

- `/`と`/restrictions`の公開商品行はすべて有効な商品検索参照を持つこと。各行のsearchValueが`productItems.json`に存在しなければ参照不整合としてテスト失敗にする。
- membershipで検査対象を事前除外しない。空値・形式不正・未登録値も診断対象から外さない。各一覧のrow.id一意性を維持する。
- 意図的無効行は現時点で存在しない。例外設定・除外リスト・将来用の例外機構は実装しない。
- 最新データの参照整合性検査と、固定異常FixtureによるUIのfail closed検証を両方残す。参照先だけを削除した不正例と、参照元も対応更新・削除した正常例を区別する。
- 将来、意図的無効行が必要になった場合は、その時点で要件・除外条件・例外管理方法をHuman Reviewする。

**商品名とIDの対応の確認結果**: [research §5](research.md#5-最新入力の契約と参照方向)に根拠と検証限界を記録した。008は表示名を検索identityにせず、row.idとsearchValueを別責務とする。実データでも表示名の省略があるため、名称の単純一致や部分一致を新たな規則にしない。現在の契約・入力には、表示名とsearchValueの意味的対応を独立に保証する正本Mappingを確認できない。既存C08で検出できる参照切れと、有効ID間の取り違えを混同しない。

**残る状態**: 現在の設計範囲に未決Human Decisionはない。有効ID同士の商品名との取り違えを一般的に自動検出する保証はなく、これは検証上の限界として明示する。将来その保証を追加する場合は、信頼できるMappingと仕様を別途レビューし、今回の承認から推定して追加しない。実装・更新耐性・全体テスト・公開成果物の実行結果は引き続き未検証。
