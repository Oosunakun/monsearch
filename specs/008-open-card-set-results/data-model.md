# Data Model: カードセット収録カード検索

## 1. Card Set Search Option

既存 `productItems.json` / `PRODUCT_OPTIONS` がカード検索で受理可能なカードセット vocabulary を表す。

| Field | Type | Rule |
|---|---|---|
| `label` | `string` | 詳細検索での表示名。検索 identity として使用しない |
| `value` | `Product` (`string`) | `PRODUCT_VALUES` に含まれる一意な検索値 |
| `color` | `string` | 表示 metadata。本 feature の navigation には使用しない |

Validation:

- navigation に使用できる値は `PRODUCT_VALUES.has(value)` を満たすこと。
- 同名 option が存在しても `value` により区別すること。

## 2. Product Row

カードセット一覧の1行を表す既存 view model を拡張する。

| Field | Type | Rule |
|---|---|---|
| `id` | `string` | `v-data-table` の item identity。一覧内で一意にする |
| `searchValue` | `Product` | 対応する Card Set Search Option の `value`。表示名から導出しない |
| `shortName` | `string` | 略称表示。空を許容 |
| `productName` | `string` | 選択対象として表示するカードセット名 |
| `productNote` | `string` | 非選択の備考表示 |
| `releaseDate` | `string` | 非選択の発売日表示（既存形式） |
| `zebra` | `boolean` | 表示上の交互色 |

Validation:

- valid row: `searchValue` が許可済み product value である。
- invalid row: link/navigation を生成しない。表示を維持する場合も不正確な検索へ遷移させない。
- `id` と `searchValue` は異なる責務を持ち、相互変換を前提にしない。

## 3. Product Search Location

一覧選択から Vue Router に渡す navigation value。

```text
ProductSearchLocation
├── path: "/cards"
└── query
    └── pd: Product
```

Rules:

- query key は `pd` だけを持つ。
- `pd` は選択した row の `searchValue` 1件だけを持つ。
- valid location は `{ path: '/cards', query: { pd: searchValue } }`。
- invalid `searchValue` から location を生成しない。
- logical value を事前に percent encode しない。
- logical query mapping と canonical rule は `docs/architecture/query_specification.md` を Source of Truth とし、`products` の alias `pd` を用いる。
- `/`、`/restrictions`、desktop、mobile のいずれを起点としても、同じ `searchValue` は同じ location を生成する。

## 4. Search Result Condition

既存 `parseCardSearchQuery` により URL Query の `pd` は `SearchForm.products` へ復元される。URL Query が Source of Truth であり、Feature 固有 state は持たない。

| Field | Type | Rule |
|---|---|---|
| `products` | `Product[]` | 一覧起点では選択した1件のみ |
| other fields | existing defaults | 一覧起点で追加指定しない |

Restoration:

- initial navigation、reload、bookmark、新しい tab、共有 URL のすべてで同じ parsing path を使用する。
- `pd` が同じ有効値なら起点画面や閲覧 session に関係なく同じ `products: [searchValue]` を復元する。

## Relationships

```text
Card Set Search Option (1)
        │ value
        ▼
Product Row (1) ── `/` または `/restrictions` で productName を選択 ──> Product Search Location (1)
                                                │ pd
                                                ▼
                                      Search Result Condition (1)
                                                │ filters
                                                ▼
                                        Recorded Cards (0..*)
```

## State Transitions

```text
一覧表示
  ├─ valid productName 選択 ─> pd location 構築 ─> /cards navigation ─> parser による条件復元 ─> 結果または結果なし
  ├─ reload/bookmark/new tab/share ─> URL Query 読込 ─> 同じ parser による条件復元 ─> 同じ条件の結果
  ├─ invalid row の名称操作 ─> location なし ─> 一覧表示を維持
  └─ 備考・発売日・余白操作 ─> event なし ─> 一覧表示を維持
```

連続選択では各 navigation が独立した location を生成し、以前の query を merge しないため、最後に選択した1件だけが条件となる。
