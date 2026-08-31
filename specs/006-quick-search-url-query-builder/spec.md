# Feature Specification: Quick Search URL Query Builder

**Feature Branch**: `006-quick-search-url-query-builder`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "quick-search-url-query-builder"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 簡易検索を結果へ反映する (Priority: P1)

カードを探す利用者として、検索対象を選び、文字列を入力して簡易検索を実行すると、その対象に対応する条件でカード一覧を開きたい。これにより、詳細検索画面を経由せず目的の検索を開始でき、詳細検索と同じ Logical URL Query 表現を通じて入力元に依存しない検索状態を利用できる。

**Why this priority**: 簡易検索の入力を詳細検索と共通の Logical URL Query 表現へ変換し、カード一覧が入力元を区別せず検索条件を扱えるようにすることが、この機能の中心的な価値であるため。

**Independent Test**: 「カード名」「種族・タイプ」「キーワード」の各対象で検索文字列を送信し、カード一覧の location に対象ごとの正しい条件が1つだけ表現されることを確認できる。

**Acceptance Scenarios**:

1. **Given** 利用者が「カード名」を選び有効な文字列を入力している、**When** 簡易検索を実行する、**Then** カード一覧がカード名条件 `nm` と入力文字列を持つ検索 location で開く。
2. **Given** 利用者が「種族・タイプ」を選び有効な文字列を入力している、**When** 簡易検索を実行する、**Then** カード一覧が種族・タイプ文字列条件 `att` と入力文字列を持つ検索 location で開く。
3. **Given** 利用者が「キーワード」を選び有効な文字列を入力している、**When** 簡易検索を実行する、**Then** カード一覧がキーワード条件 `kw` と入力文字列を持つ検索 location で開く。

---

### User Story 2 - 検索 location を再利用する (Priority: P2)

カードを探す利用者として、簡易検索の条件が URL query として表現されてほしい。これにより、結果を再読み込み、bookmark、共有しても同じ意味の検索を再現できる。

**Why this priority**: 検索状態を location に保持するという既存の検索体験と一貫させ、セッションを越えた再利用を可能にするため。

**Independent Test**: 日本語、空白、記号を含む簡易検索を実行し、その location を新しい閲覧状態で開いて、元と同じ検索対象および文字列が解釈されることを確認できる。

**Acceptance Scenarios**:

1. **Given** 有効な簡易検索条件がある、**When** 同じ条件を複数回送信する、**Then** 毎回同一の canonical query が生成される。
2. **Given** 検索文字列に日本語、内部空白、または URL 上で特別な意味を持つ文字が含まれる、**When** 生成された location を再度開く、**Then** 検索文字列の意味が失われない。
3. **Given** 簡易検索から生成された location が共有される、**When** 別の閲覧状態で開く、**Then** 選択された検索対象に対応する条件だけが再現される。

---

### User Story 3 - 空または不正な入力を安全に扱う (Priority: P3)

カードを探す利用者として、空白だけの入力や未対応の検索対象を誤って送信しても、意味のない query や誤解を招く条件を作らないでほしい。

**Why this priority**: 不正確な検索 location を防ぎ、簡易検索からの結果を信頼できる状態に保つため。

**Independent Test**: 空文字列、空白だけの文字列、未対応の検索対象をそれぞれ変換し、有効な検索条件が生成されず、入力状態が変更されないことを確認できる。

**Acceptance Scenarios**:

1. **Given** 検索文字列が空または空白だけである、**When** 簡易検索条件を生成する、**Then** テキスト検索条件は生成されない。
2. **Given** 検索対象がサポート対象外である、**When** 簡易検索条件を生成する、**Then** 他の検索対象へ推測変換せず、テキスト検索条件は生成されない。
3. **Given** 簡易検索 state が変換処理へ渡される、**When** 変換が完了する、**Then** 元の state は変更されない。

### Edge Cases

- 検索文字列の先頭と末尾に空白がある場合は取り除き、内部の意味ある空白は保持する。
- 検索文字列が空または空白だけの場合は、空値を持つ query parameter を生成しない。
- 日本語、emoji、区切り文字として使われ得る記号を含む文字列でも、再度開いたときに同じ意味を保持する。
- 未対応または空の検索対象は、カード名など別の対象へ暗黙に読み替えない。
- 検索対象を切り替えた後は、現在選択中の対象に対応する条件だけを生成し、以前の対象の条件を残さない。
- 現行の canonical URL query 語彙にない簡易検索 state の値は、検索条件として出力しない。
- 同じ入力を繰り返し変換しても、出力内容と条件順序は変化しない。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは、現在の簡易検索 state からカード一覧で利用可能な URL query 条件を生成しなければならない。
- **FR-002**: システムは、検索対象「カード名」を canonical parameter `nm` に対応付けなければならない。
- **FR-003**: システムは、検索対象「種族・タイプ」を canonical parameter `att` に対応付けなければならない。
- **FR-004**: システムは、検索対象「キーワード」を canonical parameter `kw` に対応付けなければならない。
- **FR-005**: 生成結果は、選択された検索対象に対応するテキスト条件を最大1つだけ含まなければならない。
- **FR-006**: システムは、検索文字列の先頭と末尾の空白を除去し、内部の意味ある空白を保持しなければならない。
- **FR-007**: システムは、空または空白だけの検索文字列を URL query 条件から除外しなければならない。
- **FR-008**: システムは、未対応または空の検索対象からテキスト検索条件を生成してはならない。
- **FR-009**: 同じ意味の簡易検索 state は、常に同じ canonical query 表現を生成しなければならない。
- **FR-010**: 検索文字列に日本語、内部空白、emoji、または URL 上で特別な意味を持つ文字が含まれても、生成された location を開き直したときに元の意味を保持しなければならない。
- **FR-011**: 簡易検索の実行は、生成した条件を持つカード一覧へ利用者を移動させなければならない。
- **FR-012**: 有効な条件がない簡易検索の実行は、意味のない空 parameter を付けずにカード一覧を開かなければならない。
- **FR-013**: query 生成処理は、入力された簡易検索 state を変更してはならない。
- **FR-014**: システムは、承認済み URL query 仕様に定義されていない簡易検索 state の値を query へ追加してはならない。

### Key Entities

- **Quick Search State**: 利用者が選択した検索対象、入力した検索文字列、および現行 UI が保持する付随値。
- **Quick Search Target**: 入力文字列をどのカード属性として検索するかを表す選択肢。「カード名」「種族・タイプ」「キーワード」を対象とする。
- **Canonical Query Condition**: 選択された対象と正規化済み文字列から作られる、承認済み URL query 仕様に準拠した単一の検索条件。
- **Search Location**: canonical query 条件を含み、再読み込み、bookmark、共有が可能なカード一覧の location。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 3つのサポート対象それぞれについて、有効な入力の100%が対応する1つの canonical condition としてカード一覧 location に表現される。
- **SC-002**: 空文字列、空白だけの文字列、未対応対象を含む境界ケースの100%で、意味のないテキスト検索 parameter が生成されない。
- **SC-003**: 少なくとも100件の代表入力について、同じ入力を繰り返し送信した結果の search location が100%一致する。
- **SC-004**: 日本語、内部空白、emoji、予約記号を含む全検証ケースで、生成した location の再表示後も検索文字列の意味が100%保持される。
- **SC-005**: 通常環境で測定した簡易検索操作の95%以上で、実行から1秒以内に対応するカード一覧への遷移が開始される。
- **SC-006**: 利用者テストの参加者の90%以上が、初回の試行で選択した検索対象による簡易検索を完了し、期待する対象が location に反映されたことを確認できる。

## Assumptions

- 「quick-search-url-query-builder」は、既存の header および navigation drawer の簡易検索 state を、カード一覧の canonical URL query に変換する機能を指す。
- 簡易検索と詳細検索はそれぞれの入力形式に対応する変換処理を持ち、どちらも `docs/architecture/query_specification.md` に準拠する共通の Logical URL Query 表現を生成する。
- 今後 `/cards` 側は URL query のみを検索条件として読み取ることで、検索条件画面と簡易検索のどちらから遷移したかに依存しない検索処理を実現する。
- 検索対象と canonical condition の対応は「カード名」=`nm`、「種族・タイプ」=`att`、「キーワード」=`kw` とする。
- `docs/architecture/query_specification.md` を URL query の正規形式に関する唯一の基準とする。
- 現行 state の card pool 値は承認済み URL query 語彙に含まれず、現在の簡易検索入力にも表示されないため、本機能では query に出力しない。
- カード一覧側の検索実行、検索結果の正確性、新しい検索対象の追加、検索 UI の再設計は本機能の対象外とする。
- 検索状態の永続化は URL が担い、検索履歴、利用者 account、server-side 保存は対象外とする。
