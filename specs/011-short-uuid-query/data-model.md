# Data Model: Short UUID検索条件

## Short UUID value

| 項目 | 定義 |
|---|---|
| 表現 | ASCII hexadecimal `[0-9a-fA-F]` の5文字 |
| 入力 | 大文字小文字を区別せず受理 |
| canonical | 英字を小文字化した5文字 |
| 形式不正 | SearchForm/Canonical Queryへ保持しない |
| master data不存在 | canonical値を保持し、検索時は非ヒット |
| 衝突 | 同一Parameter内の一意性は生成側保証。検索側は検出・解決しない |

## Short UUID search Parameter

| Query alias | SearchForm field | 対象データ |
|---|---|---|
| `ct` | `cardTypes` | card type ID suffix |
| `pd` | `products` | product ID suffix |
| `fa` | `factions` | faction ID suffix |
| `ra` | `races` | race ID suffix |
| `il` | `illustrators` | illustrator ID suffix |
| `eat` | `effectActivationTypes` | effect activation type ID suffix |
| `re` | `resistances` | resistance/affinity ID suffix |
| `are` | `additionalResistances` | resistance/affinity ID suffix |

CollectionはParameter内ORの既存意味論を維持する。形式上有効な未知値だけのCollectionは条件として残り、各カードの対応IDが後方一致しないため結果は0件になる。

## Validation and transitions

`LocationQuery` → collection split → trim → fixed-length ASCII hex validation → lowercase canonicalization → SearchForm collection → Builder serialization、の順に変換する。Builderから出力する値はすべて同じvalidator/canonicalizerを通す。対象外aliasは既存のNatural Key/Pair/Comparison処理を変更しない。
