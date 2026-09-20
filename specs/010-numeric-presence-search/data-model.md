# データモデル: 数値能力 Modifier 整合

## SearchForm 数値条件

既存型を維持する。

| 条件 | 型 | default |
|---|---|---|
| initiative | 既存 `FilteredNumericCondition` と同じ `filterType` / operator / value 構造 | `all` |
| additionalInitiative | 既存 `FilteredNumericCondition` と同じ `filterType` / operator / value 構造 | `all` |
| heroPoint / charge / defender / additionalCharge / additionalDefender | 既存 `FilteredNumericCondition` | `all` |
| level | 既存 `FilteredNumericCondition` | `all` |

`presence` 型・フィールドは追加しない。Attack、Defense、AdditionalAttack、AdditionalDefense、Limit の型・Modifier は変更しない。

## Modifier semantics

| filterType | Initiative / Charge / Defender / Additional / Hero Point | Level |
|---|---|---|
| `all` | 存在性では絞らず、Comparison があれば評価 | `is_instant_summon` では絞らず、Comparison があれば評価 |
| `include` | 有限数の値あり。Comparison があれば追加評価 | 即時召喚可否と既存 Level Comparison |
| `exclude` | 値なし。Comparison は検索評価に使用しない | `is_instant_summon` と Level Comparison を独立評価 |

`0`、正数、負数は値あり。`NULL`、欠損、非有限値は値なし。Comparison は NULL には成立しない。

## URL mapping

| Form field | Modifier alias | Comparison alias | canonical order |
|---|---|---|---|
| initiative.filterType | `itm` | `it` | `itm → it` |
| additionalInitiative.filterType | `aitm` | `ait` | `aitm → ait` |
| heroPoint.filterType | `hem` | `he` | `hem → he` |
| charge.filterType | `chm` | `ch` | `chm → ch` |
| defender.filterType | `dem` | `de` | `dem → de` |
| additionalCharge.filterType | `achm` | `ach` | `achm → ach` |
| additionalDefender.filterType | `adem` | `ade` | `adem → ade` |

`all` は Modifier alias を省略する。`include` / `exclude` は明示値として出力する。`exclude` は Comparison が Form に残っていても Builder が Comparison を出力しない。

## State transitions

```text
all + comparison       -> modifier omitted + comparison
include                -> modifier=include
include + comparison   -> modifier=include + comparison
exclude + comparison   -> modifier=exclude (Builder output)
```

Parser は `exclude + comparison` を両方 Form に保持してよい。UI は exclude 中の Comparison を非表示にし、検索評価は Comparison を使用しない。`include` / `all` に戻った場合は保持値を再表示できる。

## Applicability

Unit 条件は no category / `unit` / `token`、Equipment 条件は no category / `item-equip` / `token` に適用する。非適用条件は既存の Builder/検索境界に従い、検索に含めない。
