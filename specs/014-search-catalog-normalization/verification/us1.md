# US1 検証記録

T003〜T013完了。shared型は両catalogをoptional/nullableとして欠測境界を表現し、正常入力string契約と区別した。

- T004: expected-catalog-results.jsonは受領JSONの直接includesと仕様から手で指定したliteralで固定。本番normalizer/matcherは使っていない。fixture A/Bのcatalogと表示語を分離。
- T005/T008: 固定vector213件（幅172・ASCII大文字26・代表境界15）。各期待変換と冪等性、網羅性を検証。
- T006/T007/T008実装前: us1-red.txt、exit 1。Unit27/API29失敗（API内3件は既存）。catalog-onlyの見逃し、表示語への誤hit、欠測・非同一視等のassertion失敗を確認。normalizer suiteは未作成moduleのimport解決失敗で、契約assertionの失敗とは別に扱う。Sandbox・依存設定による失敗なし。
- T009〜T011: 独立N₀、kw専用includes、factory、単一カードwrapper、searchCards/APIの走査前準備を実装。attはこの時点では旧経路のまま。Effect/分類/結果処理は保持。
- 最初の実装後確認us1-green.txtでは合計4失敗。新テストのfixture ID「A」がN₀でaとなりcatalog-only中にも存在するため、内部ID非代用の確認入力として不適切だった。専用テストのIDをcatalogにないUUIDへ修正し、実装は変更せず再確認。
- T012: full_text全482件は存在・非空string・N₀固定点PASS。T001の履歴・監査値を保持してimplementationVerificationへ追記。
- T013: us1-verified.txt、exit 1、395成功/3失敗（398）。新契約・vector・kw全ID/順序/件数はPASS。残る3件は承認済みの旧Feature 013 API effect_name差のみ。

実データではkw全角ラベル1件、スペル記号51件、攻撃力記号25件、＆13件、半角カナ3件、catalog読み3件、対象399件を全IDでUnit/API確認。旧表示連結と専用値では特にスペル記号・読み・対象の集合が変わる。これは意図した対象差。

command/exit codeはcheck-results.jsonと各txt参照。Story確認は全て--exclude '**/.memo/**'により本体のみ。元の対象指定との差は.memo複製を収集しないことだけで、設定は変更していない。最終回帰で複製を含む元の指定も実行する。baseline.jsonとT001/T002の既存ログは未変更。
