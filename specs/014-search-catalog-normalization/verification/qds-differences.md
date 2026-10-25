# 正式QDSと承認済み初期版の差異（T028）

2026-10-25。覚書§5・H1〜H10に従った実装確認記録。新たなDecisionは作成せず、正式QDS v1.1.0とD22/D23等の履歴は未変更。

| 項目 | 正式QDSに対する初期版の位置づけ | 実装・検証 |
|---|---|---|
| kw/att対象 | full_text/archetype_textだけ。表示情報の検索時連結は廃止 | search.tsのprepared matcherと固定oracle。H5/H6/H7 |
| 正規化配置 | D23の比較時両側正規化に対し、対象は提供時点でN₀済みという暫定例外 | 受領各482件の固定点PASS。検索語だけを走査前に一回変換。未正規化targetは非補修。H4/H5/H6/H7 |
| kw/attのカナ合成 | N₀では合成を省略。ｶﾞ→カ＋U+3099、ﾊﾟ→ハ＋U+309Aをガ/パと区別する暫定例外 | 固定vector・両catalogのUnit/API境界。H9 |
| nm/rl | 既存textIncludesのtoLocaleLowerCaseを維持。幅・カナを揃える正式QDSには未対応のまま | 関数は変更なし。nm/rl回帰・T002 baseline一致。H2 |
| etx | 既存normalizeQdsTextの両側正規化とカナ合成を維持。本文のみ・同一Effect条件も維持 | 元のhelper群が変更前と同一であることをpreservation.jsonに記録。既存＋補完回帰。H3 |
| 原文・入力・URL | 照合用N₀を書き戻さない。既存Parser/Builderの前後trimは保持 | criteria/カード不変、URL round trip、完全投影比較。H1/H6 |
| その他 | literal・内部空白・非同一視・既存Token分類・結果処理を維持 | 固定ID・境界・全ページ・構造検証。H8/H9 |

H4/H8に従い、検証はRepositoryの受領JSONとUnit/API・既存フォーム/ページ回帰で完結させた。提供工程への追加作業や証跡Gateはない。H10に従い、新しいpackage・cache・索引・永続モデルは追加していない。構造確認をCPU・実機・ブラウザー性能の測定結果とは扱わない。

preservation.jsonでcards.json、正式QDSを含むdocs/architecture、仕様・Plan・契約・quickstart、T002 baseline等の差分なしを確認した。上記は承認済みの暫定例外であり、今回のPlanからの新たな設計逸脱ではない。
