# 実装計画: monsearch R24 — 検索テストと更新可能なマスターデータの依存関係解消

**ブランチ**: `refactor/decouple-search-test-data` | **作成日**: 2026-10-31 | **仕様**: [spec.md](spec.md)

**入力**: [承認済みHuman Decision](human-decisions.md)を継承。状態はHuman Review承認事項反映済み（Q1〜Q4・HD-C08 B確定）。今回は設計更新のみ。Tasks生成・Implementation未着手、実行検証は未実施。

## 概要

テストをA「固定入力の振る舞い」、B「固定入力と独立期待値の完全DTO」、C「最新入力の整合性」、D「最新入力の統合」に分ける。014・015・既存API期待値に対応する歴史的全件入力、小規模Card・DTO・選択肢fixtureを使い分ける。最新マスターからの素材選択、固定件数、特定IDの永久存在、選択肢の現在順序への不要な依存を解消する。

全29テストを静的調査し、既知13中12ファイルと追加5ファイル、計17ファイルを変更候補とした。[棚卸しと移行方針](test-inventory.md)を参照し、実装開始時には未追跡ファイルも含め再列挙する。29や17をScopeの上限にしない。現時点でProduction変更は不要。

## 技術コンテキスト

| 項目 | 設計 |
|---|---|
| 言語・型 | 既存TypeScript strict、Vue SFC。`Card`、`FinderCards`、`SourceCard`、`CardSearchResultItem/Page`を再利用。検査入口は`unknown`から絞り込む |
| 主要依存 | package.jsonのNuxt `^4.4.2`、Vue `^3.5.40`、Vue Router `^5.2.0`を継続。追加・upgradeなし |
| テスト | Vitest `^4.1.10`、Nuxt Test Utils `^4.0.3`、Vue Test Utils `^2.4.11`、既存h3 handler test。include/excludeを維持 |
| 保存 | Repository内の固定JSON・型付きfixture。歴史入力2,283,572 bytes。通常テストのGit履歴・ネットワーク取得不要 |
| platform | Nuxt Web application。現設定はNitro `static` preset、`/data/cards.json`公開コピーとdev handler。比較APIは既存テストで検証 |
| 性能 | 新SLOなし。走査前各1回のquery正規化、document内JSON共有、再検索の再取得0回、通常検索API通信0回を維持 |
| 制約 | Oracle保全、独立期待値、完全比較、clone/Mock/cache隔離、テスト資産非公開、本番データを書き換えない更新試験 |
| 規模 | 調査29テスト・変更候補17。歴史入力482カード、014 baseline 38ケース、API fixture 16ケース、015の6項目×2方向×20/50/100件・全ページと境界 |

002計画のplatform説明より、現在の`nuxt.config.ts`と実コードを優先する。既存構成を継続し、新しい外部サービスは導入しない。

## Constitution Check

Phase 0前とPhase 1設計後の確認。設計の適合性を示し、実装テストのPASSではない。

| 原則 | Phase 0前 | Phase 1後 |
|---|---|---|
| I. Type Safety | PASS: 既存strict型 | PASS: fixture/検査結果の明示型、異常入力はunknownの検査境界 |
| II. Testability | PASS: 既存引数・Mock | PASS: clone隔離、検査の正負例、独立完全DTO、回帰検出 |
| III. Incremental Change | PASS: データ依存と証跡に限定 | PASS: 問題を確認した17ファイルのみ候補化、検索/UIの意味は維持 |
| IV. Existing Architecture | PASS: 既存責務・配置 | PASS: colocatedテストを維持、共有fixtureとC/Dをtestsへ追加 |
| V. Human Review | PASS: human-decisions.mdの承認済み方針 | PASS: Q1〜Q4・HD-C08 B承認を反映。今回の工程制限を守り実装しない。Production変更が必要なら根拠・最小案・影響を提示 |
| Additional Constraints | PASS: Spec Kit Core | PASS: 新しい拡張Workflowなし、brownfieldの実コード・既存契約に基づく |

違反・例外なし。環境で不能な検証は未検証とし、権限・Sandboxを独断で変更しない。

## プロジェクト構成

### 今回の設計資料

```text
specs/016-decouple-search-test-data/
├── spec.md
├── human-decisions.md              # 承認履歴・Scope・検証限界の正式記録
├── plan.md
├── research.md
├── data-model.md
├── test-inventory.md
├── quickstart.md
└── contracts/search-test-data.md
```

`tasks.md`はHuman Review後の後続工程で生成する。今回はTasks生成・Implementationへ進まない。以下は実装時の配置案であり今回作成しない。

```text
tests/
├── fixtures/
│   ├── cardSearch/
│   │   ├── historical/014-015/{cards,manifest}.json
│   │   ├── cards.ts
│   │   ├── sources.ts
│   │   ├── projection-expected.json
│   │   └── fixtureIntegrity.test.ts
│   └── searchOptions/products.ts    # 固定選択肢・二画面の商品行
├── helpers/
│   ├── masterDataValidation.ts      # 検査・診断、検索期待値は作らない
│   └── masterDataScenarios.ts       # clone上の正常更新と不正入力
└── integration/
    ├── cardSearchMaster.test.ts     # C: 最新入力・検査器の異常系
    ├── cardSearchRealData.test.ts   # D: 最新loader/runner/API統合
    ├── searchOptionsMaster.test.ts  # C/D: 選択肢・商品行
    └── masterDataUpdates.test.ts    # 更新耐性・回帰検出・隔離

app/**, server/**, shared/**, dev/**
└── 既存 *.test.ts                   # 棚卸しの候補のみ変更

specs/016-decouple-search-test-data/verification/
├── assertion-map.md
├── protected-files-before.json
├── protected-files-after.json
└── results.md                      # 実行結果・未検証・log参照
```

**配置判断**: testsを本番自動取込の外に置き、既存`~~` aliasまたは相対importで参照する。Production moduleからfixtureを参照せず、公開成果物の検査を完了条件にする。

## Phase 0: 調査と決定

[research.md](research.md)に決定・根拠・代替案を記録する。全テスト依存とデータ契約をresearch agentに分担し、歴史入力の元bytes/hashは親agentが読み取りのみで照合した。

- 歴史入力はrevision `27209dfd0d5fb35cf0900aaa1d0cbcd8391e05e5`、blob `8fc90b208e4a2fefe9577fb54d234e934cdd405d`、SHA-256 `a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca`。
- 商品リンク3ファイル、二画面の行比較、検索フォームの先頭slot操作を追加対象とする。最新Short UUID形式検査とbytes配信比較は継続する。
- 検索語彙・Mappingは固定契約。Short UUIDの集合・label/color・表示順は更新可能とする。
- 最新catalogは存在・string・N₀固定点と空値状態を確認し、歴史入力に対する既存非空Assertionも残す。
- 全選択肢にカードが必要という逆参照、二画面の集合包含、最新全文・件数の固定を導入しない。

**確定判断**: [HD-C08 B](human-decisions.md#承認済み-hd-c08-商品行の参照検査対象)により、両画面の公開全商品行をC08対象とする。searchValueのproductItems.jsonへの存在を検査し、membershipでの事前除外・例外設定・除外リストは実装しない。[research.md §5](research.md#5-最新入力の契約と参照方向)に商品名とIDの対応検証の限界を記録する。設計上の未決判断はなく、実行適合と公開成果物の確認は未検証項目として区別する。

## Phase 1: 設計

来歴・fixture・検査結果を[data-model.md](data-model.md)、入力境界と既存公開契約の保持を[contracts/search-test-data.md](contracts/search-test-data.md)、検証手順を[quickstart.md](quickstart.md)に定義する。公開API・URL・UI契約の追加変更は行わない。

| 段階 | 作業 | 次段階へのGate |
|---|---|---|
| 0 | 承認済み仕様・Plan・HD-C08 Bを確認、全テスト再列挙、Assertion単位対応表、保全hashと変更前実行結果 | 公開全商品行を対象化し例外機構を追加しない。確認済み/未確認を区別。未確認を残して完了扱いしない |
| 1 | 元bytesの歴史入力・manifest、clone/sourceIndex helper、目的別Card/DTO/選択肢 | hash/bytes/入力順とOracle対応一致、ケース隔離、保全差分0 |
| 2 | Runner/APIの歴史的完全比較・合成例・errorを接続、最新Dを分離 | 全ページ・DTO・status・適用hash・集計・015補正を保持 |
| 3 | search/sort/project/normalizeを分離、最新catalog検査をCへ移設 | C追加と元検査の入力変更を同じ変更単位で実施。異常境界も保持 |
| 4 | composable/loader/UI、商品リンクと二画面fixture、slot選択 | 画面操作・URL・SSR・retry・世代・cache・通信回数を保持。最新商品C/Dを同時に維持 |
| 5 | 各群の追加/変更/削除、不正入力3種、回帰2種、全体品質・公開成果物・保全 | SC-001〜006を対応表と同一状態の実行logで立証 |

新しい依存が見つかれば対応する段階へ加える。未移行suiteが残る途中段階をR24完了としない。

US1〜US4はすべてP1であり、段階的な差分の分割は部分完了を許可するものではない。全Story・SC-001〜006を完了判定に含める。正式な判断は[human-decisions.md](human-decisions.md)、入力来歴は[research.md](research.md)と[data-model.md](data-model.md)に集約し、Git管理外の作業メモを必須入力にしない。

| 要件 | 主な設計・検証 |
|---|---|
| FR-001/002/011 | test-inventory.md、開始時再列挙、Assertion対応表 |
| FR-003/006/007 | 元bytes・manifest・独立Oracle・手書きDTO・保全hash |
| FR-004/012 | 各群の3更新、最後の一致例削除、異常/回帰検出、results.md |
| FR-005 | 014/015/API完全比較、数値/Effect/コスト/表示/loader境界 |
| FR-008/009 | Cの入力契約と診断、Dの最新読込/検索/DTO/配信とerror |
| FR-010 | fresh clone、Mock解除、module/cache隔離、非破壊、成果物検査 |

## 複雑性の記録

Constitution違反なし。約2.3MBの固定入力追加は全件Oracle保全のためのコスト。Git履歴の実行時参照やOracle再生成より通常テストの再現性を優先する。
