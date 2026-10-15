# Data Model: 検索結果のデック制限表示

## Source: `Card.modification`

唯一のデータソースは `app/utils/mockData/items/cards.json` の各カード自身の改訂情報。既存の `types/cards/finderCards.ts` の `Card` に、今回利用する最小のSource型を追加する設計とする。

```ts
interface CardModification {
  deck_restriction_count: number | '' | null
}

// 既存Cardへの追加部分
interface Card {
  modification: CardModification | null
}
```

上記は追加部分の抜粋であり、既存Cardの他フィールドを置き換えない。Source JSONにある `modification_text`・`is_deck_restriction_lifted` 等はそのまま残すが、今回の処理では使用しない。`modification` に改訂開始日・終了日のフィールドは存在しない。日付チェック・バイパス設定は実装せず、`errata` 等の別領域の日付を流用しない。

現データのすべてのカードに `modification` が存在するため必須かつnullableとする。枚数制限の値の `null` はHuman Decisionに従ってSource型で許容する。数値文字列など、承認済み入力範囲外の値の意味は追加定義せず、必要になった時点でHumanへ確認する。

## 正規化と表示

| Source | API `deck_restriction_count` | 検索結果Chip |
|---|---|---|
| 数値 `0` | `0` | 禁止 |
| 数値 `1` | `1` | 1枚制限 |
| 数値 `2` | `2` | 2枚制限 |
| 数値 `3` 以上 | 同じ数値 | 表示しない |
| 値が `null` | `null` | 表示しない |
| 値が空文字 `''` | `null` | 表示しない |
| `modification: null` | `null` | 表示しない |

数値は保持し、Chipは `0`・`1`・`2` との明示的な一致で表示する。`0` を欠落させるtruthiness判定や、空文字を `0` にする数値変換はしない。`3` 以上を `null`・無制限などへ変換しない。非表示からカードの合法性や制限解除を推定しない。

## API DTO: `CardSearchResultItem`

既存のNuxt内部API `/api/cards` が利用する `server/types/cardSearch.ts` のDTOに次の必須項目のみを追加する。今回の内部API Responseの契約は [contracts/card-search-result.md](contracts/card-search-result.md) とする。

```ts
// 既存CardSearchResultItemへの追加部分
interface CardSearchResultItem {
  deck_restriction_count: number | null
}
```

Sourceでの空文字とnullの違いは表示に必要ないためDTOではnullへ統一する。欠損を省略や空文字で返さず、数値の意味を保つ。`modification` 全体、状態enum、ルール配列、期間・基準日・適用条件は返さない。

## データの流れ

```text
cards.json の各 Card.modification.deck_restriction_count
  → getSourceCards（既存の読込）
  → 検索 → sort → pagination（既存処理）
  → projectCard / projectCards（数値保持・空文字/nullの正規化）
  → CardSearchResultItem.deck_restriction_count
  → ItemHeader付近のChip（0/1/2のみ）
```

値はproject対象のカードから直接取得する。同名カードでも互いの値を流用しない。`reference_label` は既存の表示識別情報として維持するが、別JSONとのjoin keyには使用しない。別の制限データの読込・照合や条件付きモデルは存在しない。

## 既存動作との境界

枚数制限値は結果表示属性であり、検索対象、件数、カテゴリ別件数、sort、pagination、URL Queryに関与しない。正規化のためにカードを除外せず、既存projectionの必須フィールド検査は維持する。
