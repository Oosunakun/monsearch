# データモデル: R24のテスト入力と証跡

これはテスト資産の設計であり、ProductionのCard/DTO Schemaや公開項目は変更しない。以下のファイルは実装時に作成する。

## 1. HistoricalDatasetとFixtureManifest

`tests/fixtures/cardSearch/historical/014-015/cards.json`は元Git blobのbytesを保存する。型は既存`FinderCards`、入力順序は原本のままとする。

| manifest field | 内容・検証 |
|---|---|
| `fixtureId` | `historical-014-015`。通常更新では変更しない版識別 |
| `sourceRevision` | `27209dfd0d5fb35cf0900aaa1d0cbcd8391e05e5` |
| `sourcePath` | `app/utils/mockData/items/cards.json` |
| `sourceBlob` | `8fc90b208e4a2fefe9577fb54d234e934cdd405d` |
| `sha256` | `a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca` |
| `byteLength` | 2,283,572。文字数ではなく元bytes |
| `version` / `cardCount` | `1.0.0` / 482。歴史入力だけの固定値 |
| `oracles` | Repository相対path、対応する入力metadata、比較対象、015旧atk補正の説明 |

対応Oracleは014 baseline/catalog Oracle、015 expected-sort-results/oracle-buckets/oracle-provenance、API cards-response-baselineの`currentInput`。原本bytesのhashに加え、014 classificationsの全ID順、projectedItemsのID集合、015の参照集合を検査する。期待値や新しいOracleはmanifestから生成しない。

## 2. SmallCardFixture / ExpectedProjection / DisplayFixture

| 資産 | 型・責務 |
|---|---|
| `cards.ts` | 必要属性を明記した`Card`と`Effect`、固定`FinderCards`。最新・歴史入力のfirst/findを素材にしない |
| `projection-expected.json` | 手書きの独立した完全`CardSearchResultItem`期待値。projectCardを呼ばず、入力を変換する同形helperも使わない |
| 表示用fixture | 完成済みの固定DTO。UI描画テストではProduction projectionを通さない |
| `sources.ts` | cloneと`{card, sourceIndex}`付与だけを行うテストhelper。matcher/sort/projectを使わない |

Card root、各カテゴリの詳細、ability/追加能力、Effectとcost、catalogを目的ごとに明示する。共通baseの暗黙値が別条件をヒットさせないよう、不要な属性・配列は型と既存契約に沿って空/nullへ設定する。

維持する境界は、数値0/正負/値なし/親なし、unit/equip、未知rarity、同値/同ID、通常/追加、同一Effect/別Effect、本文のみ・複数効果・改行、cost alternatives/any/none/unknown、0/1件とページ境界。正常入力と、欠測を意図して作る異常入力を識別する。

## 3. ProductOptionsFixture / ProductRowsFixture

`tests/fixtures/searchOptions/products.ts`に`SearchOption[]`と有効値Set、二画面の商品行を明示する。既存テストの`22d7e/ce193/9f77f`を固定のテスト値として保持し、最新productItemsにあることを要求しない。

共通セット、片方にだけあるセット、同名別ID、無効参照を区別する。固定二画面fixtureは共通セットの陽性比較を保証する。最新二画面の集合が同一であることや、すべてのセットにカードがあることは要求しない。

無効参照を持つ固定異常入力はUIのfail closedを検証するもので、最新商品行を整合性検査から除外する根拠ではない。[HD-C08 B](human-decisions.md#承認済み-hd-c08-商品行の参照検査対象)により最新の両画面の公開全商品行を検査する。意図的無効行は存在せず、例外設定・除外リスト・Production属性・将来用Schemaを追加しない。商品名とsearchValueの意味的対応を保証する独立したMappingは確認できておらず、名称一致を要求しない。

## 4. LatestMasterBundleとUpdateScenario

| field | 型・意味 |
|---|---|
| `cards` | `FinderCards`。最新公開データを読み込んだ入力 |
| `options` | 選択肢JSONをデータ群名で識別する集合。固定語彙と可変レコードを区別 |
| `productRows` | home/restrictionsの各配列。商品参照を持つ公開行を区別 |
| `scenarioId` | 一意なテスト用識別。データ群・操作・対象を追跡 |
| `operation` | `add/change/delete`、または不正入力・回帰の種別 |
| `targetDataset` | 対象pathまたはmodule/export名。複数群の連動更新も列挙 |
| `basis` | その更新が正常である既存仕様の節 |
| `invariants` | 固定A/Bの不変と、最新C/Dへ反映される変更 |

最新原本から各シナリオにfresh cloneを作り、最新原本・歴史入力・期待値を変更しない。1シナリオで複数の参照元を更新する場合は、連動更新前の中間状態を正常例として検査しない。

## 5. ValidationIssueとValidationReport

| field | 内容 |
|---|---|
| `dataset` | 対象データ群の相対pathまたはexport名 |
| `recordId` | card_id/row.id/option.value。欠損時は配列index |
| `fieldPath` | `cards[...].effects[...].search_cost...`等 |
| `ruleId` | 根拠付きの検査規則ID |
| `reason` | 必須欠損、重複、型不正、参照切れ、N₀不適合等 |
| `basis` | 既存仕様・型・入力契約への参照 |

検査は入力を補修せず、全レコードの診断を返す。検査結果はissues、検査対象件数、catalog空値等の観測統計を持つ。観測統計を過去の固定値と比較しない。異常例は`unknown`で入口へ渡し、`any`や型の無条件偽装で通常処理へ通さない。

## 6. AssertionMapping / PreservationEntry / VerificationRun

AssertionMappingの必須項目は[test-inventory.md](test-inventory.md)の対応表定義に従う。元Assertionから移行先への1対多を許容し、完全比較・異常系の行が消えていないことを検査する。

PreservationEntryは`path/sha256/byteLength`を保持する。014/015の全既存資産、API baseline、normalization vectorと、実装前後のマスターデータを対象にする。Git差分の有無だけでなく、未追跡資産も含むhashの集合で削除・改変を確認する。

VerificationRunはrevision、作業ツリー差分の識別、時刻、環境、コマンド、exit code、成功/Assertion失敗/環境失敗/未実行、log path、対象scenario/Assertion、未検証理由を保持する。未実行や起動失敗を成功へ変換しない。

## 関係とライフサイクル

```text
歴史入力 ── manifest ── 既存014/015/API Oracle
    └─ fresh clone/SourceCard ── A/B ── Assertion対応表
小規模Card/DTO/選択肢 ────────── A/B ───────┘
最新入力 ── fresh clone ── 更新scenario ── C/D ── 検証記録
保全対象 ── before/after hash ────────────────┘
```

状態は「原本読込 → ケース用clone → 注入/検索/検査 → Assertion → Mock解除・cache破棄」。失敗後も次ケースは原本から再開する。歴史入力は通常のマスター更新で版を進めず、将来のSchema変更も原本上書きの理由にしない。必要なadapterや新版は別途レビューする。
