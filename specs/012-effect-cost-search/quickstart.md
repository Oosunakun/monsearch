# Quickstart: 効果コスト検索の検証

## 前提

- Repositoryルートで依存関係をinstall済み。
- distinctなCost TextのMapping、人手レビュー、未Mapping検出付き`search_cost`生成、および変換後JSONのレビューはFeature開始前に完了しており、QDS §7.5の公開前提を満たしている。

## 検証手順

1. `npm run test -- server/utils/cardSearch/search.test.ts`を実行する。
2. コストデータのfixtureを用いてItem、Spell、Otherの各Pairについて一致・不一致と数量境界を確認する。
3. 同じテスト群で`or`/`and`、複数alternative、同一Effect内の複数cost class、異なるEffectへの分散、`none`、Effectなし、確定cost-free、unknown/missing、`has_other_cost`を確認する。
4. `spell:any`のrange/capacityを確認する。任意Spell枠1～3は`fire:2,water:1&and`に一致し、`fire:2,water:2&and`には一致しないこと、同じcapacityを二重充当しないことを確認する。exactは要求数量以上、rangeは許可範囲内の支払可能値が要求数量以上の場合に一致する。
5. `npm run test -- app/utils/search/cardSearchQueryBuilder.test.ts app/utils/search/cardSearchQueryParser.test.ts`で各alias、Modifier、Pair collectionのcanonical build/parse round tripを確認する。`none`はModifierだけで往復する。
6. `npm run test -- server/api/cards.get.test.ts`でAPIと同じURL parse・matcher境界に条件が届き、検索結果が絞り込まれることを確認する。
7. 検証済みデータを使い詳細検索画面または`/api/cards`へ条件付き検索を行い、URL条件が復元され、結果がQDS例に一致することを確認する。

## 期待結果

- 選択肢またはEffectをまたいだ集約はなく、条件を実際に支払える同一Effectが結果を決める。
- URLはQuery Specificationのaliasとcanonical表現を保つ。
- `search_cost`のSpell `value: "any"`は内部capacityとして扱い、URL Pair valueとして出力しない。

詳細な型と条件範囲は[データモデル](data-model.md)、URL/API外部境界は[契約](contracts/effect-cost-search.md)を参照。
