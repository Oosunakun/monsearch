# UI / Navigation Contract: カードセット一覧から検索結果を開く

## Scope

`ProductTable` を利用する `/` と `/restrictions` のカードセット名と、既存 `/cards` route の間の UI/navigation contract を定義する。公開 API や server endpoint ではない。URL Query contract の Source of Truth は [`docs/architecture/query_specification.md`](../../../docs/architecture/query_specification.md) である。

## Input Contract

- source: `ProductRow.searchValue`
- accepted value: `PRODUCT_VALUES` に含まれる単一の `Product`
- display label: `ProductRow.productName`
- `productName`、`shortName`、`id` から検索値を推測してはならない。

## Interaction Contract

- `productName` のみを semantic link/button として操作可能にする。
- keyboard と pointer の双方で同じ navigation を開始できる。
- `productNote`、`releaseDate`、略称、行余白は navigation を開始しない。
- desktop/mobile の双方で同じ `searchValue` と route contract を使用する。
- `/` と `/restrictions` の双方で同じ `searchValue` validation と route contract を使用する。
- invalid `searchValue` では検索 link/location を生成せず、遷移しない。

## Output Contract

有効入力の logical Vue Router location:

```ts
{
  path: '/cards',
  query: {
    pd: '<selected Product value>'
  }
}
```

Guarantees:

- `query` は `pd` 以外の key を持たない。
- `pd` は Query Specification で `products` に割り当てられた canonical collection alias である。
- `pd` は選択した row の値1件のみで、以前の route query を merge しない。
- percent encoding は Vue Router に委譲し、builder は logical value を返す。
- 同じ表示名の rows でも、各 `searchValue` に対応する異なる location を生成できる。
- 無効入力に bare `/cards` fallback を返さない。
- 同じ有効 `searchValue` は、`/`、`/restrictions`、desktop、mobile のどの起点からも同一 location を生成する。

## Consumer Contract

`/cards` は Query Specification に従う既存 `parseCardSearchQuery(route.query)` を通じて `pd` を `SearchForm.products` の1件へ復元し、既存の検索 engine と表示規則を適用する。一覧画面起点か詳細検索起点かを判別する追加 state は導入しない。

## Persistence / Re-entry Contract

- URL Query を検索条件の Source of Truth とする。
- initial navigation、reload、bookmark、新しい tab、共有 URL からの直接表示は、すべて既存 `/cards` parser を通る。
- 有効な `/cards?pd=<value>` を再表示した場合、`SearchForm.products` は `[<value>]` へ復元され、ほかの fields は既存 defaults となる。
- 復元のために component state、store、history state、起点画面情報などの Feature 固有 state を要求しない。

## Examples

```text
太陽の金の竜姫 row (searchValue = 91122d7e)
  -> /cards?pd=91122d7e

同名 row A (searchValue = set-a)
  -> /cards?pd=set-a

同名 row B (searchValue = set-b)
  -> /cards?pd=set-b
```

最後の2例は識別規則を示す概念例であり、実際には各値が `PRODUCT_VALUES` に登録されている場合だけ有効となる。

## Error / Empty Result Behavior

- invalid/empty input: navigation を開始しない。
- valid input with zero visible cards: `/cards?pd=<value>` を保持したまま、既存の結果なし表示を示す。
- 検索処理失敗時: `/cards` の既存 error handling に従う。
