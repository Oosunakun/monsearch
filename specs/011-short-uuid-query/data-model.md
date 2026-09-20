# Data Model: Short UUID検索条件

## Short UUID value

| 項目 | 定義 |
|---|---|
| 表現 | ASCII hexadecimal `[0-9a-fA-F]` の5文字 |
| 入力 | 大文字小文字を区別せず受理 |
| canonical | 英字を小文字化した5文字 |
| 形式不正 | SearchForm/Canonical Queryへ保持しない |
| master data不存在 | canonical値を保持し、validation failureにせず既存のParameter固有server-side semanticsへ渡す |
| 衝突 | 同一Parameter内の一意性は生成側保証。検索側は検出・解決しない |

## Short UUID search Parameter

| Query alias | SearchForm field | 対象データ |
|---|---|---|
| `ct` | `cardTypes` | 既存のcard type検索意味論で参照されるデータ |
| `pd` | `products` | 既存のproduct検索意味論で参照されるデータ |
| `fa` | `factions` | 既存のfaction検索意味論で参照されるデータ |
| `ra` | `races` | 既存のrace検索意味論で参照されるデータ |
| `il` | `illustrators` | 既存のillustrator検索意味論で参照されるデータ |
| `eat` | `effectActivationTypes` | 既存のeffect activation type検索意味論で参照されるデータ |
| `re` | `resistances` | 既存のresistance検索意味論で参照されるデータ |
| `are` | `additionalResistances` | 既存のadditional resistance検索意味論で参照されるデータ |

CollectionはParameter内ORの既存意味論を維持する。形式上有効な未知値だけのCollectionは条件として残り、validation failureにはならない。値は既存のParameter固有server-side semanticsへ渡される。ID照合を行う既存semanticsでは対応IDとの一致がない値となるが、ct / fa / ra の名称fallback、re / are のAffinity照合、Natural Key semanticsなどを含む全alias共通の0件結果まではこのFeatureで保証しない。

## Validation and transitions

`LocationQuery` → collection split → trim → fixed-length ASCII hex validation → lowercase canonicalization → SearchForm collection → Builder serialization、の順に変換する。Builderから出力する値はすべて同じvalidator/canonicalizerを通す。対象外aliasは既存のNatural Key/Pair/Comparison処理を変更しない。
