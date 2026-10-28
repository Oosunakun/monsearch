# US3 検証記録

T019〜T026完了。us3-targeted.txt→catalog付きsort matrixを補完→us3-final.txtで確認。実装変更を必要とする構造不具合はなかった（T025）。

## 呼出構造（T019/T020）

Unit: kwのみ/attのみ/併用/未指定/Parser後空の5条件でfactory直後のnormalizer引数・回数をspy確認し、同一predicateを100回実行して追加変換ゼロ。カードのsearch_support getterでも呼出履歴を検証。searchCardsは0/1/7/101枚でfilter開始時に各query一回だけ準備済みであることを確認。単一カードwrapper、request間のclosure独立性も確認。

API: 0/1/7/101枚×5条件の20ケースで、実handlerのgetSourceCardsと各source.card getterの時点でnormalizerの引数・回数を確認。判定・sort・projection後も追加呼出ゼロ。targetを引数に渡さず、空配列でも走査前準備だけを行う。欠測/表示非代用/未正規化target境界はUS1/US2で別途確認。

## 保持・既存回帰（T021〜T024）

- Parserは末尾値選択と前後trimのみ、Builderはkw/attの全角・大小・半角濁点列・内部空白・改行・タブの表現をURL encode/decode round tripで保持。入力SearchFormは不変。
- T002承認済みbaseline38ケースを新結果で上書きせず、Unitの全ID・入力順、criteria/原文不変を比較。APIは全371ページと114境界の完全応答を復元比較し、保存hash/応答項目/全ID順も一致。全sort key/方向、perPage20/50/100、集計・ページ数を含む。
- catalog付きkw399件を固定oracleで絞り、T002の固定投影値とsourceIndexだけから期待順・集計を独立計算。id/rarity/atk×asc/desc×20/50/100の18ケースで全ページ・全ID・原文投影を比較。本番matcher/sort関数で期待値を作らない。
- kw/att AND、数値・枠・コストAND、同名別カード、nm/rlの既存小文字化と幅非同一視、etxの本文のみ/カナ合成/同一Effect条件を保持。
- is_token優先のToken分類をUnit/APIで確認。categoryBreakdownは従来の元categoryを使うこと、公開DTOへcatalogを出さないこと、CARD_SEARCH_FAILEDを維持することも確認。
- フォーム状態・URL復元/遷移は既存useCardSearchForm.test.tsとapp/pages/cards/search.test.tsを含めて実行。

## 結果

us3-final.txt、exit 1。 Test Files  1 failed | 15 passed (16)
      Tests  3 failed | 733 passed (736)。FAILは既存API effect_name差の3件だけ。新規不具合なし。

本体確認は--exclude '**/.memo/**'を使用し、既存設定は変更していない。複製込みの元対象指定は最終品質記録で分けて示す。command/exit codeはcheck-results.json。

## 最終品質検証での追記

追加fixtureの省略値がundefinedと推論される型エラーとbaselineページunionのnarrowingをテスト側の境界で修正した。本番Parserは変更せず、最終typecheckはPASS。修正後にregression-verified.txtで複製込みの元対象を再実行し、932成功/16失敗（本体既存3、複製既存12＋旧helper名の構造期待1）を確認した。本体旧null full_textテスト1件は新契約へ置換済みで、差分はfinal-failures.jsonへ保存。
