# 繰返し処理除去の証跡（T029、G4・SC-004）

2026-10-25。最終実装に対するUnit/APIと静的な呼出経路の確認。各実行command・exit codeはcheck-results.json、最終結果はregression-verified.txt。

## 最終の呼出経路

```text
既存Parser（入力表現維持、trim）
  → createCardSearchMatcher(criteria)
      有効keywordへN₀一回
      有効archetypeTextへN₀一回
      closureに照合値を保持
  → filter(predicate)
      full_text?.includes(keyword)
      archetype_text?.includes(archetypeText)
      既存他条件とのAND
  → sort → pagination → projection（API）
```

- search.ts:155〜157で両queryを準備し、162〜163で対象へ直接includesする。predicate内でN₀を呼ばない。
- search.ts:209のsearchCardsは走査前にfactoryを一回呼び、返されたpredicateをfilterへ渡す。
- cards.get.ts:31でfactoryを一回呼ぶ。getSourceCardsとsource.card参照より前に準備する。既存sourceIndex、filter/sort/paginate/projectと集計・エラー処理を保持する。
- matchesCardSearchは単一カード用wrapperとして互換動作を維持する。bulk経路からは反復呼出しない。

## 自動観測

| 対象 | 入力と観測点 | 実結果 |
|---|---|---|
| factory/predicate（Unit） | kwのみ・attのみ・併用・未指定・Parser後空。factory直後、search_support getter、100回のpredicate反復後をspy確認 | 有効な各queryが準備時一回。走査中の追加N₀ゼロ。未指定/空はゼロ |
| searchCards（Unit） | 0/1/7/101枚。filterの開始時点で両queryの引数と回数を確認 | カード数に依存せず、kw/attが各一回。空配列でも走査前準備だけ。追加呼出ゼロ |
| 実handler（API） | 0/1/7/101枚×上記5条件。getSourceCards、source.card getter、応答後でspy確認 | データ参照前に有効な各query一回。判定・結果処理中は追加ゼロ。空条件の変換ゼロ |
| 引数 | spyの全呼出を元の有効queryと完全一致比較 | 対象catalogはnormalizer引数に渡らない |
| wrapper/request | 単一カードwrapperとprepared matcherの結果、異なるqueryのclosureを交互に実行 | 互換動作・request間の独立性PASS。global query cacheなし |

## 対象全文の生成・再正規化を除いた証拠

- keywordVisibleText/keywordTextIncludesとarchetypeVisibleText/archetypeTextIncludesを削除した。表示名・ラベル・種族・カード種別等から対象を再連結する経路はない。
- 固定fixture Aの専用値だけの語がAに一致し、表示だけに同語があるBへ一致しない。全体の文字列化や表示値へのfallbackも否定する。
- 欠損相当undefined/null/空文字は非空queryに非ヒット。未正規化targetは検索時に補修しない。両catalogのUnit/API境界で確認した。
- kw/attのN₀と既存Effect正規化は独立する。元のnormalizeQdsText/normalizeEffectText/composeKanaMarks/textIncludesとその他helperの同一性はpreservation.jsonで確認した。
- T002 baselineの完全応答と、catalog付き独立oracleの全sort/perPage・全ページ比較により、結果処理を保持した。

以上によりFR-005/011・SC-004・G4はPASS。定量CPU、実機、ブラウザー速度、人間の手動動作は測定・実施していない。構造上の繰返し処理除去から、実行環境の性能適合や公開可否を保証しない。
