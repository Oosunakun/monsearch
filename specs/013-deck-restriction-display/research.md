# Research: 検索結果のデック制限表示

**更新日**: 2026-10-16（Human Review反映）

## Repositoryで確認した事実

- `app/utils/mockData/items/cards.json` は482カードを含む。`modification.deck_restriction_count` は数値 `0` が6件、`1` が25件、`2` が1件、空文字が31件。`modification: null` は419件。値の `null` と `3` 以上は現データにはなく、追加fixtureで検証する必要がある。
- `modification` を持つ63件の `is_deck_restriction_lifted` はすべて `0`。`modification_text` も存在するが、本Featureでは使用しない。
- `modification` に改訂開始日・終了日のフィールドは存在しない。
- `types/cards/finderCards.ts` の既存 `Card` 型には `modification` がない。`server/utils/cardSearch/dataSource.ts` は同JSONをimportし、`FinderCards` 型へassertしている。今回利用する入力情報の型を補う必要がある。
- `server/api/cards.get.ts` は検索・sort・pagination後のカードに `projectCards` を適用する。`server/utils/cardSearch/project.ts` が明示的に表示フィールドを取り出し、`server/types/cardSearch.ts` の `CardSearchResultItem` を返す。現在のDTOには枚数制限値がない。
- `ResultItem.vue` は `ItemHeader.vue`・本文・効果・メタ情報を組み立てる。ヘッダーは `app/components/cards/result/list/ItemHeader.vue` にあり、既存の構成へChipを追加できる。
- `app/utils/mockData/restrictions.ts` は `rule_restriction.json` をimportし、既存の `/restrictions` 画面はそのデータを利用する。これらは本Featureの入力に含めない。
- 既存projection/API testsは `server/utils/cardSearch/project.test.ts` と `server/api/cards.get.test.ts`。Vitest・Vue Test Utilsは導入済み。
- `specs/009-backend-card-search/contracts/card-search-api.openapi.yaml` では `hero_point`・`initiative`・`charge`・`defender` は `type: number` だが、現行の `types/cards/finderCards.ts`・`server/types/cardSearch.ts` の対応項目はnullableであり、既に型の不整合がある。OpenAPIの `CardSearchResultItem` は `additionalProperties: false` で今回の追加項目も未定義。これらは既存の同期問題として記録する。

これらは現在のRepositoryの構造・値の観測結果であり、値の業務上の意味や改訂の適用方針をRepositoryだけから決めたものではない。

## 承認済みHuman Decision

1. 唯一の入力はカード自身の `modification.deck_restriction_count`。別JSONの参照・結合はしない。
2. `0` は禁止、`1` は1枚制限、`2` は2枚制限。`3` 以上はChipを表示せず元の数値を保持する。値の `null`・空文字、および `modification: null` はChipを表示しない。
3. 現時点の `modification` を対象とし、日付チェック・バイパス設定は実装しない。`errata` 等の別領域の日付を `modification` の改訂日として流用しない。
4. `modification_text` の解析・表示、解除フラグによる制御、カードプール・構築条件・改訂履歴の判定は対象外。
5. UIはPC・モバイルのヘッダー付近のChip。既存Component・スタイルへの変更を最小限にし、詳細デザインはImplementation後のHuman Verificationで調整する。
6. APIは必要最小限の枚数制限情報のみを提供し、検索条件・sort・pagination・URL Queryに影響させない。
7. HumanによるGitHub上の009のOpenAPIと実装の照合でもnullable型等の不整合が確認された。009のOpenAPI更新は本Featureで要求せず、同期問題はScope外の観測事項として扱う。今回の内部API Responseの契約はFeature 013内の `contracts/card-search-result.md` に維持する。
8. 実装済みのNuxt内部API `/api/cards` を利用する。外部サービスとのサーバー間API通信・外部向けREST APIの整備は対象外。

## 開発背景（機能要件ではない）

2026年12月5日のカード改訂に向けた準備が開発背景である。この日付はアプリケーションの判定基準や検証日として使用せず、日付変更テストも要求しない。

## 修正した設計判断

### 1. データソースの訂正と旧Decisionの撤回

旧Researchの「`modification` を不採用として別JSONを正本にし、`reference_label` でjoinする」Decisionは撤回する。型が未定義であることは入力を不採用にする根拠にならず、値の意味は今回Humanが明示した。

カード自身の改訂情報から値を直接取得する。制限一覧のlookup・名前照合・関連条件照合・重複行の状態解決は不要。

### 2. 既存projectionに単一のnullable数値を追加

既存の `CardSearchResultItem` に必須の `deck_restriction_count: number | null` を追加する設計とする。既存DTOは表示用フィールドを明示的に返すため、ネストした `modification` 全体を公開する必要はない。

Sourceでは `number | '' | null` を表し、空文字・値のnull・改訂情報のnullをAPIの `null` に統一する。数値 `0` および `3` 以上を含む数値は変更しない。`value || null` や `Number('')` は使用しない。このDTO形状は既存設計を確認した上での最小構成である。

### 3. 状態・日付・条件モデルの撤回

旧 `status: none/restricted/conditional/unknown`、`rules[]`、期間・基準日・適用条件のDTOは撤回する。日付や条件不足を理由とする確認不能表示も設けない。Chip非表示は制限解除・無制限・合法性の判定を表さない。

### 4. UIと既存検索の境界

値の追加は既存projection内で行い、検索・sort・paginationの判定に渡さない。UIは受け取った `0`・`1`・`2` に対応するChipのみをヘッダー付近に表示する。必要なら小さなComponentへ分離するが、大きな変換基盤や専用のデータ読込処理は追加しない。

## Scope外の観測事項

- 009のOpenAPIと実装の同期問題は既存の不整合であり、本Featureでは修正しない。以前記載した「009のOpenAPI更新が必要」という要求は撤回する。同期は本Featureの承認・実装・検証の前提条件にしない。今回の内部API Responseは本Featureの[契約](contracts/card-search-result.md)で定義する。
- 正式URL Query・検索意味論の仕様には新しい検索語彙や規則を追加しない。本修正に伴う変更は不要。

追加の重要なHuman Decisionは現在なし。2026-10-16のSpec / Plan統合Human Reviewで仕様・設計は承認済み。
