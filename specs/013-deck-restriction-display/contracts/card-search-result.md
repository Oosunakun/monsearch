# Contract: `/api/cards` の枚数制限表示

## 既存APIへの追加

本書は、実装済みのNuxt内部API `/api/cards` を利用するFeature 013の内部API Response契約である。既存の `CardSearchResultItem` のトップレベルに次の必須項目を追加する。外部サービスとのサーバー間API通信・外部向けREST APIの整備は対象外とする。

```ts
// 既存CardSearchResultItemへの追加部分
interface CardSearchResultItem {
  deck_restriction_count: number | null
}
```

唯一の入力は返却対象カード自身の `cards.json` の `modification.deck_restriction_count`。`rule_restriction.json`・`restrictions.ts` は参照・結合しない。別JSONとの `reference_label` joinも行わない。

## 正規化とUIの対応

| Sourceの値 | API値 | UI |
|---|---|---|
| `0` | `0` | 「禁止」のChip |
| `1` | `1` | 「1枚制限」のChip |
| `2` | `2` | 「2枚制限」のChip |
| `3` 以上 | 元の数値 | Chip非表示 |
| `null` | `null` | Chip非表示 |
| 空文字 `""` | `null` | Chip非表示 |
| `modification: null` | `null` | Chip非表示 |

- 全itemに項目を含める。`undefined` にして省略したり、空文字を返したりしない。
- `0` は実数値であり、null扱いしない。`value || null` のようなtruthiness判定を使用しない。空文字の数値変換によって禁止を作らない。
- 数値は元のまま保持する。`3` 以上を切り詰めたり `null`・「無制限」に変換したりしない。
- `null` は表示対象の数値を持たないことを示す。制限解除・合法性・無制限の判定には使わない。
- `status`・`rules[]`・期間・基準日・適用条件やネストした `deck_restriction` オブジェクトは追加しない。`modification` 全体も公開しない。
- 現在日時との比較、解除フラグによる制御、`modification_text` の解析・表示はしない。

## レスポンス例

以下は既存レスポンスの各itemから関連部分のみを抜粋した例。実際には既存の全必須フィールドも返す。

```json
[
  { "reference_label": "M20E-002", "name": "ラプラース", "deck_restriction_count": 0 },
  { "reference_label": "M20E-041", "name": "ホーリー・フェニックス", "deck_restriction_count": 1 },
  { "reference_label": "M20E-073", "name": "スペクター", "deck_restriction_count": 2 },
  { "reference_label": "M20A-001", "name": "アーニャ", "deck_restriction_count": null }
]
```

追加fixtureの数値 `3`・`4` はそれぞれAPIでも `3`・`4` とする。値のnull・空文字・改訂情報のnullはすべてAPIで `null` とする。

## 検索とエラーへの影響

`projectCard` / `projectCards` で表示用の値を追加する。検索条件・sort・pagination・URL Queryと、`items` のカードID・順序、`totalCount`・`categoryBreakdown`・`page`・`perPage`・`totalPages`・`sort` は既存動作を維持する。制限値がnullでもカードを除外しない。0件検索は既存の空配列を返す。

既存のデータソース障害に対する `CARD_SEARCH_FAILED` 500契約を維持する。新しい制限状態エラーや識別照合エラーは追加しない。

## 009のOpenAPIとの関係（Scope外の観測事項）

既存の[009のOpenAPI](../../009-backend-card-search/contracts/card-search-api.openapi.yaml)と現行実装には、`hero_point`・`initiative`・`charge`・`defender` のnullable型等の不整合が既にある。また、OpenAPIは `CardSearchResultItem.additionalProperties: false` を指定し、今回の追加項目も未定義である。

この同期問題は観測事項として記録し、今回のScopeでは修正しない。本Featureでは009のOpenAPI更新を要求せず、承認・実装・検証の前提条件にもしない。今回追加する内部API Responseの契約は本書に維持する。009との整合済み・同期完了とは扱わない。
