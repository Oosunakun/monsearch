# 検証ガイド: 数値能力 Modifier 整合

## 前提条件

- Node.js と依存関係をセットアップ済みであること。
- `app/utils/mockData/items/cards.json` を含む通常の開発データを使うこと。

## 代表シナリオ

1. Initiative の UI で `all` + `gte:0` を指定し、URL が `it=gte:0` となることを確認する。
2. Initiative で `include` のみを指定し、URL が `itm=include` となることを確認する。
3. Initiative で `include` + `gte:0` を指定し、URL が `itm=include&it=gte:0` となることを確認する。
4. Initiative で `exclude` に切り替え、比較値を内部 Form に保持したまま UI で非表示にし、URL が `itm=exclude` のみとなることを確認する。
5. `chm=exclude&ch=gte:2` を Parser に渡すと両方が Form に復元され、Builder では `chm=exclude` のみになることを確認する。
6. `aitm=include`、`hem=exclude`、`lvm=exclude&lv=gte:2` を確認する。
7. `0`、正数、負数、NULL の matcher 結果が、対象能力ごとの Modifier semantics と一致することを確認する。

## 実行済み検証

以下を実行し、focused suite は 30/30 passed、strict typecheck と ESLint は clean となった。

```powershell
node node_modules/vitest/vitest.mjs --run app/utils/search/cardSearchFormFactory.test.ts app/utils/search/cardSearchQueryBuilder.test.ts app/utils/search/cardSearchQueryParser.test.ts server/utils/cardSearch/search.test.ts --configLoader native --pool=threads --maxWorkers=1 --no-file-parallelism
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/nuxt/bin/nuxt.mjs build
```

Builder/Parser は `itm` / `aitm`、Modifier 単独、`exclude + Comparison` の canonicalization を検証し、server matcher は `0` と NULL、Hero Point、Level 例外を検証する。
全テストは 21 files / 95 tests passed、Cloudflare Pages production build も完了した。Build 時の既知の Vuetify `useLayout` 重複警告と plugin timing 警告は残るが、失敗はない。
