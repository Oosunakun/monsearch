# 実装計画: 検索結果のデック制限表示

**Branch**: `feature/show-deck-restriction-count`（Feature: `013-deck-restriction-display`）
**更新日**: 2026-10-16 | **Spec**: [spec.md](spec.md)
**状態**: 承認済み（2026-10-16 Spec / Plan統合Human Review完了）。

## 概要

既存のカード読込・検索・sort・paginationを利用し、検索結果projectionで各カード自身の `modification.deck_restriction_count` を取り出す。`CardSearchResultItem` に必須の `deck_restriction_count: number | null` を追加し、ヘッダー付近に `0`・`1`・`2` のChipだけを表示する。

以下のコード変更とテストは、承認済みのImplementation・Verification向け計画である。

## Technical Context

- **言語・依存関係**: 既存のTypeScript strict mode、Nuxt 4、Vue 3、Vuetify、Vitest、Vue Test Utils。
- **データソース**: `app/utils/mockData/items/cards.json` のカード自身の `modification.deck_restriction_count` のみ。JSONの編集や別データ読込を追加しない。
- **API境界**: 実装済みのNuxt内部API `/api/cards` を利用する。`server/types/cardSearch.ts` と `server/utils/cardSearch/project.ts` で、検索・sort・pagination後のprojectionに値を追加する。外部サービスとのサーバー間API通信・外部向けREST APIの整備は対象外。
- **UI境界**: `app/components/cards/result/list/ItemHeader.vue` 付近。PC・モバイルで既存構成・スタイルをなるべく維持し、必要なら小さな専用Componentを追加する。
- **対象環境**: 既存のSSR対応Nuxt Webアプリ、Cloudflare Pages向け構成。
- **性能方針**: ページ内の各カードから値を取得する小さな処理とする。追加のデータ読込・joinは不要。根拠のない応答時間・UX数値目標は設定しない。

## 設計

1. `types/cards/finderCards.ts` の `Card` に `modification: CardModification | null` を追加し、利用する `deck_restriction_count: number | '' | null` を型定義する。既存JSONは変更しない。
2. `projectCard` で数値をそのまま保持し、空文字・値のnull・改訂情報のnullをAPIのnullへ正規化する。数値0をtruthinessで欠落させず、空文字を0へ変換しない。新しい制限値を理由にカードを除外しない。
3. DTOにはトップレベルの単一項目だけを追加する。`3` 以上もAPIで元の数値を保持する。状態enum・ルール配列・適用期間・基準日・適用条件は設けない。
4. UIは値の `0`・`1`・`2` との明示的な一致により「禁止」「1枚制限」「2枚制限」を表示する。他の場合はChipを表示しない。詳細な配置・配色等はImplementation後のHuman Verificationで調整する。
5. 日付チェック・バイパス設定は実装しない。`modification` に開始日・終了日はなく、`errata` 等の別領域の日付を流用しない。`modification_text` の解析・表示、解除フラグによる制御、カードプール・デック構築条件・改訂履歴の判定は行わない。
6. 検索条件・sort・pagination・URL Queryに手を加えない。`rule_restriction.json`・`restrictions.ts` の参照・結合や `reference_label` による別JSONとのjoinを追加しない。

## 変更候補ファイル

| ファイル | 将来の変更内容 |
|---|---|
| `types/cards/finderCards.ts` | 利用するSource型と `Card.modification` を追加 |
| `server/types/cardSearch.ts` | 必須の `deck_restriction_count: number \| null` を追加 |
| `server/utils/cardSearch/project.ts` | カード自身の値を取得・正規化してprojectionへ追加 |
| `app/components/cards/result/list/ItemHeader.vue` | ヘッダー付近のChip表示を追加 |
| `app/components/cards/result/list/ItemDeckRestriction.vue` | 必要な場合のみ小さな専用Componentを追加 |
| `server/utils/cardSearch/project.test.ts` | 正規化・数値保持の検証を追加 |
| `server/api/cards.get.test.ts` | レスポンス項目・既存検索結果の維持を検証 |
| ヘッダーまたは専用Componentに対応するテスト | Chip文言と非表示ケースを検証 |

`dataSource.ts` と `cards.get.ts` の既存処理を利用するため、新しいデータ読込やAPI処理順の変更は不要。独立した制限一覧reader・lookup・条件照合・複雑なprojectorは追加しない。

## 将来のテスト方針

- projection unit test: `0`・`1`・`2`・`3`・`4`、値のnull・空文字、`modification: null`。数値0と3以上の保持、欠損のnull正規化、Sourceを変更しないことを確認する。
- API test: 実データの代表カードと、必要に応じたメモリ上の追加fixtureを用いて必須項目を確認する。同じqueryについて新フィールドを除いたレスポンスを追加前と比較する。
- component test: 全入力ケースのChip文言・非表示、同名カードでも各カード自身の値を使うことを確認する。
- 既存の検索・sort・pagination testsとAPIの結果比較で、カードID・件数・カテゴリ別件数・順序・ページ情報を維持することを確認する。
- PC・モバイルの両方でヘッダー付近のChipと既存情報を確認する。
- 実データと追加fixture、操作手順は [quickstart.md](quickstart.md) に記載する。

## Constitution Check（修正設計の再評価）

| 原則 | 評価 | 根拠 |
|---|---|---|
| I. Type Safety | 設計適合 | Sourceの `number \| '' \| null` とDTOの `number \| null` を明示。strict modeを維持し、`any` は不要 |
| II. Testability | 設計適合 | 正規化とChipの振る舞いをunit testでき、APIで既存検索への影響を検証できる。実施は後続工程 |
| III. Incremental Change | 設計適合 | Source型・既存projection・単一DTO項目・ヘッダー表示を中心とした変更。データ・検索エンジン・DBの変更は不要 |
| IV. Existing Architecture | 設計適合 | 既存の型・server projection・結果Componentの責務を維持 |
| V. Human Review | 承認済み | 2026-10-16にSpec / Plan統合Human Reviewを完了し、仕様・設計を承認 |
| Additional Constraints | 適合 | Brownfield調査を実施。Spec Kitテンプレート・Workflow定義・設定は変更なし |

修正設計にConstitutionの例外は不要。これは設計評価であり、実装・テスト完了を示すものではない。

## Artifactと既存契約

本Feature内の `spec.md`・`research.md`・`data-model.md`・本計画・`contracts/card-search-result.md`・`quickstart.md` を同じ入力・正規化・表示規則に統一する。品質チェックリストも旧設計の記述を更新する。

今回の内部API Responseの契約は [contracts/card-search-result.md](contracts/card-search-result.md) に維持する。009のOpenAPIと現行実装には既に `hero_point`・`initiative`・`charge`・`defender` のnullable型等の不整合がある。同期問題は [research.md](research.md) に観測事項として記録し、本Featureでは009のOpenAPI更新を要求しない。同期作業は今回のScope外とし、後続工程の前提条件にもしない。Feature外の文書は変更しない。検索・URL Queryの正式仕様への変更は不要。

## Complexity Tracking

追加のデータソース・条件モデル・日付設定・DBは不要。新たにHuman判断を必要とする重要事項は現在なし。詳細デザインは予定どおりImplementation後のHuman Verificationで確認する。
