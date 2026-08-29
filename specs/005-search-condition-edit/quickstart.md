# Quickstart: 検索条件編集の検証

## Prerequisites

- Node.js と checked-in Nuxt 4 toolchain に対応する npm
- branch `005-search-condition-edit`（作業 branch 名は `feature/search-condition-edit`）
- `package-lock.json` から dependency を install 済み

## Setup

```powershell
npm ci
```

## Automated validation

focused test と全 quality gate を実行する。

```powershell
npm test -- --run app/pages/cards/index.test.ts app/pages/cards/search.test.ts app/utils/search/cardSearchQueryParser.test.ts app/utils/search/cardSearchQueryBuilder.test.ts
npm test -- --run
npm run lint
npx vue-tsc --noEmit
npm run build
```

Expected outcomes:

- `/cards` の「条件を編集」が現在 query を `/cards/search` へ保持して遷移する。
- 検索 page が text、single/multiple select、numeric、filter、slot、logical match を form へ復元する。
- 空 query では全 field が既定値になる。
- 有効値と未知・不正・不完全な値の混在時、有効値だけが復元される。
- 変更なしの submit は意味的に同じ canonical query、変更・解除後の submit は更新後の query を生成する。
- Unicode、予約記号、絵文字、numeric zero が round trip で保持される。
- category 非適用の保持値は submit query へ混入しない。
- lint、typecheck、production build が成功する。

## Manual end-to-end validation

1. `npm run dev` を実行し、日本語・空白・予約記号・絵文字、複数選択、numeric zero と比較 operator を指定して `/cards/search` から検索する。
2. `/cards` で「条件を編集」を押し、URL が `/cards/search` へ変わって current query が保持され、対応する全入力が復元されることを確認する。
3. 一つの条件を変更し、別の条件を解除して検索し、結果 URL が編集後の全条件だけを含むことを確認する。
4. もう一度編集し、変更せず検索して、結果 URL が同じ canonical query になることを確認する。
5. `/cards/search` の URL を reload し、同じ form state が復元されることを確認する。
6. query に未知 alias、不正 comparison、不完全 modifier を追加して編集画面を開き、有効条件が残り page が操作可能であることを確認する。
7. category-specific field を設定後、非適用 category に切り替えて検索し、その field が結果 query に含まれないことを確認する。
8. query なしの `/cards` から編集し、全既定値の form が開くことを確認する。

詳細な遷移は [UI contract](contracts/search-condition-edit.md)、状態は [data model](data-model.md)、query の形式は `docs/architecture/query_specification.md` を参照する。

## Validation record (2026-08-29)

- focused test: PASS（5 files / 20 tests）
- full test: PASS（9 files / 25 tests）
- ESLint: PASS（変更対象ファイル）
- typecheck: PASS（`vue-tsc --noEmit`）
- production build: PASS（Cloudflare Pages preset）
- manual code-path review: PASS（query の受け渡し、route-to-form 復元、canonical submit、不正値の field 単位回復を確認）
- browser での目視操作: 未実施（同一 journey は page integration test で自動検証）

Vitest は実行環境の子プロセス制約を避けるため `--pool=threads --maxWorkers=1` で実行した。Nuxt/Vuetify の既存 `useLayout` duplicate warning と build の chunk-size warning は出力されたが、いずれも成功終了した。
