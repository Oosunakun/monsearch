# Feature Specification: バックエンドによるカード検索

**Feature Branch**: `009-backend-card-search`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "カードを検索する利用者として、検索条件をバックエンドへ送信し、その条件に対する検索結果を取得したい。なぜなら、今後カードデータの取得・検索処理をブラウザ内の実装からバックエンドへ移行できるようにするためだ。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 条件に合うカードを取得する (Priority: P1)

カードを検索する利用者として、指定した検索条件をバックエンドへ送り、その条件に合うカードの一覧を取得したい。これにより、カードデータをブラウザ内に保持して検索することに依存せず、目的のカードを探せる。

**Why this priority**: 条件の送信から結果の取得までが本 feature の中心価値であり、この流れが成立しなければバックエンドへの移行を開始できないため。

**Independent Test**: 既存の検索条件を指定して検索を実行し、バックエンドがその条件を評価して、該当するカードの先頭ページと件数を返すことを確認する。

**Acceptance Scenarios**:

1. **Given** 利用者が1つ以上の有効な検索条件を指定している, **When** 検索を実行する, **Then** 指定した条件がバックエンドで評価され、一致するカードの指定ページが利用者に提示される。
2. **Given** 利用者が複数の検索条件を組み合わせている, **When** 検索を実行する, **Then** 既存検索と同じ条件の意味および組合せ規則で評価された結果が提示される。
3. **Given** queryに未知parameterまたは不正な値が含まれ、ほかに有効な条件がある, **When** 検索を実行する, **Then** 当該parameterだけが無視され、残りの有効な条件による結果が提示される。
4. **Given** 指定した条件に一致するカードが存在しない, **When** 検索が完了する, **Then** 検索失敗と誤認させず、該当結果が0件であることが提示される。

---

### User Story 2 - 検索結果を並べ替えてページ単位で閲覧する (Priority: P2)

カードを検索する利用者として、全体件数を把握しながら、現在の検索結果画面と同じ件数および並び順を選んで結果をページ単位で閲覧したい。これにより、全カードデータをブラウザへ取得せずに結果全体を確認できる。

**Why this priority**: カードデータ取得と検索処理をブラウザから移すには、現在ブラウザが担うsortとpaginationもAPI境界へ移す必要があるため。

**Independent Test**: 複数ページにまたがる既知の結果についてsort、方向、ページ件数、ページを指定し、各応答の内容、全体件数、分類別件数、ページ情報が一貫することを確認する。

**Acceptance Scenarios**:

1. **Given** 一ページの件数を超えるカードが一致する, **When** 利用者がページを移動する, **Then** バックエンドから指定ページだけが取得され、全体件数と現在位置が提示される。
2. **Given** 利用者がID順、レアリティ順、または攻撃力順と昇順・降順を選ぶ, **When** 検索する, **Then** 選択した順序で並べ替えられたページが返される。
3. **Given** 利用者が20件、50件、または100件表示を選ぶ, **When** 検索する, **Then** 選択したページ件数が適用され、先頭ページから結果が提示される。
4. **Given** 同じcard data、検索条件、sort、page、per-pageを指定する, **When** 繰り返し検索する, **Then** 同じカードが同じ順序で返される。

---

### User Story 3 - 取得失敗を把握して再試行する (Priority: P3)

カードを検索する利用者として、検索結果を取得できない場合に0件結果と区別して状態を理解し、同じ条件で再試行したい。これにより、一時的な障害から操作をやり直さず回復できる。

**Why this priority**: バックエンドとの通信を伴うことで生じる失敗を、正常な検索結果と区別して扱う必要があるため。

**Independent Test**: 取得失敗を発生させ、0件とは異なる案内と再試行操作が表示され、同じquery、sort、page、per-pageで再取得できることを確認する。

**Acceptance Scenarios**:

1. **Given** 検索結果を取得中である, **When** 応答を待っている, **Then** 利用者にloading状態が提示される。
2. **Given** バックエンドから検索結果を取得できない, **When** 検索が失敗する, **Then** 利用者は0件表示ではなく取得失敗として認識できる。
3. **Given** 検索取得が失敗した, **When** 利用者が再試行する, **Then** 条件を再入力せず、同じ検索指定で再取得が行われる。

### Edge Cases

- 条件に一致するカードが0件の場合は、取得失敗と区別し、空の結果と全体件数0を提示する。
- 空欄、未選択、既定値、未知parameter、不正なparameter valueは、その条件が指定されていないものとして扱う。例えば `lv=broken` は `lv` だけを無視する。
- 同じ検索条件が重複して含まれる場合は、Query Specificationの型別規則に従って解釈する。
- 日本語、空白、記号を含む文字条件は、Query Specificationと既存検索が定める意味を保つ。
- 数値の境界値や0が有効な条件では、その値を欠落させない。
- paginationまたはsortの値が未指定・不正な場合は、その項目の既定値を適用して検索を継続する。
- 要求pageが最終pageを超える場合は、利用者が空の中間状態に取り残されないよう、適用可能な最終pageを返す。0件時はpage 1とする。
- sortの主比較値が同じカードは、現在のdata source順を補助順序として保持する。
- 公開projectionを作れない不完全なcard recordは除外し、ほかの正常な結果は返す。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Browserはカード一覧の取得および検索をバックエンド経由で行い、全cards JSONを読み込んでBrowser内で絞り込んではならない。
- **FR-002**: 検索API endpointは `GET /api/cards` でなければならない。
- **FR-003**: 検索条件は `docs/architecture/query_specification.md` が定めるalias、値表現、重複処理、既定値、および意味をそのまま使用しなければならない。
- **FR-004**: バックエンドは未知parameterおよび不正なparameter valueを無視し、残りの有効な検索条件で検索を継続しなければならない。
- **FR-005**: バックエンドは、すべての有効な検索条件を既存Browser内検索と同じ規則で評価し、同じcard dataに対して同じカード集合を得なければならない。
- **FR-006**: 条件なし、または有効な条件が残らない要求は、絞り込みなしの検索として扱わなければならない。
- **FR-007**: バックエンドは検索後のsortとpaginationを実行し、指定pageのitems、全体件数、page、per-page、全page数、適用sort、および全一致結果のcategory別件数を返さなければならない。最終pageを超える指定は最終pageへclampし、0件時は`page=1`、`totalPages=1`としなければならない。
- **FR-008**: sortは現在の検索結果画面が提供するID順、レアリティ順、攻撃力順、および昇順・降順を維持し、主比較値が同じ場合はJSON source順を維持しなければならない。未指定または不正なsort値は`id` / `asc`へ戻さなければならない。
- **FR-009**: per-pageは現在の検索結果画面が提供する20件、50件、100件を維持し、未指定または不正な値は20件へ、未指定または不正なpage値は1へ戻さなければならない。
- **FR-010**: APIは各itemを、現在の検索結果一覧の表示と装飾に必要な公開情報だけからなる明示的projectionとして返し、現在の画面で不要なmetadataを将来用途だけのために含めてはならない。
- **FR-011**: 条件に一致するカードがない場合、APIは失敗ではなく空のitems、全体件数0、page 1、全page数1を含む正常結果を返さなければならない。
- **FR-012**: Browserはloading、success（0件を含む）、errorを区別して提示し、取得失敗時に同じ検索指定でretryできなければならない。
- **FR-013**: バックエンドの検索失敗は、入力不備を表す別error種別や500/503の区別を設けず、`HTTP 500 / CARD_SEARCH_FAILED`へ一本化しなければならない。
- **FR-014**: 現在のdata sourceには既存cards JSONを使用し、カード情報を変更してはならない。
- **FR-015**: 本featureは新しい検索項目・検索規則、DB接続、D1/SQLite移行、認証、検索履歴、推薦、カード詳細API、またはBrowser内検索への自動fallbackを追加してはならない。

### Key Entities

- **検索条件**: Query Specificationのaliasと意味で表現されるカードの絞り込み条件。未知または不正な指定を除いた残りが検索に使われる。
- **検索ページ指定**: pageとper-pageで表す結果範囲。現在画面の20、50、100件表示を支える。
- **検索sort指定**: ID、レアリティ、攻撃力のkeyと昇順・降順からなる並び順。
- **カード検索結果ページ**: 指定pageの公開カード概要、全体件数、page情報、適用sort、および全一致結果のcategory別件数。
- **カード概要**: 現在の検索結果一覧を描画するために必要な情報だけを持つ公開projection。
- **検索取得失敗**: 検索結果を取得できなかった状態。正常な0件結果とは区別され、再試行できる。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Query Specificationのprimitive、collection、comparison、pair collection、modifier、duplicate、境界値、category適用、および複合条件を代表するparity casesの100%で、バックエンド検索と既存Browser内検索のcard ID集合が一致する。
- **SC-002**: 条件なし、単一条件、複合条件、未知parameter、不正値のみ、不正値と有効条件の混在、および0件の主要API casesの100%で、定義された正常結果が返る。
- **SC-003**: ID、レアリティ、攻撃力の各sortと昇順・降順、20/50/100件表示、先頭・中間・末尾・範囲外・0件pageの代表casesの100%で、itemsとpage metadataが契約どおりになる。
- **SC-004**: 現在の検索結果画面で表示されるcard情報、全体件数、category別件数、sort、paginationがAPI responseだけで成立することを主要UI動作確認で検証できる。
- **SC-005**: loading、結果あり、0件、取得失敗、同一条件でのretryの各状態が通常のunit/integration testおよび主要UI動作確認で期待どおりに識別・操作できる。
- **SC-006**: featureに関連する自動correctness checksとrelease-readiness checksがすべて成功する。

## Assumptions

- User Storyと「ブラウザ内のカードデータ取得・検索処理をバックエンドへ移行する」というFeature Goalを維持する。
- 検索条件のsource of truthは `docs/architecture/query_specification.md` Version 1.0.0であり、API固有の検索aliasや厳格validationは追加しない。
- API制御parameterは `page`、`perPage`、`sort`、`order` とし、Query Specificationの検索parameterとは別に扱う。
- 現在のdata sourceは `app/utils/mockData/items/cards.json` であり、DB接続とD1/SQLite等への移行は後続featureで扱う。
- category別件数は現在の `ResultSummary` に必要なため全一致結果を対象に返す。表示labelとcolorは既存Browser側定義を使用する。
- 現在の操作は検索結果page上のpage、per-page、sort変更による再取得であり、追加のlatest-request-wins state machineは現時点では導入しない。framework標準のrequest取消・最新data適用で不足がテストにより確認された場合のみ、同feature内で最小の競合制御を加える。
- API障害時にBrowser内検索へ自動的に切り替えることは本featureの対象外とする。
