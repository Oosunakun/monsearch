# 実装計画: 検索結果の並び順の拡張・整理

**Branch**: `feature/search-result-sorting` | **日付**: 2026-10-29 | **仕様**: [spec.md](spec.md)

**調査基準HEAD**: `39c8adee767c1a5bf15a6c7202ed6d08bb368087`

**状態**: D1・D2承認反映済み／Minimal WorkflowのSpec + Plan統合Human Reviewの完了確認待ち。Tasks・Implementation・テストは未実施。

## Summary

Human Decisionの6項目とグループ別比較を、既存の共有ソートへ最小限追加する。既存キー`id / rarity / atk`を保持し、新規キーはD1承認済みの`level / defense / initiative`とする。UI表示順は`id, level, atk, defense, initiative, rarity`。現在のSSG＋CSR＋静的JSON構成を維持し、APIは比較用の共通ロジック利用者としてのみ保持する。

FR-001の回答待ち・初版のERROR Gateは解消した。欠損=0の旧案は撤回。新しいキー名はHuman承認済みであり、新たな検索条件のAliasではない。検索条件のURL alias `df`とsort key `defense`は別概念で、検索条件の仕様は変更しない。

## Technical Context

- TypeScript strict、Nuxt（package指定`^4.4.2`、installed 4.5.0）、Vue 3.5.40、Vuetify、Vitest 4.1.10、既存Nuxt/Vue Test Utils。
- Webアプリ。`ssr:true`、Nitro `static`、全8ページのprerender、`npm run generate`を維持。
- データ正本は`app/utils/mockData/items/cards.json`。調査時482件。コピーhookで独立した`/data/cards.json`を生成し、document内で共有するloaderから取得する。
- 全カードJSONのJS/HTML/Nuxt payload埋め込み、動的API/Worker検索への復帰、Schema・検索条件・インフラ変更、依存追加をしない。
- 性能: 数値SLAは追加しない。既存の全件sort→paginateを維持し、比較ごとに他カード探索・JSON取得・新規キャッシュを追加しない。
- 比較値は`Card`の既存プロパティ、安定順序は`SourceCard.sourceIndex`を使用。データやDTOへソート補助値を保存しない。

## Constitution Check

以下は設計の評価であり、コード品質・実行結果のPASSではない。

| 原則 | 調査開始時 → 設計後の確認 |
|---|---|
| I. Type Safety | PASS → PASS: 既存のliteral unionを拡張し、数値参照は既存Card型で扱う。anyやSchema変更不要 |
| II. Testability | PASS → PASS: 手書き期待順序、API/CSR parity、UI両レイアウトを独立した振る舞いとして検証可能 |
| III. Incremental Change | PASS → PASS: 本体変更は型・共通sort・選択肢を基本とし、loader/parser/lifecycleを変更しない |
| IV. Existing Architecture | PASS → PASS: static preset、共有runner、既存re-export、PC/モバイルへの共通propsを維持 |
| V. Human Review | PASS → PASS: 確定Human Decisionを反映し、統合Reviewで停止。Gate承認を代行しない |
| Additional Constraints | PASS → PASS: 既存Spec Kit Core Artifactを改訂、現行コードを根拠にする。新Workflow・管理機構なし |

## 設計と責務

### 共通比較

1. `shared/cardSearch/types.ts`の許可キーを上記6キーへ拡張する。`runner.ts`の既存membership補正はこの定数を参照しているため、新しいvalidation機構を追加しない。
2. `shared/cardSearch/sort.ts`内で数値項目の参照先を明示する。詳細は[data-model.md](data-model.md)。値が存在するユニット、値が存在する装備品、値なしの順にgroupを決定する。レベルはユニットのみ。
3. group差は常に固定順で比較。同一groupの数値差にだけasc/descを適用。差が0、または両方値なしならsourceIndex昇順。完成配列のreverseは禁止（group・同値順が壊れるため）。入力配列は現行同様コピーしてsortし、カードを変更しない。
4. idは現行`card_id.localeCompare`、rarityは現行順位1〜9・未知0、同値sourceIndexをそのまま保持する。reference_labelへの変更や自然順序化をしない。
5. `ResultList.vue`の既存sortOptionsを6表示名・順序へ更新。既存ResultDisplaySettingsからPC/モバイルへ同じ配列を渡す。新設定ストアやURL同期は不要。

### 呼出経路と保持範囲

`/cards` → `useCardSearch`（ready・世代管理・破棄・retryを維持）→ `loadCardSearchDataset` → `prepareCardSearch` → filter → 共通sort → paginate → project / categoryBreakdown。

比較用`server/api/cards.get.ts`も同じprepare/runを呼ぶ。server側sort/typesはre-exportであり二重実装しない。`/api/**`のprerender:false、公開成果物にAPI/Workerを含めない構成は変えない。

`useCardSearch.makeRequest`はroute queryより内部のpage/perPage/sort/orderを優先する。URLのsort復元を新規追加しない。ソート変更時のpage reset、20/50/100、補正値の画面反映は既存挙動をテストで保護する。

## Project Structure・変更影響

| ファイル | 実装時の扱い |
|---|---|
| `shared/cardSearch/types.ts` | 必須: sort定数/unionを拡張。DTOフィールド構成は不変 |
| `shared/cardSearch/sort.ts` | 必須: 4数値項目の値取得とgroup比較。id/rarityは保持 |
| `app/components/cards/result/layout/ResultList.vue` | 必須: 6項目の表示名と順序 |
| `server/utils/cardSearch/sort.test.ts` | 既存re-export越しに固定順序・入力非破壊・境界テストを拡充 |
| `shared/cardSearch/runner.test.ts`、`server/api/cards.get.test.ts` | 新旧契約の区別、全ページ・DTO・集計・parityを検証。旧atk期待値の適用箇所を改訂 |
| `app/composables/useCardSearch.test.ts` | 6キー、方向、ページ復帰、無効値補正、取得共有の回帰 |
| `app/components/cards/result/layout/ResultList.test.ts` | 実際のPC/モバイルcontrolsを通じた選択肢・選択状態・page reset検証を追加 |
| Feature 015用の期待値fixture（実装時に必要な場合） | 旧oracleとは別管理。手書きgroup/順序の合成例と実データの期待ID順 |

`runner.ts`、composable本体、ResultDisplaySettings/Desktop/Mobile、server re-exportは現時点で変更不要の見込み。既存テストのstubだけでは両UIの動作を検証できないため、テスト内のmount構成を調整する。予期しない本体変更が必要なら理由と最小範囲をHumanへ提示する。

変更対象外: `nuxt.config.ts`、`public/_headers`、dev handler、cards.json、`types/cards/finderCards.ts`、検索matcher/parser/loader、旧Featureの仕様・oracle、インフラ。古いOpenAPIのsort enumはFeature 009時点の履歴として保存し、今回の差分契約は[contracts/search-result-sorting.md](contracts/search-result-sorting.md)に記載する。

設計資料はspec / plan / research / data-model / contracts / quickstart / requirements checklist。Tasksは承認後の別工程で、今回は作成しない。

## 回帰と固定oracleの扱い

D2承認済み。Flow-Forward Specに沿って、完了済みFeature 014のSpec・Plan・oracle・検証記録を当時の仕様と実証の履歴として保全し、変更後の並び順はFeature 015で定義・検証する。旧記録を新仕様に合わせて書き換えると当時の判断・検証を追跡できなくなるためである。公式資料と今回の適用範囲は[research.md](research.md) R4に記載する。

Feature 014の`verification/baseline.json`には旧atk順の6ケース（asc/desc×20/50/100）が存在する。新仕様でも旧順序へ完全一致させる要求は矛盾するため、次のように区別する。

- baseline.json、expected-catalog-results.json、既存fixturesは書換え・再生成しない。id/rarity等の不変ケースは既存完全応答・hash照合を維持する。
- atk6ケースの旧配列順・ページ別response hashは旧仕様の履歴として保持し、新版の合否基準として流用しない。新仕様の固定ID順とページ期待値をFeature 015側に用意し、現行sortの出力をそのまま期待値にしない。
- 旧oracleのカード集合・IDごとの完全DTO・分類集計は引き続き独立期待値として活用する。新順序でページを構成し、同じcoverageを検証する。skipだけで済ませない。
- APIテストの旧`unit.attack ?? 0`による期待順序生成も改訂対象。APIとCSRが同じ誤りを共有してもparityは通るため、手書き合成期待順序を必ず併用する。
- 009のBackend方針は現行構成と異なる歴史的前提。010・正式Query Data Specificationの0/NULL意味論は保持し、015のsortキーを検索Aliasへ追加しない。

## 検証Gateと進め方

1. 今回: 文書整合・リンク・要件対応を確認し、Spec + Plan統合Human Reviewへ提出。未承認のTasks/Implementationは開始しない。
2. 承認後の実装: 最小3本体ファイルと関連テストを変更。group/数値/同値の独立期待値→runner/API→composable/UIの順で確認する。
3. 品質: Focused、全体Test、Lint、Typecheck。詳細コマンドは[quickstart.md](quickstart.md)。失敗を期待値変更だけで隠さず原因を分類する。
4. 静的構成: 旧成果物を上書きしない検証場所でgenerate。8ページ/404、JSON bytes/SHA、no-cache、公開Worker/API不在、JSON非埋め込みを確認。
5. Human: PC/モバイルで6項目・方向・ページングとCSR通信を確認。自動テストと画面実証を分けて報告する。

今回の調査ではテスト・generate・HTTP・ブラウザー確認を実行していない。現行const/旧テストが新仕様を満たさないことは読み取り上の事実であり、テスト失敗を実測したものではない。

## Human Review事項・未解決事項

- 新規業務判断を要する不確実性は見つかっていない。確定Human Decisionを再質問しない。
- **D1 APPROVED**: 新規キーは`level / defense / initiative`。既存`id / atk / rarity`を維持し、旧提案`def`は撤回する。検索条件のURL alias `df`は変更しない。
- **D2 APPROVED**: 旧Feature 014のSpec・Plan・oracle・検証記録は変更しない。旧atk期待順序は履歴として保持し、新仕様の独立期待値を015側に作成する。現在のテストコードで旧順序を要求する部分は新版期待値へ切り替え、検証範囲を維持する方針を正式承認済み。今回はテストコード・fixtureを変更しない。
- D1・D2は再判断待ちではない。残るのはSpec + Plan統合Human Reviewの完了確認であり、Tasks生成・Implementationには進まない。
- 初版の入力反映漏れの発生箇所は未特定（[調査](research.md)）。これは仕様決定待ちではなくWorkflow診断の限界で、修正版Reviewを妨げない。
- 実装時にSchema変更、静的配信の変更、原データ補正が必要と判明したら停止。独断で範囲を拡張しない。

## Complexity Tracking・履歴

Constitutionの例外・新依存・新管理機構なし。

2026-10-29初版はFR-001待ちとして計画未完了・Phase 1未着手と記録されていた。今回、正式Human Decisionを反映してその状態を解消した。setup-planによるテンプレート再コピーや任意agent-context更新は実施せず、既存Feature内の文書だけを改訂した。Workflowのreview-plan状態や過去実行ログは変更していない。
