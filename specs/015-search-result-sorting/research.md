# 調査・設計判断: 検索結果の並び順

**日付**: 2026-10-29

**基準**: `39c8adee767c1a5bf15a6c7202ed6d08bb368087`、開始時working tree clean。現行コードをread-onlyで調査。`.ai/guide/`は不存在。実装・テスト実行なし。

## R1. 現行の共有処理を維持する

**Decision**: 共通sortとキー定義、既存UI選択肢を拡張する。

**根拠**:

- [sort.ts](../../shared/cardSearch/sort.ts):5〜14はidのlocaleCompare、固定rarity順位、unit.attackの欠損0比較、sourceIndex tie-breakを実装する。装備品を参照しない。
- [types.ts](../../shared/cardSearch/types.ts):4〜10はperPageとキー・方向の定数/派生型。[runner.ts](../../shared/cardSearch/runner.ts):20〜45は補正→filter→sort→paginate→DTO/集計。
- [ResultList.vue](../../app/components/cards/result/layout/ResultList.vue):43付近に3選択肢、watchでpage reset。[ResultDisplaySettings.vue](../../app/components/cards/result/controls/ResultDisplaySettings.vue)はPCとモバイルへ同じpropsを渡す。
- [useCardSearch.ts](../../app/composables/useCardSearch.ts):19〜64は内部表示state、CSR runner、ready・世代・破棄・retryを管理。[loader](../../app/utils/cardSearchDataset.ts):14〜30は/data/cards.jsonをdocument内共有し、失敗時に再取得可能にする。
- [nuxt.config.ts](../../nuxt.config.ts):8〜40はdev専用配信、静的コピーhook、static preset、8ページprerender、API除外。これらを変更する理由はない。
- [API](../../server/api/cards.get.ts)は共通runnerを利用。[server sort](../../server/utils/cardSearch/sort.ts)と[server types](../../server/types/cardSearch.ts)はre-export。

**代替案**: backend検索への復帰、別CSR comparator、表示ページのみのソートは不採用。共有責務・全件ソート・静的配信を壊すため。

## R2. 新キーと比較値

**Decision（D1 APPROVED）**: 新規キーを`level / defense / initiative`に確定し、既存`id / atk / rarity`を保持する。

**理由・履歴**: 既存キーは略記atkと語名rarityが混在しており、統一的な略記規則は存在しない。2026-10-29の旧提案`def`はHuman Decision D1で撤回し、[Card型](../../types/cards/finderCards.ts):165〜255の語彙に対応する`defense`へ変更した。検索条件のURL alias `df`とsort key `defense`は別概念であり、検索Aliasのlv/df/itや検索条件の仕様は変更しない。新規キー命名は承認済みである。

**Decision**: group→方向付き数値→sourceIndexの辞書順で比較。値の有無でgroupを選び、0は有値、NULL/親なしは値なし。levelはunitのみ。他3項目はunit/equipの対応フィールド。データ型にすでに必要な値が存在するためSchema変更不要。

**代替案**: 合算、全カテゴリの数値混在、配列reverse、欠損0補完はHuman Decisionに反する。文字列への変換比較、sort用のカード再正規化・保存も不要。

## R3. 過去仕様と現行実装の差

- [Feature 009](../009-backend-card-search/spec.md) FR-007/008の全件sort、pagination、source順、既定値は維持。Backend移行・ブラウザーへ全カードを取得しないという当時の方針は現行SSG＋CSRと異なり、015のArchitecture根拠にはしない。
- [Feature 010](../010-numeric-presence-search/spec.md) FR-004、[正式Query Data仕様](../../docs/architecture/query_data_specification.md) §5.1/5.2の「0は値、NULLはなし」と整合させる。検索Modifierや[Query仕様](../../docs/architecture/query_specification.md)は変えない。
- [旧009 OpenAPI](../009-backend-card-search/contracts/card-search-api.openapi.yaml)の3キーenumは旧契約。015の[差分契約](contracts/search-result-sorting.md)で6キーとatkの意図的変更を明示し、旧文書は改変しない。
- [sort.test.ts](../../server/utils/cardSearch/sort.test.ts)は現在主に決定性・件数・rarity tieを検証しており、6項目の具体的期待順序を網羅していない。
- [APIテスト](../../server/api/cards.get.test.ts):168〜177のatk期待値生成もunit.attack欠損0に依存する。単純なキー追加だけではテスト意味論が旧仕様のままになる。

## R4. 固定oracleを保全してテストを更新する

**確認事実**: [baseline.json](../014-search-catalog-normalization/verification/baseline.json)にatk-asc-20/50/100、atk-desc-20/50/100の6ケースがある。[runnerテスト](../../shared/cardSearch/runner.test.ts):13〜24と[APIテスト](../../server/api/cards.get.test.ts)が旧完全応答・hashを照合する。

**Decision（D2 APPROVED）**: 旧Feature 014のSpec・Plan・oracle・検証記録は変更しない。旧oracleは不変の履歴とし、id/rarityや検索集合・DTO・集計はそのまま回帰根拠にする。atkの意図的な順序変更は015用期待順序で検証する。旧atkケースをskipするだけの対応や旧oracleの上書きは禁止。新しいfixtureは実装時に015側へ作成し、期待値はsort実装の自己コピーではなく独立に定める。現在のテストコードは旧順序を要求する部分を新版期待値へ切り替え、検証範囲を維持する。

**旧Featureを変更しない理由**: Spec Kit公式の[Flow-Forward Spec](https://github.com/github/spec-kit/blob/main/docs/guides/evolving-specs.md#flow-forward-spec)は、完了済みFeatureを履歴として保全し、後続変更を別Featureで扱う方針を説明する。D2ではこれに沿い、014当時の仕様・実証を追跡可能なまま残し、変更の意図と期待順序を015へ記録する。旧Artifactの保全は、現在のアプリケーションテストに旧順序を要求し続けるという意味ではない。公式資料の確認日: 2026-10-29。

**リスク**: API/CSR parityだけでは共通comparatorの誤りを検出できない。合成fixtureの手書きID順、sourceIndexを保持した入力シャッフル、0/負数/NULL、group固定の独立ケースを併用する。

## R5. 初版が「タイトルのみ」とされた実行記録の調査

確認対象はRepository内の既存run `befa1dec`。ユーザーフォルダーや外部session履歴は読んでいない。

| 証拠 | 観測事項 |
|---|---|
| `.specify/workflows/runs/befa1dec/inputs.json` | inputs.specに詳細Feature Inputが保存されている。6項目、Human Decision、数値0/NULL、unit/equip優先、静的Architecture、検証条件、統合Reviewが含まれる |
| 同runの`state.json` | specifyとplanのinput.argsは各2,828文字で、Human Decisionを含む。両stepはcompleted、dispatched=true、exit_code=0。stdout/stderrは空文字 |
| 同runの`log.jsonl` | UTC 2026-10-28 15:56:58 specify開始、15:59:53完了→plan開始、16:02:39完了→review-plan開始。JSTでは2026-10-29 00:56〜01:02 |
| 同runの`workflow.yml` | specify/planはinputs.specをargsへ渡す定義。review-specが除かれ、review-planはSpec+Plan統合Gate。Tasks/Implementationはその後 |
| 初版commit `39c8ade`のspec/plan | specは入力をタイトルだけと記載し確定事項を未確認扱い、planもその未確認を継承して未完了 |

**確定できること**: Workflowの保存入力はタイトルだけではなく、詳細入力とArtifact内容が不整合である。specify/planの終了code0は内容の妥当性・承認を証明しない。stateはreview-plan待ちであり、Tasks着手記録はこのrunにない。

**確定できないこと**: 実際に子プロセスへ渡されたOS引数、展開されたプロンプト全文、モデルが受け取った入力本文、解釈過程はこの記録に残っていない。多行引数の伝達、integration展開、モデルの見落としのどこで不一致が発生したかは特定できない。入力の先頭行だけが切り出されたという原因を断定しない。

今回の対処は正式Human Decisionの直接反映と要件対応表である。Workflow修正や自動再実行は依頼範囲外とし、state/logを改変・Gate承認しない。

## R6. 設計成果物の必要性と実行境界

researchは根拠・履歴・旧仕様差分、data-modelは値参照とgroup、contractsはUI/共通runner/比較APIの差分、quickstartは承認後の検証手順として必要。Minimal Workflowでもこれらを簡潔に残す。

使用したspeckit-specify/planスキルの文書構造に従うが、今回は既存Artifact修正のため新Feature作成・テンプレート上書きスクリプトは実行しない。extensions.ymlのafter_specify/after_planにあるagent-context更新はoptionalであり、対象外ファイルを変更しないため実施しない。新規調査agent・テスト基盤も不要。
