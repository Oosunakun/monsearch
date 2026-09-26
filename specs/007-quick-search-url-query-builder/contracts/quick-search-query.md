# Contract: Quick Search Logical URL Query

## Authority and route

- card-list route は `/cards`。
- alias、primitive format、canonical behavior、version policy は `docs/architecture/query_specification.md` version 1.0.0 を authority とする。
- version 1 の URL に version parameter は付けない。

## Builder contract

- Input: read-only な `QuickSearchState` snapshot。
- Query output: Vue Router-compatible logical query object。
- Query output は `nm`、`att`、`kw` のいずれか1つ、または empty object。
- Location output は `{ path: '/cards', query }` または query が空の `{ path: '/cards' }`。
- builder は input object を変更せず、URL percent-encoding を行わない。

## Target mapping

| `selectedSearchType` | Output alias |
|---|---|
| `name` | `nm` |
| `race-type` | `att` |
| `keyword` | `kw` |

表にない target と空 target は未対応であり、暗黙の fallback を行わない。

## Canonical and omission rules

1. `searchText` の先頭・末尾 whitespace を除去する。
2. trim 後の text が空なら text condition を出力しない。
3. 内部 whitespace、Unicode、emoji、reserved punctuation は logical value として保持する。
4. 選択 target に対応する condition だけを出力し、以前の target の condition は残さない。
5. `selectedCardPool`、現行 `pool`/`type`/`q`、その他の未承認 state は出力しない。
6. 同じ意味の state は同じ単一-key query を生成する。
7. input state と nested values を変更しない。

## Navigation contract

- non-empty output: `router.push({ path: '/cards', query })`
- empty output: `router.push({ path: '/cards' })`
- Vue Router が browser URL の encoding を担当するため、builder/composable は value を事前 encode しない。

## Behavioral examples

| Input target | Input text | Logical result |
|---|---|---|
| `name` | `  Blue Dragon  ` | `{ nm: 'Blue Dragon' }` |
| `race-type` | `竜族 / 英雄` | `{ att: '竜族 / 英雄' }` |
| `keyword` | `a,b:c=1 🐉` | `{ kw: 'a,b:c=1 🐉' }` |
| `name` | whitespace only | `{}` |
| unsupported | `Dragon` | `{}` |

## Compatibility boundary

`att` は approved query vocabulary に属するため common logical query type/schema で認識する。ただし現行 detailed-search `SearchForm` に archetype text field はなく、本 contract は detailed-search builder/parser にその field を追加することを要求しない。QuickSearch から `/cards` を経て詳細検索画面へ遷移しても、現行 card-list parser は `att` を form field へ復元しないため `att` は失われる。この挙動は許容仕様であり、本 feature が保証するのは canonical URL transport と location の再利用までとする。カード検索 engine による実データ filtering は scope 外である。
