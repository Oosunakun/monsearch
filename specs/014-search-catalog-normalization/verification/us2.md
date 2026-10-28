# US2 検証記録

T014〜T018完了。

- T014/T015: att専用値、表示種族・種別への非fallback、欠測38境界、文字幅・ASCII大小、literal、非同一視、カナ非合成、未正規化target非補修、kw/att/他条件AND、Quick Searchのrace-type→attを追加。
- 実装前us2-red.txt: exit 1、215成功/57失敗（Unit28/API29、うち既存API3）。fixture Aではなく表示だけのBを返す誤りなどの通常assertion失敗を確認。環境エラーなし。
- T016: factoryでattも一度だけN₀変換し、archetype_textへ直接includes。旧archetypeVisibleText/照合helperを削除。kw/他条件/Effect/Token/API処理は保持。
- T017: archetype_text全482件は存在・非空string・N₀固定点PASS。data-audit.jsonへ実装後確認を追記。元のT001監査・履歴を保持。
- T018: us2-verified.txt、exit 1。 Test Files  1 failed | 2 passed (3)
      Tests  3 failed | 485 passed (488)。新契約は全てPASS、既存API effect_name差3件のみ残る。US1のvectorとkw回帰も含む。

実データattドラゴン53件・サモナー10件・kw対象との併用47件の固定全IDをUnit/API全ページで検証。ＤＲＡＧＯＮは実データで0件であり陽性検証とは扱わない。英字幅・大小の陽性は専用fixtureで確認する。kwの399件、attの53件とも先頭20件だけでなく全ページを巡回する。

--exclude '**/.memo/**'で本体に限定した。設定変更なし。command/exit codeはcheck-results.json。正常入力契約と欠測fixture、旧対象との差と既存失敗を区別。baseline.jsonは未変更。
