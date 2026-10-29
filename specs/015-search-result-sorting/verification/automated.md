# 自動検証

- 既存sortテスト: 4件通過（終了code 0）。
- US1 RED: 3ファイル、121失敗・282通過（終了code 1）。手書き合成契約の数値group/欠損と、新キー補正で意図した失敗を確認。
- テスト実装中に期待値helperの不正page補正と変数scopeを修正。これらは本体不具合として扱わない。
- US1 GREEN: 3ファイル、403件通過（終了code 0）。6キー×2方向、20/50/100全ページ・clamp・0/1件、独立固定ID順・完全DTO・分類集計・API/CSR parity。id/rarity等の旧hash照合を保持、atk6ケースは015固定順＋014 DTO/集計へ移行。旧API fixtureのatkも同様に移行し、fixture自体は保全。
- composable: 16件通過（最初のUIとの合同実行、ui.logは後続更新）。既存ready/query/retry/世代/unmount回帰、6キー・方向・page reset・個別補正。実loaderとfetch spyを用い、sort/page/perPage変更中JSON通信1回のみ、$fetch呼出0を確認。
- UI: 実ResultDisplaySettings/Desktop/Mobileと実Vuetifyをmount。happy-domのvisualViewportのみ補完。Vuetify useActivatorの50ms reopenLockを待機し、実DOMクリック/mousedownで操作する。
- Lint: 終了code 0（重複importを修正後）。
- Typecheck: 終了code 0（数値参照の型絞り込みを修正後）。

既存のuseLayout重複auto-import警告と、fragment rootへのclass継承警告は本Featureで変更していない。最終focused/full結果は追記する。

## 最終結果

- 最終focused: 5ファイル・423件通過、終了code 0。後続の4数値キー全件欠損/装備品同値テストも含む全体テストで再検証。
- 全体 `npm run test -- --run`: 28ファイル・1,019件通過、終了code 0（full-test.log）。
- 完了範囲: US1/US2/US3の自動受入。PC/モバイルで実controls・Vuetifyの項目/方向/件数選択、適用、ページ移動、選択状態とCSR結果を照合。全キーでpage resetと設定保持を検証。
- 静的HTTP観測: /cards=200、/data/cards.json=200・no-cache・2,283,572 bytes、/api/cards=404。
- `git -c core.whitespace=cr-at-eol diff --check`: 終了code 0。既存VueファイルのCRLFを維持。
- 最終Lint/Typecheck再実行も終了code 0。独立oracle script・static audit scriptを含む最終時点を検証。
- 実データbucket確認: level=unit335/なし147、atk・defense=unit335/equip9/なし138、initiative=unit92/equip4/なし386。bucket内収録順と数値キーを独立に確認し、NULLを0へ統合していない。
- 最後にUIの両方の無効値補正表示を追加し、ResultList.test.tsを再実行: 4件通過・終了code 0（ui-final.log）。同ファイルのESLintも終了code 0。
