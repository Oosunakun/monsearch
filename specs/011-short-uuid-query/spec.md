# Feature Specification: Short UUID検索条件の形式判定

**Feature Branch**: `011-short-uuid-query`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "カードを検索する利用者として、Short UUIDを使用する検索条件について、現在のmaster dataに存在するかどうかとは独立して形式を判定し、有効なShort UUIDをURL Queryとして保持・復元できるようにしたい。Short UUIDは検索URLを圧縮するための識別子で、UUIDv7の末尾5桁の16進文字列を使用する。同一Query Parameterが参照するID集合内での一意性はデータ生成側で保証し、検索アプリは衝突検出・解決を行わない。入力は大文字小文字を区別せず受理し、canonical出力は小文字とする。形式として有効だが現在のmaster dataに存在しない値も保持し、validation failureとして扱わない。検索時は既存のParameter固有server-side semanticsへ値を渡し、今回の改修ではその意味論を変更しない。不正形式は無効値として扱う。現行仕様は5桁固定とするが、将来の桁数変更時に短工数で追従できるよう、検索アプリ内で桁数を一元管理する。今回の改修ではShort UUIDを使用する検索ParameterとMock/Parameterデータを新仕様へ整合させる。Short UUID以外の検索意味論は変更しない。"

## User Scenarios & Testing

### User Story 1 - Short UUIDで検索条件を指定する (Priority: P1)

カードを検索する利用者として、Short UUIDを使う検索Parameterに、master dataに現在存在する識別子を指定して対象を絞り込みたい。

**Why this priority**: Short UUID検索の基本経路であり、検索URLを短く保ちながら既存のカード検索を利用するために必須である。

**Independent Test**: Short UUIDを使用する各Parameterに、master dataに存在する値を指定して検索し、対応するカードだけがヒットすることを確認する。

**Acceptance Scenarios**:

1. **Given** Short UUIDを使用するParameterに大文字を含む5桁の16進値が指定されている、**When** 検索条件を読み込む、**Then** 値は形式上有効な条件として保持される。
2. **Given** 有効なShort UUIDが対応するmaster dataに存在する、**When** 検索する、**Then** そのParameterで現在実装されている既存の検索意味論に従って検索される。
3. **Given** 同一Parameter内のShort UUID値が生成側で一意である、**When** 検索する、**Then** 検索アプリは衝突検出や値の置換を行わず、そのParameterの既存server-side照合意味論へ値を渡す。

### User Story 2 - 有効な値をURLに保持・復元する (Priority: P1)

カードを検索する利用者として、Short UUIDを含む検索URLをブックマーク・共有・再読み込みしても、検索条件を失わずに再利用したい。

**Why this priority**: URL検索条件の保持と復元ができなければ、Short UUIDによる圧縮の利用価値が成立しない。

**Independent Test**: 大文字を含む入力、canonical化されたURL、master dataに存在しない有効値を対象に、URL QueryのParserとBuilderを往復させて条件が保たれることを確認する。

**Acceptance Scenarios**:

1. **Given** Short UUIDに大文字が含まれるURL Queryを開く、**When** 検索条件を復元してURLを再生成する、**Then** 値は小文字の5桁形式で出力される。
2. **Given** 形式上有効だがmaster dataに存在しないShort UUIDがURL Queryに含まれる、**When** URLを復元して再検索する、**Then** 値は検索条件として保持され、validation failureにはならず、既存のParameter固有server-side semanticsへ渡される。
3. **Given** 複数のShort UUIDが同一Parameterに指定されている、**When** URLを復元して再生成する、**Then** 各有効値の意味を維持し、既存のCollectionの結合規則に従う。

### User Story 3 - 不正値を安全に扱う (Priority: P2)

カードを検索する利用者として、入力ミスや旧形式の値が含まれるURLを開いても、他の有効な検索条件を失わずに利用したい。

**Why this priority**: 共有URLや手入力URLの一部が不正でも、検索全体を壊さず予測可能に扱うためである。

**Independent Test**: 桁数違い、16進文字以外、大文字小文字混在、空値を含むURLを、有効な別条件と組み合わせてParserに渡す。

**Acceptance Scenarios**:

1. **Given** 5桁でない値または16進文字以外を含む値が指定されている、**When** URLを復元する、**Then** その値は無効値として無視され、他の有効な条件は復元される。
2. **Given** 同じParameterに有効値と不正値が混在している、**When** 検索する、**Then** 有効値だけが検索条件として残る。
3. **Given** 有効なShort UUIDがmaster dataから削除または未投入になっている、**When** 検索する、**Then** その値は不正値やvalidation failureに変換されず、既存のParameter固有server-side semanticsへ渡される。

### Edge Cases

- Short UUIDはASCIIの16進文字 `0-9`、`a-f`、`A-F` を5文字ちょうど受理し、それ以外の桁数・文字を無効とする。
- 有効値の大文字小文字の違いは同一値として扱い、canonical出力では小文字に統一する。
- 有効形式でもmaster dataに対応するIDがない値は条件から削除せず、validation failureとして扱わない。ID照合を行う既存semanticsでは対応IDとの一致がない値となるが、全alias共通の検索結果（0件）までは今回保証しない。
- 同一Parameter内のShort UUIDの衝突はデータ生成側が解決済みである前提とし、検索アプリは衝突検出・解決を行わない。
- Short UUID以外のParameter、既存のAND/OR、Modifier、Comparison、未知Parameter、不正値の一般的な扱いは変更しない。
- 将来桁数を変更する場合、検索アプリ内の一元化された定義だけを変更することで形式判定・canonical化・関連データの整合を追従できるものとする。

## Requirements

### Functional Requirements

- **FR-001**: システムは、Short UUIDを使用する既存の検索Parameter（`ct`、`pd`、`fa`、`ra`、`il`、`eat`、`re`、`are`）について、形式判定をmaster dataの存在確認から独立して行わなければならない。
- **FR-002**: システムは、UUIDv7の末尾5桁に相当する5文字ちょうどのASCII 16進文字列だけをShort UUIDの有効形式として受理しなければならない。
- **FR-003**: システムは、Short UUIDの入力時に大文字小文字を区別せず受理し、同値の入力を同一の検索条件として扱わなければならない。
- **FR-004**: システムは、Short UUIDをURL Queryへ出力するとき、英字を小文字へcanonical化しなければならない。
- **FR-005**: システムは、形式上有効だが対応するmaster dataのIDが存在しないShort UUIDを、URL Queryおよび復元した検索条件から削除してはならない。
- **FR-006**: システムは、形式上有効だが対応IDが存在しないShort UUIDをvalidation failureとして扱わず、既存server-side searchの当該Parameter固有の意味論へ渡さなければならない。今回の改修はその照合意味論を変更してはならない。
- **FR-007**: システムは、桁数違い、16進文字以外、空値など形式に適合しないShort UUIDを無効値として扱い、canonical URL Queryへ出力してはならない。
- **FR-008**: システムは、同一Parameter内のShort UUIDの一意性を検証・補正・解決してはならず、データ生成側で保証された一意性を前提に値を扱わなければならない。
- **FR-009**: システムは、Short UUIDの桁数を検索アプリ内で単一の定義として管理し、形式判定、canonical出力、Parser/Builder、Mock/Parameterデータの検証が同じ定義を参照しなければならない。
- **FR-010**: 今回の改修では、Short UUIDを使用する検索Parameterおよび関連するMock/Parameterデータを、5桁固定・大文字小文字非区別・小文字canonicalの仕様へ整合させなければならない。
- **FR-011**: 今回の改修では、Short UUID以外の検索Parameterの検索意味論、既存のParameter間の結合、Collection内の結合、不正値の一般的な処理を変更してはならない。また、Short UUID対象aliasであっても、既存server-side searchのID mapping、Natural Key、Resistance-Affinity semanticsを変更してはならない。
- **FR-012**: システムは、同じShort UUIDを含むURL QueryをParserで復元してBuilderで再生成する場合、値の存在有無にかかわらず有効形式の値を小文字canonical形式で保持しなければならない。

### Key Entities

- **Short UUID**: UUIDv7の末尾5桁からなる、検索URL向けの短縮識別子。形式上の有効性とmaster data上の存在性を別々に持つ。
- **Short UUID検索Parameter**: Short UUIDのCollectionを受け取る既存の検索条件。`ct`、`pd`、`fa`、`ra`、`il`、`eat`、`re`、`are` が対象である。
- **Canonical URL Query**: 有効なShort UUIDを小文字5桁で表現する、Parser/Builder往復可能な検索URL。
- **Master data対応ID**: Short UUIDと既存server-side searchのParameter固有の照合意味論を通じて参照されるIDまたはデータ。存在しない場合でもShort UUIDの形式上の有効性は失われない。

## Success Criteria

### Measurable Outcomes

- **SC-001**: Short UUIDを使用する全8 Parameterで、5桁の16進文字列、大文字小文字混在、桁数違い、非16進文字を含む代表ケースの100%が仕様どおりに判定される。
- **SC-002**: 形式上有効なShort UUIDについて、master dataに存在する値・存在しない値の両方で、URL Query → 検索条件 → URL Queryの往復後に小文字canonical値が100%保持される。
- **SC-003**: master dataに存在しない有効値を含む検索で、その値が条件から削除されずvalidation failureにならず、既存server-side searchの当該Parameter固有の意味論へ渡されること、およびShort UUIDの形式処理変更によって既存の検索結果・意味論が意図せず変化しないことを代表ケースで確認できる。
- **SC-004**: 同一Parameter内の値の一意性について、検索アプリによる衝突検出・解決を追加せず、既存のデータ生成側の保証を維持できる。
- **SC-005**: Short UUID以外の既存検索条件について、既存の回帰テストおよび代表的なParser/Builder往復が100%従来どおり通過する。
- **SC-006**: 将来の桁数変更を想定した検証で、検索アプリ内の一元定義を変更するだけで、形式判定・canonical化・Mock/Parameterデータ検証の参照先を更新できる構成であることを確認できる。

## Assumptions

- Short UUIDの仕様上の桁数は今回5桁に確定し、UUIDv7の値生成、短縮値の衝突検出、master data生成処理そのものは本Featureの対象外とする。
- Short UUIDを使用するParameterの集合は、現行Query Data Specificationの `ct`、`pd`、`fa`、`ra`、`il`、`eat`、`re`、`are` を対象とする。
- Short UUIDのserver-side照合はParameterごとの既存実装に従う。今回、ct / fa / ra の名称fallback、re / are のAffinity照合、Natural Key semanticsなどの既存意味論は変更しない。異なるParameter間で同一の短縮値が存在しても問題としない。
- URLのpercent-encoding、未知Parameterの無視、他の不正値の継続処理は既存のURL Query Specificationに従う。
- Mock/Parameterデータは、検索アプリの形式判定を検証するための現行開発データとして更新対象に含めるが、実運用master dataの追加・削除を本Featureで行わない。
