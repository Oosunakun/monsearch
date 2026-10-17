# 仕様品質チェックリスト: 検索結果のデック制限表示

**目的**: Human Decision反映後のArtifactの整合性を確認する
**更新日**: 2026-10-16
**Feature**: [spec.md](../spec.md)
**状態**: 2026-10-16 Spec / Plan統合Human Review完了、仕様・設計承認済み。実装検証は未完了。

## Human Intentとの整合

- [x] 唯一の入力をカード自身の `modification.deck_restriction_count` としている
- [x] 0・1・2のChip、3以上の数値保持と非表示を定義している
- [x] 値のnull・空文字、modification自体のnullの非表示とAPIでのnull正規化を定義している
- [x] 別JSONの参照・結合とreference_labelによるjoinを要求していない
- [x] modificationに開始日・終了日がないことを反映し、日付チェック・バイパス設定・日付別検証を要求していない
- [x] errata等の別領域の日付をmodificationの改訂日として流用していない
- [x] modification_textの解析・表示、解除フラグ・構築条件・カードプール・履歴の判定を対象外としている
- [x] PC・モバイルのヘッダー付近のChipと、既存Component・スタイルを維持する方針を定義している

## Artifactの整合と検証可能性

- [x] Spec / Plan / Research / Data Model / Contract / Quickstartで同じデータソース・値の意味・正規化・表示規則を定義している
- [x] API DTOを必須の `deck_restriction_count: number | null` の追加に統一している
- [x] 旧状態enum・ルール配列・期間・基準日・適用条件モデルを採用していない
- [x] Repositoryで確認した事実とHuman Decisionを区別している
- [x] 受け入れシナリオ・成功基準・検証手順が今回の表示要件に対応している
- [x] 根拠のない性能・利用者割合・判断時間の数値目標を設けていない
- [x] 実データにない3以上・値のnullを追加fixtureで確認する計画がある
- [x] 検索・sort・pagination・URL Queryへの影響がないことを確認する計画がある
- [x] 009のOpenAPIと実装の同期問題をScope外の観測事項として記録し、更新を今回の要求や前提条件にしていない
- [x] Feature 013内のContractを今回の内部API Responseの契約として維持している
- [x] 既存のNuxt内部APIを利用し、外部サービスとのサーバー間API通信・外部向けREST API整備を対象外としている

## レビュー・工程の状態

- [x] Spec / Plan統合Human Reviewが完了し、仕様・設計が承認されている

## Notes

旧チェックリストにあった期間・条件付き制限、不明状態、別一覧を正とする前提は撤回した。残る旧設計の記載はResearch等における撤回説明・対象外の明示のみ。

仕様・設計の承認は、Implementation・Verificationの完了を意味しない。追加の重要なHuman Decisionは現在なし。
