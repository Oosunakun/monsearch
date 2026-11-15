# 調査と設計判断: R24

**調査日**: 2026-10-31。対象は現在のRepository。資料・実コード・全trackedテストの読み取りとGit blobのメモリ上照合を行った。Vitest、lint、typecheck、build/generateは実行していない。

## 1. テストの入力と保証の分離

**決定**: A（固定振る舞い）、B（独立完全DTO）、C（最新整合性）、D（最新統合）を使い分ける。各Assertionの移行を[test-inventory.md](test-inventory.md)と実装時の対応表で追跡する。

**理由**: Runner/APIは最新cardsを014・015の固定期待値と比較している。変更可能な入力と固定期待値の対応が失われている。既報の176 failed / 854 passedは過去の結果であり、今回の実行結果ではない。

**検討した代替案**: 最新DTO Oracleの自動生成は正解の独立性と更新耐性を失うため不採用。全件Oracleを小規模例だけへ置換すると全ページ・完全DTOの検証を失う。API/CSR parityだけでも共有バグを検出できない。

**根拠**: [仕様FR-002〜007](spec.md)、[014受入契約](../014-search-catalog-normalization/contracts/acceptance-evidence.md)、[015ソート契約](../015-search-result-sorting/contracts/search-result-sorting.md)。

## 2. 歴史的入力と来歴

**決定**: 次のGit blobの元bytesを実装時に一度だけ保存する。通常テストはローカルfixtureを読み、hashを検査する。

| 項目 | 今回の再確認値 |
|---|---|
| revision | `27209dfd0d5fb35cf0900aaa1d0cbcd8391e05e5` |
| path | `app/utils/mockData/items/cards.json` |
| blob | `8fc90b208e4a2fefe9577fb54d234e934cdd405d` |
| bytes | 2,283,572 |
| SHA-256 | `a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca` |
| version / cards | `1.0.0` / 482 |
| 保存予定 | `tests/fixtures/cardSearch/historical/014-015/cards.json` |

`git show`のstdoutを.NETのBaseStreamからMemoryStreamへ読み、SHA-256を計算した。PowerShellのテキストredirectによる改行変換はしていない。014 baseline.input、catalog Oracle.input、API fixture.currentInputのhash一致を今回再確認した。015 oracle-provenanceの同じhashとも対応する。fixtureの書き出し・検索結果の実行比較は未実施。

Git管理下の対応先は次のとおり。同一入力の識別と、期待値の独立性の根拠をRepositoryだけで確認できる。

| 資産 | 対応関係・用途 |
|---|---|
| [014 baseline](../014-search-catalog-normalization/verification/baseline.json) | input.sha256、classificationsの入力ID順、projectedItems、38ケースの全ページ・境界・hash |
| [014 catalog Oracle](../014-search-catalog-normalization/verification/expected-catalog-results.json) | input.sha256、realCasesの固定ID、独立したliteral照合のmethod、合成例・境界 |
| [015期待順](../015-search-result-sorting/verification/expected-sort-results.json)・[bucket](../015-search-result-sorting/verification/oracle-buckets.json) | 数値キー別の固定全順序・参照値と所属ID |
| [015来歴](../015-search-result-sorting/verification/oracle-provenance.md)・[期待値helper](../015-search-result-sorting/verification/sort-expectations.ts) | 元入力hash・Productionをimportしない生成方法、014 DTOと015旧atk補正の接続 |
| [API fixture](../../server/api/fixtures/cards-response-baseline.json)・[訂正記録](../014-search-catalog-normalization/verification/effect-name-baseline/review.md) | sourceBaselineと訂正後currentInputを区別。採用入力はcurrentInput.cardsSha256と一致 |

元bytes取得は実装時の一度だけ行い、上記hash/bytesを照合して固定する。通常テストは保存済みfixtureとmanifestを使うため、Clone後に作業メモや過去Git履歴を取得する必要はない。現時点ではfixtureは未作成であり、既存Oracleを保全できる入力の来歴が確認済みという状態である。

**理由**: 1入力で014・015・訂正済みAPI fixtureを共有できる。APIの`sourceBaseline`と訂正後の`currentInput`を混同しない。約2.3MB追加で、shallow cloneでも通常テストを再現できる。

**検討した代替案**: テスト時の`git show`は履歴/Git依存になるため不採用。最新入力の保存や過去期待値の修正では対応が回復しない。

**完全性の設計**: 元bytesのhash/長さ、version/件数、入力ID順と014 classifications、ID集合とprojectedItems、015 bucketの対象、API currentInputを照合する。manifestは入力とOracleを識別するだけで期待値を生成しない。既存014/015全ファイル、API baseline、N₀ vectorを保全hashの対象にする。

## 3. 全テストの追加依存

**決定**: 現在のtracked 29ファイルすべてを調べ、17ファイルを変更候補とする。実装時に全ファイルを再列挙し、Assertion・パラメータ化条件を展開する。

**理由**: 既知13以外に、商品リンク3ファイル、二画面の集合包含1ファイル、検索フォームの先頭slot操作1ファイルで更新可能データへの依存が見つかった。barrel importでJSONを読み込むだけのテストまで一律変更する理由はない。

**検討した代替案**: 既報の失敗2ファイルだけの修正、13ファイルでの打切り、JSON import全件の一律Mockはいずれも不採用。

**根拠**: `buildProductSearchLocation → options/product.ts → productItems.json`、`mockData/indexPage.ts`、`mockData/restrictions.ts`、`app/pages/cards/search.test.ts`の最初のincrement button。

## 4. 固定語彙と更新可能データ

**決定**: QDS §4.1/§6.2/§7.2およびQuery SpecificationのMapping・演算子・枠/コストkeyは固定契約として保持する。UUIDレコード集合、label/color、表示順、数値UI選択肢の観測値と区別する。

**理由**: `multi`、`fire`等の意味は固定でも、`itemSlotItems.json`の先頭がmultiであることは仕様ではない。検索数値は現在のUI選択肢に閉じない。Short UUID Parserは有効形式の未知IDを保持する。

**検討した代替案**: 固定語彙まで毎回最新配列から期待値を生成する案、現行最大値や選択肢件数の固定、Short UUIDをmembershipだけで削除する案は不採用。

**追加・削除の扱い**: UUIDの7データ群と可変の数値選択肢・商品行は3操作を検証する。固定語彙の追加削除は通常更新ではなく仕様変更なので耐性要求の対象外。並び替え・label等の変更耐性は検証する。

## 5. 最新入力の契約と参照方向

**決定**: [契約](contracts/search-test-data.md)にfield別検査を定義する。Card root/必須公開情報、識別子、利用する配列・型、正規化catalog、既存search_costを全レコード検査する。参照は既存の意味が定義された方向に限定する。

**理由**: 独立した`masters.json`は現在なく、Cardには名称等が非正規化されている。QDSが定義するDB参照と、カード全件が選択肢JSONで網羅されるという新しい外部キー制約は同じではない。

- **確認済み事実**: [Feature008 data-model §2](../008-open-card-set-results/data-model.md#2-product-row)のvalid/invalidはsearchValueのmembershipによる**遷移可否**の区分であり、マスター整合性検査から除外できる「意図的無効」の識別基準ではない。008のFR-009とUI契約、`app/utils/search/productSearchLocation.ts`、`app/components/products/ProductTableRow.vue`に意図を表す独立した属性・規則はなかった。
- **承認済み判断**: [HD-C08 B](human-decisions.md#承認済み-hd-c08-商品行の参照検査対象)により`/`と`/restrictions`の公開全商品行を検査する。searchValueがproductItems.jsonに存在しなければ失敗とし、membershipでの事前除外は禁止。意図的無効行は現時点で存在せず、初回案の例外記録・除外リストは採用しない。将来の例外機構も先行追加しない。UI fail closedは固定異常入力で別に保証する。
- **商品名とIDの対応の追加確認**: 008のdata-modelは`label`を検索identityにせず、`id`をtable identity、`searchValue`を検索identityとして分離する。`app/utils/mockData/indexPage.ts`と`app/utils/mockData/restrictions.ts`では、searchValue=`ce193`のproductNameは「召喚士」だが`productItems.json`のlabelは「20th Anniversary スペシャルサプライセット 召喚士」。`9f77f`も同様に省略表示である。したがって名称の完全一致は既存の正常データを拒否する。部分一致やrow.idからの変換も契約にないため採用しない。
- **検証限界**: 現行入力は表示名・searchValueを行に直接持ち、008にはそれらの意味的対応を独立に照合する正本Mappingがない。両画面の共通行のlocation一致や固定同名別IDのUIテストは維持できるが、両方の行で同じ誤IDを指定するケースまで保証しない。C08は参照切れを検出する一方、存在する商品ID同士の取り違えを一般的に検出する設計ではない。新しい名称制約・正本Mappingは今回追加しない。必要になれば別途仕様と根拠をHuman Reviewする。
- 逆方向の「全選択肢に実カードが必要」は要求しない。008 US2/FR-007は収録カード0件のセットを許容する。
- home全行がrestrictionsにも存在する包含は008の要求ではない。固定二画面fixtureで共通行の陽性比較を保持し、最新側は各画面の入力を個別に検証する。共通部分0を不正にしない。
- `rule_restriction.json`はmodule importされるが、該当テストのAssertionは商品行だけを使う。名称/整理番号とCard間の新しい参照制約は導入しない。他のrule/about JSONへのAssertion依存は今回見つからなかった。

**検討した代替案**: 全UUID選択肢との双方向集合一致、reference_label一意、未使用選択肢禁止、全データ群に件数>0の追加は不採用。0件の検索・loader受理は既存コードで可能で、公開データが必ず非空という新Gateは作らない。

## 6. catalog・Effectの空値とコスト

**決定**: 最新catalogの規範は存在・string・N₀固定点とし、空値状態を報告する。既存の「482件・非空」は歴史入力で保持する。Effectの空type・activation・cost・targetを一律禁止しない。

**理由**: 014受入G1と`SearchSupport`の正常入力定義は正規化済みstring。既存テストの非空は受領した当時のデータの検査として残せる。初期調査では最新catalogの非空も要求する案があったが、正常更新を既存仕様で判断する[承認方針](human-decisions.md)とR24 US3-Cに従い、最新入力への追加制約にはしない。これは今回新たに非空要件の廃止を承認したという意味ではない。`effect_type_code === ''`でも正規の発動条件と構造化コストを持つ例があり、type空だけで本文のみの効果と分類できない。

search_costは012の型・契約を再利用する。非空コストの構造化値欠損は不適合。既知cost-freeの`null`と不明/欠損を区別する。`spell:any`は内部の許容値。数量/range、alternative、has_other_costを検査するが、本文の再解析で正解を再生成しない。

**検討した代替案**: catalog本文の再構築、Effect各fieldの一律非空、空値の0化、type空によるコスト検査免除は不採用。

**根拠**: [014 spec](../014-search-catalog-normalization/spec.md)、[012 data-model](../012-effect-cost-search/data-model.md)、[012契約](../012-effect-cost-search/contracts/effect-cost-search.md)、`types/cards/finderCards.ts`、`shared/cardSearch/search.ts`。

## 7. 入力注入・状態隔離と公開成果物

**決定**: Runner/matcher/sort/projectは既存引数、APIはdataSource spy、composable/UIは既存loader Mock、loaderはfetch Mockを使う。商品選択肢は対象option moduleのMockをimport前に設定する。

**理由**: Production DI追加は不要。`*_VALUES`のSet化とloaderのPromise cacheはmodule初期化に依存するため、必要なケースだけresetModulesと動的importを使う。APIの0/1件はローカルに保持したfresh sourceをsliceし、Mock後のgetSourceCardsで元入力を取り直さない。最新Dを別ファイルに分ける。

**検討した代替案**: 本番datasourceにテスト用分岐追加、test fixtureのapp/public配置、共有JSONを直接変更する方式は不採用。

fixture helperはcloneとsourceIndex付与に限定する。独立期待値をmatcher/sort/projectから作らない。generate後の配信JSONの元bytes一致と、fixture/Oracle原本・固有markerの非公開を確認する。

## 8. 未検証事項と完了判定

**設計Status**: Q1〜Q4の対応補完と[HD-C08 B](human-decisions.md#承認済み-hd-c08-商品行の参照検査対象)を反映済み。現在の設計範囲に未決Human Decisionはない。商品名と有効IDの取り違えの自動検出は前節の検証限界であり、根拠なく保証を追加しない。以下は実装後の実行検証事項で、承認済み設計と区別する。今回は設計Artifact更新のみでTasks生成・Implementationには進まない。

- 歴史入力接続後の全件期待値一致、各Assertionの移行結果。
- 各可変データ群の正常な追加・変更・削除、最後の陽性例削除、C/Dへの更新反映。
- 必須欠損・重複ID・参照切れの検出、本文欠落・同値順逆転の検出。
- 全体Vitest、lint、typecheck、generate、資産保全と非公開。

過去に報告されたNodeの`EPERM: lstat 'C:\\'`は今回再現していない。今回のPlan作成でテストを実行する必要はなく、成功・失敗いずれにも計上しない。実装時に環境失敗が起きたらコマンドと根拠を記録し、AGENTSに従い実行方法の変更前に確認する。

## 9. 今回の文書検査とフック

以下は初回Plan作成時の記録であり、Human Review指摘反映後の文書数・未決事項・変更ファイルの状態を示さない。現在の承認／未決判断は[human-decisions.md](human-decisions.md)、最新の文書修正結果は今回の完了報告を参照する。

- 生成6文書の相対リンク19件が既存の参照先へ解決し、未解決プレースホルダー・末尾空白は0件。
- 棚卸し29行と現在のtrackedテスト29ファイルを照合し、記載漏れ0件。
- `git diff --check`成功。Production、マスターデータ、AGENTS、014/015既存資産のtracked差分0件。既存のR24 spec/checklistは変更していない。
- `.specify/extensions.yml`を前後に確認。before_plan登録なし。after_planは有効・conditionなし・optionalのagent-contextだけで、案内して未実行。必須フックなし。
- 実装用fixture、tasks.md、テスト実装、実行結果のverification記録は今回作成していない。
