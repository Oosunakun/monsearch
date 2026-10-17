# Feature Specification: 検索結果のデック制限表示

**Feature**: `013-deck-restriction-display`
**作業ブランチ**: `feature/show-deck-restriction-count`
**作成日**: 2026-10-15 | **Human Review反映日**: 2026-10-16
**Status**: Approved（2026-10-16 Spec / Plan統合Human Review完了、仕様・設計承認済み）

**Input**: カード検索を利用するユーザーとして、検索結果一覧で各カードに記録されたデック枚数制限をChipで確認したい。`cards.json` の各カード自身の `modification.deck_restriction_count` を表示対象とする。

## User Scenarios & Testing

### User Story 1 - 検索結果で禁止・枚数制限のChipを確認する (Priority: P1)

カード検索を利用する人として、結果カードのヘッダー付近で「禁止」「1枚制限」「2枚制限」を確認したい。

**優先理由**: 各カードに記録された枚数制限を検索結果一覧で把握できる。

**独立した検証**: 下記の入力値を持つカードを検索結果に表示し、PC・モバイルで同じ表示規則になることを確認する。

**Acceptance Scenarios**:

1. **Given** カードの `modification.deck_restriction_count` が数値 `0`、**When** 結果カードを表示する、**Then** ヘッダー付近に「禁止」のChipが表示される。
2. **Given** 値が数値 `1` または `2`、**When** 結果カードを表示する、**Then** それぞれ「1枚制限」「2枚制限」のChipが表示される。
3. **Given** 値が `3` 以上、**When** 結果カードを表示する、**Then** Chipは表示されず、検索結果データには元の数値が保持される。
4. **Given** 値が `null` または空文字 `""`、あるいは `modification` 自体が `null`、**When** 結果カードを表示する、**Then** Chipは表示されない。
5. **Given** PCまたはモバイルで検索結果を表示する、**When** Chipを確認する、**Then** 対応するカードのヘッダー付近で文言を読め、既存のカード情報も確認できる。

### User Story 2 - 一覧を操作しても対応するカードの制限を確認する (Priority: P1)

カード検索を利用する人として、検索条件・表示順・ページを変更した後も、各カード自身に記録された枚数制限を確認したい。

**優先理由**: 既存の検索操作を維持し、別カードの制限を誤表示しないため。

**独立した検証**: 同じ検索条件・sort・paginationで追加前後の結果を比較し、カードとChipの対応を確認する。

**Acceptance Scenarios**:

1. **Given** 検索条件に一致するカードがある、**When** Chip表示を追加する、**Then** 対象カード、件数、カテゴリ別件数、並び順、ページ情報は変わらない。
2. **Given** 制限値の異なるカードがある、**When** 表示順やページを切り替える、**Then** 各カード自身の値に対応するChipだけが表示される。
3. **Given** 同名で制限値の異なるカードがある、**When** 両方を表示する、**Then** 名前や別一覧の照合を介さず、それぞれ自身の値に従う。
4. **Given** 検索結果が0件、**When** 一覧を表示する、**Then** 既存の0件表示を保ち、Chipは表示されない。

## Requirements

### Functional Requirements

- **FR-001**: データソースは `app/utils/mockData/items/cards.json` の各カード自身の `modification.deck_restriction_count` のみとする。`rule_restriction.json`・`restrictions.ts` の参照・結合および `reference_label` による別JSONとのjoinは行わない。
- **FR-002**: 数値 `0` は禁止を表し、「禁止」のChipを表示する。truthiness判定や空文字の数値変換によって `0` を欠落させたり生成したりしない。
- **FR-003**: 数値 `1` は「1枚制限」、数値 `2` は「2枚制限」のChipを表示する。
- **FR-004**: `3` 以上はChipを表示せず、元の数値を保持する。`null` や「無制限」へ置き換えない。
- **FR-005**: 値が `null`・空文字の場合、および `modification: null` の場合はChipを表示しない。「不明」「無制限」などの代替状態表示も追加しない。
- **FR-006**: 日付チェックおよびそのバイパス設定は実装しない。
- **FR-007**: `modification_text` の解析・表示、`is_deck_restriction_lifted` による制御、カードプール・デック構築条件・改訂履歴の判定は行わない。
- **FR-008**: 検索結果一覧のカードヘッダー付近にChipを配置し、PC・モバイルに対応する。既存Component・スタイルをなるべく維持し、必要なら小さな専用Componentに分離する。詳細なデザインはImplementation後のHuman Verificationで調整する。
- **FR-009**: APIは検索結果の各カードに必須の `deck_restriction_count: number | null` を提供する。数値はそのまま保持し、空文字・値の `null`・`modification: null` は `null` に正規化する。複雑な状態・ルール配列・期間・基準日・適用条件のDTOは追加しない。
- **FR-010**: 検索条件・sort・pagination・URL Query、および結果カード・件数・カテゴリ別件数・順序に影響させない。ページ・表示順変更後も各カードと値の対応を維持する。

### Key Entities

- **検索結果カード**: 検索・sort・pagination後に返されるカード。自分自身の改訂情報から枚数制限値を取得する。
- **カードの改訂情報 (`Card.modification`)**: 今回は枚数制限値のみを利用するnullableな情報。
- **枚数制限値 / Chip**: APIでは数値または `null`。UIは `0`・`1`・`2` に対応するChipだけを表示する。

## Success Criteria

- **SC-001**: `0`・`1`・`2` の各ケースで、対応するカードに「禁止」「1枚制限」「2枚制限」が表示される。
- **SC-002**: `3` 以上、値の `null`・空文字、`modification: null` の各ケースでChipが表示されず、APIでは数値保持・null正規化が契約どおりである。
- **SC-003**: PC・モバイルの両方でヘッダー付近のChipと既存カード情報を読める。細かな配置・配色等はHuman Verificationで確認する。
- **SC-004**: 同じ入力に対する検索対象・件数・カテゴリ別件数・順序・ページ情報が追加前後で一致し、表示順・ページ変更後もカードとChipの対応が一致する。

## 前提と対象外

数値の意味と表示対象はHuman Decisionによる。現行ルールの適用可否・デックの合法性を判定するFeatureではない。制限値による検索・sort、ルール説明画面の変更、データ更新、DB変更は対象外。

既存のNuxt内部API `/api/cards` を利用する。今回の内部API Responseの契約はFeature 013内の `contracts/card-search-result.md` に記録し、009のOpenAPI同期、外部サービスとのサーバー間API通信、外部向けREST APIの整備は対象外とする。
