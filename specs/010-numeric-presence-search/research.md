# 調査記録: 数値能力 Modifier 整合

## 調査対象

既存の `SearchForm`、default factory、Builder/Parser、詳細検索 UI、server matcher、mock data、Query Specification、Query Data Specification、002/005/009 artifacts を確認した。

## Decision 1: 既存 Modifier を拡張する

- **Decision**: `NumericCondition` / `FilteredNumericCondition` に新しい `presence` フィールドを追加せず、既存の `filterType: all | include | exclude` を使用する。
- **Rationale**: 既存 Charge / Defender / Hero Point の UI、default、URL Modifier と同じ設計を維持できる。
- **Alternatives considered**: 全数値能力に `presence` union と `...p` Alias を追加する案は、Feature の範囲を広げ、既存 Modifier 設計と正式仕様を二重化するため採用しない。

## Decision 2: 新規 Alias は Initiative 系の2つだけ

- **Decision**: `initiative.filterType` は `itm`、`additionalInitiative.filterType` は `aitm` とする。canonical order はそれぞれ `itm → it`、`aitm → ait`。default `all` は省略する。
- **Rationale**: 既存の Modifier suffix `m` と additional prefix `a` を維持する。
- **Alternatives considered**: `itp`、`aitp`、全数値能力への presence alias は採用しない。

## Decision 3: 対象ごとの Modifier semantics

- Initiative / Charge / Defender / Additional 系は `all` が存在性を問わず Comparison を評価し、`include` が非 NULL 値を要求し Comparison があれば追加評価し、`exclude` が値なしを要求して Comparison を検索評価しない。
- Hero Point は Modifier が `is_hero` を参照し、`exclude` 時の Hero Point Comparison は使用しない。
- Level は例外で、`is_instant_summon` と Level Comparison を独立に評価する。 `lvm=exclude&lv=gte:2` は有効である。
- **Rationale**: Query Data Specification の確定した Domain semantics と今回の Human Decision に一致する。

## Decision 4: Parser と Builder の責務を分離する

- **Decision**: Parser は有効な Modifier と Comparison を SearchForm に復元し、`exclude` 時の Comparison を削除しない。Builder は `exclude` 時に Comparison を出力せず Modifier のみへ canonicalize する。
- **Rationale**: 手書き URL の情報を復元しつつ、共有・再検索時の canonical URL は意図した意味へ正規化できる。
- **Alternatives considered**: Parser で Comparison を null 化する案は、同一画面で include/all に戻った際の値保持を壊すため採用しない。

## Decision 5: 検証範囲を限定する

`0` / `NULL`、正負数、Modifier 単独、include + Comparison、exclude + Comparison、Builder/Parser、Initiative UI、Additional Initiative UI、Hero Point、Level 例外、server matcher を代表ケースとして検証する。新しい能力、Schema migration、コスト検索、Tasks 生成は本 Feature の成果物に含めない。
