# Feature Specification: 数値能力 Modifier 整合

**Feature Branch**: `010-numeric-presence-search`

**Created**: 2026-09-20

**Status**: Draft

## 目的

既存の `filterType: all | include | exclude` を維持したまま、`initiative` と `additionalInitiative` に Modifier を追加する。また、既存の数値存在性 Modifier の意味、URL canonicalization、詳細検索画面、server search を Query Data Specification に整合させる。

新しい `presence` 型、全数値能力共通の新規 presence alias、数値能力や比較演算子の追加は行わない。

## 対象範囲

存在性 Modifier の対象は `initiative`、`charge`、`defender`、`additionalInitiative`、`additionalCharge`、`additionalDefender`、`heroPoint` とする。`level` は既存 Modifier を維持するが、`is_instant_summon` と Level Comparison が独立する例外として扱う。

`attack`、`defense`、`additionalAttack`、`additionalDefense`、`limit` には新しい Modifier または Alias を追加しない。

## User Scenarios & Testing

### User Story 1 - 値の有無で検索する (Priority: P1)

利用者として、対象能力について値を持つカード、値を持たないカード、または値の有無を問わないカードを検索したい。`0` は値あり、`NULL` は値なしとして区別する。

**Independent Test**: 値が `0`、正数、負数、`NULL` の代表カードを使い、`all`、`include`、`exclude` を単独指定した結果を確認する。

**Acceptance Scenarios**:

1. **Given** `initiative.filterType=include`、**When** 検索する、**Then** initiative が `0` を含む非 NULL 数値のカードだけが一致する。
2. **Given** `charge.filterType=exclude`、**When** 検索する、**Then** charge が NULL のカードだけが一致する。
3. **Given** Modifier が `all`、**When** 検索する、**Then** 値の有無では絞り込まず、Comparison があれば通常の数値比較だけを適用する。

### User Story 2 - Modifier と Comparison を組み合わせる (Priority: P1)

利用者として、`include` と Comparison を組み合わせて値ありかつ比較条件を満たすカードを検索したい。`exclude` では内部に Comparison が残っていても、検索評価では Comparison を使用しない。

**Independent Test**: `include + gte:0`、`exclude + gte:2`、Comparison のみを各対象能力で評価する。

**Acceptance Scenarios**:

1. **Given** `chm=include&ch=gte:0`、**When** 検索する、**Then** 値ありかつ 0 以上のカードだけが一致する。
2. **Given** `chm=exclude&ch=gte:2`、**When** 検索する、**Then** 値なしだけを評価し、`gte:2` は検索条件に使用しない。
3. **Given** `lvm=exclude&lv=gte:2`、**When** 検索する、**Then** `is_instant_summon` と Level Comparison の両方を評価する。

### User Story 3 - URL と詳細検索を往復する (Priority: P1)

利用者として、Modifier と Comparison を含む URL を再読み込み・共有・詳細検索編集しても、検索の意味を失わずに再利用したい。

**Independent Test**: `itm` / `it`、`aitm` / `ait`、既存 Modifier の単独・併用・Comparison 付き URL を Parser → SearchForm → Builder で往復する。

**Acceptance Scenarios**:

1. **Given** `itm=include&it=gte:0`、**When** 詳細検索を開く、**Then** Modifier と Comparison が復元される。
2. **Given** `chm=exclude&ch=gte:2`、**When** 詳細検索を開いて再検索する、**Then** Form には Parser が Comparison を復元でき、Builder の URL は `chm=exclude` のみになる。
3. **Given** `aitm=include`、**When** 再検索する、**Then** URL は `aitm=include` となり、`ait=...` は生成されない。

## Functional Requirements

- **FR-001**: `initiative.filterType` と `additionalInitiative.filterType` を追加し、既存の `all | include | exclude` を使用しなければならない。
- **FR-002**: 新規 Alias は `itm` と `aitm` のみとし、canonical order はそれぞれ `itm → it`、`aitm → ait` としなければならない。
- **FR-003**: Modifier の default `all` は URL から省略し、明示された `include` / `exclude` は保持しなければならない。
- **FR-004**: 対象能力では `0` を値あり、`NULL` を値なしとして扱い、Comparison は NULL に成立させてはならない。
- **FR-005**: `all` は存在性で絞り込まず、Comparison があれば評価しなければならない。
- **FR-006**: `include` は値ありを条件とし、Comparison があれば AND で評価しなければならない。Comparison なしでも完全な条件として成立しなければならない。
- **FR-007**: `exclude` は値なしを条件とし、Comparison を検索評価に使用してはならない。Builder は `exclude` 時の Comparison を URL に出力してはならない。
- **FR-008**: Parser は有効な Modifier と Comparison を Form に復元してよく、`exclude` 時の Comparison を削除・null 化してはならない。次回 Builder で `exclude` のみへ正規化する。
- **FR-009**: Hero Point の `exclude` でも Hero Point Comparison を検索評価に使用せず、Modifier は `is_hero` を参照しなければならない。
- **FR-010**: Level は例外として、`lvm=exclude` でも `lv` Comparison を評価し、`is_instant_summon` と独立に扱わなければならない。
- **FR-011**: 対象カテゴリに適用されない条件は Builder と検索実行に含めてはならない。
- **FR-012**: 新しい `presence` モデル、`...p` Alias、対象外数値への Modifier、実装・Tasks の追加は行ってはならない。

## Key Entities

- **SearchForm 数値条件**: 既存の `NumericCondition` / `FilteredNumericCondition` と `filterType` を用いる。新しい `presence` フィールドは持たない。
- **存在性 Modifier**: 対象数値の `all` / `include` / `exclude`。`exclude` は内部 Comparison を保持できるが検索評価・URL出力には使用しない。
- **Canonical Query**: `itm → it`、`aitm → ait` を含む Query Specification 準拠の URL Query。

## Success Criteria

- **SC-001**: `0` / `NULL`、正負数、`all` / `include` / `exclude`、Modifier 単独、Comparison 併用の代表ケースが全て Domain semantics と一致する。
- **SC-002**: `itm` / `aitm` を含む Builder / Parser roundtrip が、canonical order と default omission を満たす。
- **SC-003**: `exclude + Comparison` は Form 内で復元可能だが、検索評価では Comparison を使用せず、Builder は Modifier のみを出力する。
- **SC-004**: Initiative / Additional Initiative、Hero Point、Level 例外の UI 表示・保持・server search が代表ケースで一致する。
- **SC-005**: 既存の対象外数値へ新しい Modifier または Alias が追加されていない。

## Assumptions

- 数値の値なしは、Domain data が `NULL` または対象値を持たない状態である。
- `include` / `exclude` の値は既存の Modifier UI と同じ語彙を使用する。
- URL の未知・不正値処理、重複処理、encoding は Query Specification の一般規則に従う。
- データ Schema、カードデータの補正、コスト検索の公開前提は本 Feature の対象外である。
