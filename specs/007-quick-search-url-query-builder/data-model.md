# Data Model: Quick Search URL Query Builder

## QuickSearchState

header と navigation drawer が共有し、`useQuickSearch` が所有する mutable UI state。

| Field | Type | Meaning | Validation / output rule |
|---|---|---|---|
| `selectedCardPool` | `string` | 現行 UI の card pool 選択 | approved query 語彙にないため output しない |
| `selectedSearchType` | `QuickSearchTarget`（runtime 境界では未知値も防御） | text を適用する検索対象 | support target のみ alias へ map。未知・空値は omit |
| `searchText` | `string` | 利用者入力 text | 両端を trim。空なら omit。内部 whitespace と Unicode は保持 |

builder は `Readonly<QuickSearchState>` として参照し、field を変更しない。

## QuickSearchTarget

サポート対象を表す closed vocabulary。

| Target | UI meaning | Canonical alias |
|---|---|---|
| `name` | カード名 | `nm` |
| `race-type` | 種族・タイプ | `att` |
| `keyword` | キーワード | `kw` |

空値または表にない runtime value は他 target へ fallback しない。

## CanonicalQuickSearchQuery

Vue Router に渡す前の logical query object。approved `LogicalCardSearchQuery` vocabulary の subset であり、`nm`、`att`、`kw` のうち最大1 key と、trim 後の non-empty string value を持つ。

### Invariants

- key は選択中 target に対応する1つだけ。
- value は logical text であり、builder は percent-encode しない。
- 同じ意味の input は同じ key/value と insertion order を生成する。
- empty/invalid input の表現は `{}`。
- `pool`、`type`、`q` および未承認 field は含まない。

## QuickSearchLocation

- route path: `/cards`
- valid query: `{ path: '/cards', query: CanonicalQuickSearchQuery }`
- empty query: `{ path: '/cards' }`
- Vue Router が browser URL の percent-encoding と reopening 時の decoding を担当する。

## Relationships and state transitions

```text
QuickSearchState
  -- pure normalize + target mapping --> CanonicalQuickSearchQuery
  -- location assembly --------------> QuickSearchLocation
  -- Vue Router navigation ----------> /cards?...
  -- browser reload/share -----------> same logical route query
```

1. 利用者が header または drawer で target と text を編集する。
2. submit 時に builder が current state を read-only input として読む。
3. text を trim し、target と text が有効な場合だけ1 condition を生成する。
4. card pool と unsupported values は捨てるが、state 自体は変更しない。
5. location builder が query の有無に応じた `/cards` location を返し、composable が Vue Router へ渡す。
6. reload、bookmark、share 後も route query は同じ logical target/value を表す。
