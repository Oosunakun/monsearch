# Data Model: 検索条件編集

> **整合注記**: 数値 Modifier の復元・canonicalization は Feature 010 と Query Specification 1.1.0 を優先する。

## SearchResultLocation

表示中の検索結果と現在条件を表す Vue Router location。

- `path`: `/cards`
- `query`: `LocationQuery`。既知 alias、不正・未知 alias、単一値または重複値を含み得る
- URL 自体が共有・bookmark・再読み込み可能な source of truth
- 編集開始時に mutation せず `SearchEditLocation` へ引き継ぐ

## SearchEditLocation

検索条件編集画面の location。

- `path`: `/cards/search`
- `query`: 編集元 `SearchResultLocation.query` と同じ論理 query
- query がない直接遷移は空 query として扱う
- page reload 時もこの query から `EditingSearchForm` を再生成する

## EditingSearchForm

既存 `SearchForm` 型で表す、編集 page instance が所有する mutable UI state。

### 生成規則

1. `createSearchForm()` で全項目の既定値を生成する。
2. `parseCardSearchQuery(SearchEditLocation.query)` が認識できる有効値だけを対応項目へ適用する。
3. 未知 alias、不正値、不完全な compound condition は適用しない。
4. text の Unicode と内部空白、有限 numeric value の `0` は保持する。
5. duplicate は既存 Query Specification の last-wins または merge 規則で一つの編集状態へ正規化する。

### field family

| Family | 代表 field | 復元規則 |
|---|---|---|
| Text | `name`, `keyword`, `effectText`, `referenceLabel` | 最後の値を trim。値がなければ空文字 |
| Single select | `cardCategory`, `landCategory` | 認識済み vocabulary のみ。無効値は既定値 |
| Multi select | `elements`, `products`, `effectTypes` など | 全表現を merge、trim、検証、deduplicate |
| Numeric comparison | `attack`, `defense`, `limit` など | 有効 operator と有限数の組だけ。zero を保持 |
| Filtered numeric | `level`, `charge`, `defender` など | 既存 Modifier を復元。存在性対象は Modifier 単独を許可し、exclude時も内部 Comparison を保持できる |
| Slot condition | ability/cost slot 群 | 有効 key と正数 count の pair がある場合だけ match を適用 |

## CanonicalSearchQuery

編集後の `EditingSearchForm` から `buildCardSearchQuery` が生成する `LogicalCardSearchQuery`。

- 空、default、不正、不完全な field は含まない
- 選択 category に適用されない保持済み field は含まない
- collection と pair は canonical order に正規化する
- 未知 alias は form に存在しないため再検索時に除去される
- 形式と alias の authority は `docs/architecture/query_specification.md`

## Relationships and state transitions

```text
SearchResultLocation (/cards?query)
  -- 条件を編集 / queryを保持 --> SearchEditLocation (/cards/search?query)
  -- parseCardSearchQuery -------> EditingSearchForm
  -- 利用者が追加・変更・解除 ---> EditingSearchForm (edited)
  -- buildCardSearchQuery -------> CanonicalSearchQuery
  -- router navigation ----------> SearchResultLocation (/cards?canonicalQuery)
```

### 状態遷移の保証

1. `query = {}` からは全既定値 form を生成する。
2. 有効 query は同じ意味の editable field へ復元する。
3. 不正部分は既定値のままにし、他の有効部分を失わない。
4. 変更なしの `parse → build` は元と意味的に同じ canonical query になる。
5. 編集・解除後はその時点で有効かつ category-applicable な条件だけが結果 location に残る。
