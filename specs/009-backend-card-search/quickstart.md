# Quickstart: バックエンドによるカード検索の検証

## Prerequisites

- Node.js、npm、install済みdependencies
- [API contract](contracts/card-search-api.openapi.yaml)
- [Data model](data-model.md)
- query rules: `docs/architecture/query_specification.md`

## Automated verification

```powershell
npm test -- --run
npx nuxi typecheck
npm run lint
npm run build
```

期待結果: featureに関連するunit/integration/page tests、strict typecheck、lint、Cloudflare Pages buildが成功する。parity suiteは固定件数ではなく、primitive、collection、comparison、pair collection、modifier、duplicate、0を含む境界値、category applicability、複合条件の代表casesを網羅する。

## Development server and API

```powershell
npm run dev
Invoke-RestMethod 'http://localhost:3000/api/cards'
Invoke-RestMethod 'http://localhost:3000/api/cards?nm=ドラゴン&page=1&perPage=20&sort=id&order=asc'
Invoke-RestMethod 'http://localhost:3000/api/cards?cc=unit&el=fire%2Cwater&lv=gte%3A3&page=1&perPage=50&sort=atk&order=desc'
```

各応答がHTTP 200で、`items`、`totalCount`、`page`、`perPage`、`totalPages`、`sort`、`categoryBreakdown`を持つことを確認する。`items.length <= perPage`、category件数の合計が`totalCount`と一致することも確認する。

## Graceful Parsing

```powershell
Invoke-RestMethod 'http://localhost:3000/api/cards?unknown=x&lv=broken&cc=unit'
Invoke-RestMethod 'http://localhost:3000/api/cards?lv=broken&page=bad&perPage=999&sort=unknown&order=sideways'
```

期待結果:

1. 未知`unknown`と不正`lv`だけが無視され、最初の要求は有効な`cc=unit`で検索される。
2. 2番目の要求は条件なし、`page=1`、`perPage=20`、`sort=id`、`order=asc`としてHTTP 200になる。
3. 有効だが一致しない条件はHTTP 200、`items=[]`、`totalCount=0`、`page=1`、`totalPages=1`になる。

## Pagination and sort

1. `sort=id|rarity|atk`と`order=asc|desc`の全組合せを確認する。
2. `perPage=20|50|100`で各pageのitems数とmetadataを確認する。
3. 同じ要求を繰り返し、同じ順序になることを確認する。
4. 最終pageを超える`page`を指定し、responseの`page`が最終pageへclampされることを確認する。
5. `categoryBreakdown`がpage sliceではなく全一致結果を表すことを確認する。
6. sortの主比較値が同じcardはJSON source順を維持することを確認する。

## UI end-to-end states

1. `/cards/search`から条件を指定し、`/cards?...`へ移動する。
2. network panelでBrowserが全cards JSONを取得せず、`/api/cards`へ検索queryとpage/sort指定を送ることを確認する。
3. loading後に結果件数、category内訳、カード一覧、page情報が表示されることを確認する。
4. sort、方向、page件数、pageを変更し、APIの適用値と画面表示が一致することを確認する。
5. 0件はempty state、API failureはerror stateとなることを確認する。
6. failure後、条件を再入力せず同じrequestでretryできることを確認する。
7. API failureが`HTTP 500 / CARD_SEARCH_FAILED`として扱われることを確認する。

## Projection and bundle boundary

- response itemだけで既存`ResultItem`、`ResultSummary`、`cardDesign`の表示が成立することを確認する。
- responseに`search_support`、tags、errata、flavor text、source version/generated timestamp、未使用内部IDが含まれないことをcontract testで確認する。
- Browser bundleが`app/utils/mockData/items/cards.json`を直接importしないことをbuild outputで確認する。

## 実装後の確認結果

- `GET /api/cards` は検索条件、sort、pagination、category内訳、公開projectionをServer側で処理する。
- 結果画面はAPIのloading、success、0件、errorを分離し、error時は最後のrequestを再試行する。
- 2026-09-04時点でunit/page tests、strict typecheck、ESLint、Cloudflare Pages buildを完了した。
- client build成果物にはcards JSONの既知card IDおよび`cards.json`参照が含まれず、datasetはNitro API routeだけにbundleされた。
