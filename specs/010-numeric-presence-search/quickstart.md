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

## 対象テスト

Builder、Parser、factory、UI、server matcher の既存テストを局所実行する。実装・Tasks はこの段階の対象外である。
