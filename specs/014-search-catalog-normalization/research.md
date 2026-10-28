# 調査結果: Search Catalog Normalization

**日付**: 2026-10-25

**状態**: Human Decision反映済みの設計資料。受領catalogの事前検証はPASS。実装は仕様・PlanのHuman Review承認後に行う。

## 1. 検索専用値の選択

**Decision**: cards.jsonを入力の正本とし、kwはsearch_support.full_text、attはsearch_support.archetype_textだけを検索する。

**Rationale**: 現行search.tsはkeywordVisibleTextで表示情報を、archetypeVisibleTextで種族・カード種別を連結する。これはFR-001/002の専用値だけを検索する契約と異なる。両値は受領済みであり、dataSource.tsは静的JSON読取とsourceIndex付与のまま維持する。

**Alternatives considered**: 表示値とのOR、欠損時fallback、JSON.stringify、起動時・request時の再連結は不採用。対象の再正規化もしない。

## 2. N₀の実装境界

**Decision**: server検索utilityに独立した純粋関数normalizeCatalogTextを置く。etxのnormalizeQdsTextは変更しない。

**Rationale**: 覚書§3のN₀はQDSの限定幅変換＋ASCII小文字化で、カナ合成だけを省略する。共通関数の置換はetxの挙動を変える。期待値は仕様から固定し、実装自身から生成しない。

全角ASCII94文字、半角カナ等63文字、全角空白1文字、その他幅対応14文字の計172文字、およびASCII大文字26文字を全数確認する。U+FF60 / FFA0 / FFE7 / FFEF、非ASCII大小、supplementary code pointの保持も扱う。U+FFE3→U+00AFをさらに分解しない。

**Alternatives considered**: NFKC、全体NFC、casefold、汎用小文字化、既存Effect正規化への共通化リファクタリングは不採用。

## 3. 検索語を準備する位置

**Decision**: createCardSearchMatcher(criteria)で有効なkw・att各検索語を一度準備し、searchCardsとAPIの走査前にfactoryを一回だけ呼ぶ。matchesCardSearchは単一カード用wrapperとして残す。

**Rationale**: カード判定内でN₀を呼ぶと件数分の変換が残る。closure内の準備値ならカード走査中はtarget.includesのみで、SearchForm・URLを変更しない。

**Alternatives considered**: Parser/Builderでの照合用変換、SearchFormの書換え、global cache、別index、filter後の処理順変更は不要。

## 4. 型・欠測・Token分類

**Decision**: SearchSupportのfull_textとarchetype_textをoptionalかつnullableな文字列として表す。正常入力はN₀済みstringとする。欠損・null・空文字に非空条件は一致しない。

**Rationale**: 現型はarchetype_textを表せず、仕様上の欠測境界も明示したい。nullable型は正常入力を欠測可として受領する意味ではない。String(value)、空文字補完、再正規化で修復せず、追加Runtime全件検査も導入しない。

is_tokenのboolean型・値と既存Token分類は変更しない。専用値を公開DTOへ追加しない。

## 5. 受領入力の確認範囲

**Decision**: 入力契約の検証はRepository内のcards.jsonと固定vectorで完結する。入力提供工程の内部構造・実装・管理履歴・検証証跡は要求しない。

**確認済み状態**: Codexの事前検証で、現行482件の両専用値の存在・string型・N₀固定点はPASS。再度の提供待ち・出所確認待ちを切替前提にしない。2026-10-25の資料整理ではデータ再検証を実施していない。

実装後はRepository内のUnit Testで入力契約と固定点を確認する。異常があっても照合時に補修しない。入力識別と自動検証結果は[受入契約G1](contracts/acceptance-evidence.md)に従い、提供工程の作業へ展開しない。

## 6. 回帰のoracle

**Decision**: 新catalog対象の固定期待ID集合と、catalog条件なしの既存回帰を分離する。

**Rationale**: search.test.tsのcatalog無視・旧連結値依存の期待を置き換える。同じmatcherで期待IDを作って自己比較するだけでは誤りを見逃すため、手で対象を定めたfixtureと固定ID集合を使う。

実データの確認も件数だけでなくID集合を比較する。旧連結対象と新catalogの全結果一致は要求しない。既存失敗は同じ入力の事前baselineと照合し、新規不具合と分け、無関係な期待値更新で隠さない。

## 7. 性能改善の受入方法

**Decision**: FR-005/011・SC-004の構造要件をUnit/API Testで検証する。CPU時間や画面表示時間の数値基準を必須にしない。

**Rationale**: 繰返し処理を除去すること自体は、query N₀の走査前各1回、カード走査中の追加変換ゼロ、対象全文生成・対象再正規化なしとして検証できる。catalogだけの語、未正規化catalogを補修しないfixture、呼出回数確認を組み合わせる。

CPU反復測定、中央値改善、実機測定、ブラウザー速度、人間による実動作確認は完了Gateから除外する。未実施を測定済みとせず、その欠測だけでImplementationを未完了にしない。構造上の改善と実行環境の性能適合保証は別である。

## 8. 設計状態とReview Gate

設計上の未決事項・外部作業依存はない。必要な入力は受領済み。実装・Repository内の検証は承認された仕様・Planに従い、実際の結果を記録する。

仕様・PlanのHuman Review承認前に実装しない。文書品質の確認と実装・検証結果は区別する。
