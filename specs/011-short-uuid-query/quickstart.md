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
- master dataにない有効値は削除されず、検索結果を0件へ絞る。
- 同一Parameter内の複数値は既存ORを保つ。
- 既存のNatural Keyと数値/Pair/Modifierの回帰テストは従来どおり通る。

## Full validation

```powershell
npm run test
npm run typecheck
```

`contracts/card-search-query.md` と `data-model.md` の各ケースを、Parser → Builderの往復および `searchCards` の代表カードで確認する。Mock/Parameter dataの値長検証は、中央の `SHORT_UUID_LENGTH` を参照するテストで確認し、将来の桁数変更時に定義変更だけで失敗箇所が明確になることを確認する。
