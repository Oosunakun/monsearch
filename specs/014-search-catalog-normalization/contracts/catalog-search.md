# catalog検索契約

## 適用範囲と入力

既存GET /api/cardsと/cardsのkw・attに適用する。新endpoint・UI・aliasを追加せず、URL構文・レスポンス形式を維持する。入力の正本はRepository内のcards.jsonで、両専用値は提供時点でN₀適用済みstringとする。

| alias | SearchForm | 唯一の検索対象 |
|---|---|---|
| kw | keyword | search_support.full_text |
| att | archetypeText | search_support.archetype_text |

正式QDSに対する暫定例外は、対象が事前にN₀済みであることとカナ合成省略。提供工程の内部構造・実装・履歴の確認を依存にしない。

## 照合条件

既存Parser後の有効な各検索語へ、カード走査前にN₀を一度適用する。対象へ直接includesし、対象の全文生成・正規化・補修はしない。

| 条件 | 対象 | 結果 |
|---|---|---|
| 未指定／Parser後空 | 任意 | 条件skip |
| 非空 | 欠損／null／空文字 | 非ヒット |
| 非空 | 非空文字列 | target.includes(N₀(query)) |
| kw・att併用 | 両専用値 | 両条件を満たすCardだけ |

欠測の照合境界は、正常な提供値がstringである入力契約と区別する。不正値をString(value)・空文字・他項目で補わず、未正規化値を再正規化しない。追加Runtime全件検査は導入しない。

内部複数空白・改行・タブを保持する。query全体が一つのliteralであり、*・+・括弧・[等を演算子にしない。前後trimと複数query値の選択は既存Parser/Builderに従う。

## 文字変換と非同一視

| 入力 | N₀後 |
|---|---|
| Ｍ２０Ａ－００１ | m20a-001 |
| AＢC | abc |
| スペル：＊ | スペル:* |
| 攻撃力：＋2 | 攻撃力:+2 |
| リブ＆ラブ | リブ&ラブ |
| ｱｰﾆｬ | アーニャ |
| ｶﾞ / ﾊﾟ | カ＋U+3099 / ハ＋U+309A。ガ / パとは区別 |
| ～ / 〜 | ~ / 〜 |
| ￣ | ¯（U+00AF）。追加分解なし |
| AN\nALL | an\nall（\nは実際の改行） |

①≠1、Ⅰ≠I、あ≠ア、ー≠-、‐≠-、−≠-、非ASCII大小の区別を保つ。全範囲は[data-model.md](../data-model.md)と覚書§3を参照。全体NFC/NFKC、casefold、空白圧縮をしない。

## 他条件・分類・表示

- nm / rlの既存toLocaleLowerCase比較を維持する。
- etxのeffects.effect_text対象、既存normalizeQdsText・カナ合成・同一Effect条件を維持する。
- effect_nameを独立検索条件にしない。catalogに実際に含まれる語だけを照合する。
- search_support.is_tokenの型・値・既存Token分類を変更しない。
- 入力・URL・表示原文をN₀で書き換えない。既存前後trim以外の照合用変換を書き戻さない。
- 他条件とのAND、件数、categoryBreakdown、sort、pagination、projection、エラー契約を維持する。専用値を公開DTOへ追加しない。

## 内部呼出境界と構造要件

```typescript
normalizeCatalogText(value: string): string
createCardSearchMatcher(criteria: SearchForm): (card: Card) => boolean
matchesCardSearch(card: Card, criteria: SearchForm): boolean
searchCards(cards: readonly Card[], criteria: SearchForm): Card[]
```

APIとsearchCardsは各走査に一つのprepared matcherを使う。有効なkw・attごとに準備時1回、predicateのカード走査中は追加のN₀呼出0回。単一カード用wrapperをfilter内で呼び直さない。対象全文生成・対象再正規化も0回とする。sourceIndexと既存結果処理順を維持する。

## 独立した固定oracle

fixture Aのcatalogだけにcatalog-only / archetype-onlyを、fixture Bの表示名・種族・カード種別だけに同語を置く。kw・att・ANDはAだけを返す。Aの対象を欠損・null・空文字にすると非ヒット。期待IDはfixture定義で固定し、本番matcherから逆算しない。

未正規化catalogの境界fixtureで検索側が補修しないことも確認する。実データの期待集合は入力を識別して固定し、件数や先頭ページだけで全ID集合一致の代用をしない。旧連結対象の全結果維持は要求しない。
