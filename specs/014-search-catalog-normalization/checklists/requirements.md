# 仕様品質チェックリスト: Search Catalog Normalization

**目的**: Human Decision反映後の仕様・設計資料の静的整合性確認。

**作成日**: 2026-10-24 | **更新日**: 2026-10-25

**対象**: [spec.md](../spec.md)、[plan.md](../plan.md)、[覚書](../../../docs/architecture/query_search_normalization_memo.md)

チェックは文書品質のみを表す。実装承認や自動テストの実結果とは区別する。

## 内容と入力境界

- [x] 覚書H1〜H10のIDと実装に必要な意味を維持している
- [x] cards.jsonを入力の正本とし、両catalogの受領・事前PASSを反映している
- [x] 提供工程の固有実装・担当・手順・履歴を作業依存にしていない
- [x] 機能要件と具体的な設計・検証手順を各資料に分離している

## 要件の完全性

- [x] kwはfull_textのみ、attはarchetype_textのみを対象とする
- [x] N₀の全幅対応・ASCII小文字化・カナ合成省略・非同一視が維持されている
- [x] 内部空白・改行・タブと、入力・URL・表示原文の保持を明記している
- [x] nm / rl / etx・normalizeQdsTextが変更対象外である
- [x] is_tokenと既存Token分類が変更対象外である
- [x] 不正値を補修・再正規化・fallbackしない契約が一貫している
- [x] 固定テストベクトル・冪等性・独立期待ID集合を維持している
- [x] FR・SC・Plan・Contracts・Quickstartに未決定事項や外部必須Gateが残っていない

## 完了条件とReview Gate

- [x] FR-005/011・SC-004が全文加工ゼロ・走査前各query1回の構造要件を定めている
- [x] G1〜G4のFeature固有確認はRepository入力・TypeScript検索・Unit/API Testに完結し、既存フォーム／検索ページ回帰と通常のlint・typecheck・buildも維持している
- [x] 定量CPU改善・実機・ブラウザー速度・人間の実動作確認を必須Gateにしていない
- [x] Human Review承認前に実装しない原則を維持し、承認後の工程を妨げる時点依存の実行禁止指示がない

## 要件・検証対応

| 要件 | 対応する確認 |
|---|---|
| FR-001/002/006 | ストーリー1/2、SC-002、検索契約、G2 |
| FR-003/004/010 | SC-001、固定vector・冪等性・Repository入力、G1/G2 |
| FR-005/011 | ストーリー3、SC-004、prepared matcher、G4 |
| FR-007/008/009 | SC-003、原文・URL・既存検索・Token分類、G3 |
| FR-012 | 覚書§5、spec前提、正式QDSとの差異の明示 |

## 検証記録

2026-10-25の資料整理に対する静的チェック。元のCPU数値基準・提供工程証跡Gateを撤回し、Repository内自動検証と構造要件へ整合させた。

**2026-10-25の確認履歴**: 事前のデータ検証PASSは受領済み入力についての結果。この資料整理時点では実装・Unit Test・API Testは未実施であり、成功扱いしていない。新たな未決定事項はない。本履歴は承認後の実装・検証を禁止する指示ではない。
