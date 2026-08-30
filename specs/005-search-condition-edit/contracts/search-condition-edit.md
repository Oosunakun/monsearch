# Contract: 検索条件編集 UI と route 遷移

## Authority

- query alias、value format、duplicate、default、canonicalization の規則は `docs/architecture/query_specification.md` と feature 002 の [card search query contract](../../002-query-builder/contracts/card-search-query.md) に従う。
- 本 contract は、その query を結果画面と既存詳細検索画面の間で受け渡す UI 境界だけを追加する。

## 結果画面から編集画面

### Input

- 現在 route: `/cards`
- 現在 query: Vue Router の `LocationQuery`。空、canonical、non-canonical、未知・不正値混在のいずれも許容する
- user action: 「条件を編集」

### Output

- navigation target: `{ path: '/cards/search', query: currentRoute.query }`
- query が空なら `/cards/search` 相当
- 元の route query object を変更しない

## 編集画面の初期化

### Input

- `/cards/search` の現在の `route.query`

### Output

- `parseCardSearchQuery(route.query)` が返す完全な `SearchForm`
- 全 component はこの form を通常の `v-model` として編集できる

### Error tolerance

1. 未知 alias は無視する。
2. 認識済み alias の不正値はその field の既定値として扱う。
3. 不完全な modifier/base の組は standalone condition に変換しない。
4. 一つの不正値を理由に navigation、page rendering、他 field の復元を失敗させない。
5. query に認識できる条件がなくても既定 form を操作・submit できる。

## 編集画面から結果画面

### Input

- 利用者が編集した `SearchForm`
- user action: 検索実行

### Output

- `buildCardSearchQuery(form)` が non-empty の場合: `{ path: '/cards', query: canonicalQuery }`
- empty の場合: `{ path: '/cards' }`
- 元 query への差分更新は行わず、form の有効状態から全 query を再構築する

## Behavioral guarantees

1. 有効な現在条件は結果 → 編集で対応する全 field family へ復元される。
2. 条件を変更しない結果 → 編集 → 結果の往復は意味的に同じ canonical query になる。
3. 追加、変更、解除は再構築後の結果 query に反映される。
4. Unicode、空白、予約記号、絵文字、numeric zero は router/parser/builder の round trip で意味を保持する。
5. category 非適用の保持済み field は form に残り得るが、再検索 query には含まれない。
6. `/cards/search?query` の reload は同じ parse 規則で同じ編集状態を再生成する。
