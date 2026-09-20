# Quickstart: Short UUID検索条件の検証

## 前提

- Repository root: `F:\Projects\monsearch`
- Node dependencies installed
- PowerShellから実行

## Unit and search tests

```powershell
npm run test -- app/utils/search/cardSearchQuerySchema.test.ts app/utils/search/cardSearchQueryParser.test.ts app/utils/search/cardSearchQueryBuilder.test.ts server/utils/cardSearch/search.test.ts
```

期待結果:

- `ct/pd/fa/ra/il/eat/re/are` の5桁hex、大文字小文字混在、桁数違い、非hexが仕様どおりに処理される。
- 例として `pd=22D7E` はFormで `22d7e` になり、Builderで `pd=22d7e` に戻る。
- master dataにない有効値は削除されず、validation failureにならず、既存server-side searchの当該Parameter固有の意味論へ渡される。全alias共通の0件結果は検証対象としない。
- 同一Parameter内の複数値は既存ORを保つ。
- 既存のNatural Keyと数値/Pair/Modifier、ct / fa / ra の名称fallback、re / are のAffinity照合の回帰テストは従来どおり通る。

## Full validation

```powershell
npm run test
npm run typecheck
```

`contracts/card-search-query.md` と `data-model.md` の各ケースを、Parser → Builderの往復および既存のserver-side検索意味論を維持する代表ケースで確認する。Mock/Parameter data（`illustratorItems.json` を含む）の値長検証は、中央の `SHORT_UUID_LENGTH` を参照するテストで確認し、将来の桁数変更時に定義変更だけで失敗箇所が明確になることを確認する。
