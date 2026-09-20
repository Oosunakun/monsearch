# URL Query・詳細検索契約

## Authority

Alias、値形式、重複、default omission、canonical order は `docs/architecture/query_specification.md` Version 1.1.0 に従う。

## Mapping

| 数値能力 | Modifier alias | Comparison alias | 順序 |
|---|---:|---:|---|
| initiative | `itm` | `it` | `itm → it` |
| charge | `chm` | `ch` | `chm → ch` |
| defender | `dem` | `de` | `dem → de` |
| additionalInitiative | `aitm` | `ait` | `aitm → ait` |
| additionalCharge | `achm` | `ach` | `achm → ach` |
| additionalDefender | `adem` | `ade` | `adem → ade` |
| heroPoint | `hem` | `he` | `hem → he` |

Level は既存の `lvm → lv` であり、Level 例外の規則を適用する。

## Builder

- `all` は Modifier を出力しない。
- `include` / `exclude` は Modifier を出力する。
- `include` は Comparison がなくても完全な条件として出力する。
- `include + comparison` は両方を出力する。
- `exclude + comparison` は Modifier のみを出力する。
- `exclude` の内部 Comparison は Form から削除しない。
- `attack`、`defense`、`additionalAttack`、`additionalDefense`、`limit` に新規 Modifier を出力しない。

## Parser

- 有効な Modifier と Comparison は SearchForm に復元する。
- `exclude + comparison` を Parser 段階で削除・null 化しない。
- UI は exclude 中の Comparison を非表示にできるが、同一 Form 内で include/all に戻った際は保持値を再表示できる。
- Parser → Builder では `exclude + comparison` が Modifier のみへ canonicalize される。
- 不正・未知値は既存 Query Specification の graceful parsing に従い、他の有効条件を保持する。

## Search semantics

`0` は値あり、`NULL` は値なし。Comparison は NULL に成立しない。Initiative / Charge / Defender / Additional 系と Hero Point は `exclude` 時に Comparison を評価しない。Level は `is_instant_summon` と Level Comparison を独立評価する。
