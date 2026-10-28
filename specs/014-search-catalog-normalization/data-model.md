# データモデル: Search Catalog Normalization

## 1. 入力catalogとSearchSupport

入力の正本はapp/utils/mockData/items/cards.json。同じCard内のcard_idに属する既存の埋め込み値を使い、新しい永続entityは追加しない。

| フィールド | TypeScript上の境界型 | 正常入力・意味 |
|---|---|---|
| full_text | string / null / undefined | N₀適用済みstring。kwだけの対象 |
| archetype_text | string / null / undefined | N₀適用済みstring。attだけの対象 |
| is_token | boolean | 既存値・型・Token分類を維持。変更対象外 |

専用値の型は`?: string | null`で表す。正常入力契約のstringと、欠測境界を表現する型を区別する。空文字は非空条件に非ヒット。null等をString(value)で文字列化せず、未正規化値を検索時に補修しない。追加Runtime全件検査は設けない。

現行482件の両専用値は受領済みで、存在・string型・固定点の事前検証はPASS。表示原文と独立した値で、CardSearchResultItemへ追加しない。FinderCards.versionは変更しない。

## 2. N₀

`normalizeCatalogText(value: string): string`は純粋関数とし、元文字列を変更しない。

| 入力範囲 | 変換 |
|---|---|
| U+FF01〜U+FF5E | code pointから0xFEE0を減算 |
| U+3000 | U+0020 |
| U+FF61〜U+FF9F | QDS対応表。末尾2文字はU+3099 / U+309A |
| U+FFE0〜U+FFE6 | ¢ £ ¬ ¯ ¦ ¥ ₩ |
| U+FFE8〜U+FFEE | │ ← ↑ → ↓ ■ ○ |
| 幅変換後のU+0041〜U+005A | U+0061〜U+007A |
| その他 | 保持 |

不変条件はN₀(N₀(x)) = N₀(x)。全体NFC / NFKC、カナ合成、汎用case conversion、trim、内部空白・改行・タブの圧縮や置換、単語分割をしない。

ｶﾞ→カ＋U+3099、ﾊﾟ→ハ＋U+309Aで、ガ・パとは区別する。①≠1、Ⅰ≠I、あ≠ア、〜≠～、ー≠-、‐≠-、−≠-を維持する。既存etxのnormalizeQdsTextはこの関数と別に維持する。

## 3. 検索条件とprepared matcher

| 条件 | 元の保持値 | 照合用値 |
|---|---|---|
| kw | SearchForm.keyword | N₀(criteria.keyword) |
| att | SearchForm.archetypeText | N₀(criteria.archetypeText) |

既存Parserの前後trim後にfactoryへ渡す。有効な各検索語をカード走査前に一度だけ準備し、元のSearchForm・URL・表示値へ書き戻さない。未指定・空の条件はskipする。

```text
UI/URL → 既存Parser（trim）→ SearchForm
    → createCardSearchMatcher（有効なkw/attへ各1回N₀）
    → 各Cardの専用値へliteral includes（対象の変換なし）
    → 他条件とのAND → sort → pagination → projection
```

空条件はtrue、非空条件＋欠測はfalse。kw・att・他条件はAND。is_tokenを使う既存分類は変更しない。prepared matcherは一回の同期走査内でcriteriaを変更しない前提で使い、別requestのqueryをglobalへ保持しない。

## 4. Repository内の固定vector

normalizeCatalogText.fixtures.jsonはUnit Test専用の固定期待値として扱う。

| フィールド | 型 | 意味 |
|---|---|---|
| id | string | 安定した確認例の識別子 |
| input | string | 変換前文字列 |
| expected | string | QDS / 覚書から定めた固定期待文字列 |

指定幅対応172文字、ASCII大文字26文字、複合・非同一視・内部空白・冪等性・境界を含める。改行・タブ・結合記号はescape表記で識別する。期待値をテスト対象normalizerから計算しない。他工程の結果との照合や共有を完了条件にしない。

## 5. 受入記録

承認後の実装工程でverification/へ保存する。[受入契約](contracts/acceptance-evidence.md)に従う。

| 記録 | 内容 |
|---|---|
| 入力確認 | Repository内JSONのpath・version・件数・専用値の状態・固定点。再現用hashは必要に応じ記録 |
| N₀ / 正しさ | 固定vector、独立した期待ID集合、Unit/APIの結果 |
| 回帰 | catalog条件なしbaseline、Token分類、既存失敗・新規差分、原文・URL・API契約 |
| 構造 | 各queryの準備時1回・走査中0回、対象全文生成・再正規化なし |
| Review | 自動確認の結果とHuman Review状態 |

事前のデータPASSと、実装・自動テストの実結果を区別する。記録は検証工程用で、アプリに状態機械を追加しない。定量性能・実機・ブラウザー・人間の実動作確認の証跡は必須項目にしない。
