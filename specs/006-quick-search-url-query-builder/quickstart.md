# Quickstart: Quick Search URL Query Builder の検証

## Prerequisites

- checked-in Nuxt 4 toolchain と互換性のある Node.js / npm
- branch `006-quick-search-url-query-builder`
- `package-lock.json` に従って dependencies を install 済みであること

## Setup

```powershell
npm ci
```

## Automated validation

実装中は focused tests、完了時は全 quality gates を実行する。

```powershell
npm test -- quickSearch
npm test -- --run
npx vue-tsc --noEmit
npm run lint
npm run build
```

Expected outcomes:

- `name`、`race-type`、`keyword` がそれぞれ `nm`、`att`、`kw` の単一 condition を生成する。
- text の両端 whitespace は除去され、内部 whitespace、日本語、emoji、予約記号は logical value として保持される。
- empty/whitespace-only text、unsupported target は empty query になり、card pool と未承認 parameter は出力されない。
- 100回の同一 input で同一 query が生成され、source state は変更されない。
- valid query は `{ path: '/cards', query }`、empty query は `{ path: '/cards' }` で navigation する。
- memory router round trip 後も logical value が保持される。
- full test suite、typecheck、lint、Cloudflare Pages production build が成功する。

## Manual end-to-end validation

1. `npm run dev` を実行し、quick search を表示する任意の page を開く。
2. header で「カード名」を選択し、`  青い竜 🐉  ` を submit する。
3. `/cards` に遷移し、logical condition が `nm=青い竜 🐉` を表すこと、`pool`、`type`、`q` がないことを確認する。
4. navigation drawer から「種族・タイプ」で `竜族 / 英雄` を submit し、`att` だけが出力されることを確認する。
5. 「キーワード」で `a,b:c=1` を submit し、URL を新しい tab で開いて route query の value が同じ文字列として解釈されることを確認する。
6. 空文字、whitespace-only text、unsupported target をそれぞれ submit し、query suffix のない `/cards` が開くことを確認する。
7. 同じ input を繰り返し submit し、location が毎回一致することを確認する。

normative details は [quick search query contract](contracts/quick-search-query.md)、[data model](data-model.md)、`docs/architecture/query_specification.md` を参照する。
