# Feature Specification: 効果コスト検索

**Feature Branch**: `012-effect-cost-search`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "カードを検索する利用者として、効果コストを検索条件として指定し、そのコストを実際に支払える効果を持つカードを検索したい。Item・Spell・Otherの効果コスト検索は既存のQuery Data SpecificationおよびQuery Specificationに準拠し、Repositoryに追加済みの検索用コストデータを利用して検索できるようにする。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 効果コストでカードを検索する (Priority: P1)

カードを探す利用者として、Item・Spell・Otherの効果コスト種類と数量を検索条件に指定し、そのコストを実際に支払える効果を持つカードを見つけたい。

**Why this priority**: 効果コストで検索できることが本機能の中心価値である。

**Independent Test**: Item、Spell、Otherそれぞれについて既知の検索用コストデータを持つ効果と持たない効果を用意し、指定した種類・数量に応じたカードだけが検索結果に含まれることを確認する。

**Acceptance Scenarios**:

1. **Given** 検索用コストデータにItemコストを持つ効果がある、**When** 利用者が対応するItemコストと数量を指定して検索する、**Then** そのコストを支払える効果を持つカードが結果に含まれる。
2. **Given** SpellまたはOtherのコスト条件を指定する、**When** 検索する、**Then** 指定した種類のコストを支払える効果を持つカードが結果に含まれる。
3. **Given** 指定した数量を支払える効果がない、**When** 検索する、**Then** そのカードは条件を満たす結果として返されない。
4. **Given** Item・Spell・Otherの複数種を指定する、**When** 検索する、**Then** 各条件を同一Effectの同一選択肢で同時に満たすカードだけが結果に含まれる。

### User Story 2 - コスト条件を組み合わせて検索する (Priority: P1)

利用者として、同一コスト種類の複数条件を既存のMatch指定に従って組み合わせ、実際に支払える選択肢を持つ効果を検索したい。

**Why this priority**: 選択可能な支払い方と条件の組み合わせを正しく絞るために必要である。

**Independent Test**: 同一種類に複数のPairを指定するケースについて、既存Query Data SpecificationのMatch意味と選択肢・数量の規則に合うデータを使って照合する。

**Acceptance Scenarios**:

1. **Given** 同一種類に複数Pairと既存仕様のOR Matchを指定する、**When** いずれかのPairを支払える効果を検索する、**Then** 少なくとも1条件を満たす効果を持つカードが結果に含まれる。
2. **Given** 同一種類に複数Pairと既存仕様のAND Matchを指定する、**When** 全Pairを同時に支払える選択肢を検索する、**Then** 全条件を同一選択肢で満たすカードだけが結果に含まれる。
3. **Given** ある効果に複数の選択肢がある、**When** 条件を検索する、**Then** 選択肢をまたいでコスト数量を合算せず、いずれか1つの許された選択で条件を満たす効果だけが一致する。
4. **Given** 検索用コストデータに任意Spell枠のrangeがある、**When** `css=fire:2,water:1&cssm=and`で検索する、**Then** 共有capacityが合計3以上なら一致する。
5. **Given** 任意Spell枠のrangeが1～3である、**When** `css=fire:2,water:2&cssm=and`で検索する、**Then** 必要capacityが合計4のため一致しない。

### User Story 3 - 効果コスト条件をURLで再利用する (Priority: P2)

利用者として、効果コスト条件を含む検索をURLで共有・再読み込みして、同じ条件で検索を再現したい。

**Why this priority**: 既存カード検索のURL形式との一貫性を保ち、再利用可能にする。

**Independent Test**: 各コスト種別のPair CollectionとMatch Modifierを含むURLを、Query Specificationのcanonical表現および既存Parser/Builderの振る舞いに照らして往復確認する。

**Acceptance Scenarios**:

1. **Given** Query Specificationに定義された効果コストのURL条件を開く、**When** 検索画面を表示する、**Then** Item・Spell・Otherの条件とMatchが復元される。
2. **Given** 詳細検索で効果コスト条件を指定する、**When** 検索を実行する、**Then** URLは既存Query Specificationのキー、Pair Collection形式、Modifier、およびcanonical orderに従う。

### Edge Cases

- 選択した数量が検索用コストデータの支払可能数量を超える場合は一致しない。
- exact quantityは、そのalternativeが指定数量以上を支払える場合に一致する。rangeは許可範囲内に検索要求数量以上を支払える値が存在する場合に一致する。
- 検索用ProjectionのSpell `value: "any"`は任意Spell条件へ割り当て可能な共有capacityを表す。複数Pairを同時に満たすとき同じcapacityを二重充当しない。
- コストに許された選択肢が複数ある場合、条件の充足を選択肢間で寄せ集めない。
- 異なるコストParameterの正条件はANDであり、全てを同一Effectの同一選択肢で満たす必要がある。
- `none` は当該コスト種別が全選択肢にわたって存在しないことを表し、Effect自体がないカードは一致しない。
- コストの不明・未構造化状態をコストなしとして扱わず、検索用コストデータの確定した意味に従う。
- 手札・山札等の数字は、コストとして支払う数量と説明文中の数字を区別する。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 検索利用者はItem、Spell、Otherの各効果コスト種類と数量を条件として指定できなければならない。
- **FR-002**: 検索はRepositoryに追加済みの検索用コストデータを用い、指定コストを実際に支払えるEffectを評価しなければならない。
- **FR-003**: コスト条件のURL表現はQuery Specificationに従い、Itemは`cis` / `cism`、Spellは`css` / `cssm`、Otherは`coe` / `coem`のPair CollectionとModifierを使用しなければならない。
- **FR-004**: Pairの識別子、コスト種類への対応、数量、Match値はQuery Data SpecificationおよびQuery Specificationの定義に従わなければならない。
- **FR-005**: 同一コストParameter内の複数条件は、そのMatch指定に従って評価しなければならない。
- **FR-006**: 異なるコストParameterはANDで結合し、正のコスト条件は同一Effectの同一許可選択肢で全て満たさなければならない。
- **FR-007**: 選択肢をまたぐ数量の合算、支払うコスト以外の単なる文字列出現による一致、および選択肢間で条件を寄せ集めた一致をしてはならない。
- **FR-008**: `none` は対象コスト種類のコストが全選択肢に存在しない条件として、既存仕様どおり評価しなければならない。Effect自体が存在しないカードは`none`だけの条件にも一致させてはならない。
- **FR-009**: `effects.effect_cost_id = NULL`等、既存仕様で確定したコストなし状態と、不明または未構造化の状態を区別しなければならない。
- **FR-010**: URLのcanonical order、Pair Collection表現、default omission、未知値の扱いはQuery Specificationに準拠しなければならない。
- **FR-011**: コスト条件のない検索および他の検索条件との併用は、既存カード検索の意味を維持しなければならない。
- **FR-012**: 任意Spell枠は検索用Projection内部の`type: "spell"`, `value: "any"`で表し、Query SpecificationのURL Pair valueとして扱ってはならない。rangeと複数Pairの同時充当は共有capacityを二重計上せず評価しなければならない。

### Key Entities

- **効果コスト条件**: Item・Spell・Otherの種類、数量、同一種類内のMatch、およびnone条件からなる検索条件。
- **Effect**: カードに属する個別の効果。指定コスト条件はこの単位で評価される。
- **検索用コストデータ**: Repositoryに追加済みの構造化コスト情報。支払える種類・数量・選択肢を表す根拠となる。
- **コスト選択肢**: 効果内で選択可能な支払い方。条件の充足と数量評価は選択肢単位で行う。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Item・Spell・Otherそれぞれで、既知の支払可能条件に一致するカードと一致しないカードを含む代表検索ケースの全てがQuery Data Specificationの期待結果と一致する。
- **SC-002**: OR・AND、数量境界、複数選択肢、複数コスト種別の組み合わせを含む代表ケースの全てが定義済みの意味どおりに評価される。
- **SC-003**: 効果コスト条件を含む検索URLを再読み込みまたは検索画面で再編集した後も、条件の意味が保たれ、再検索結果が同じになる。
- **SC-004**: `none`、Effect不在、確定コストなし、不明・未構造化状態の各代表ケースが混同されず、仕様どおりの結果となる。

## Assumptions

- Item・Spell・Otherの区分、URLキー、Pair識別子、数量、Match、noneの意味は既存のQuery Data SpecificationおよびQuery Specificationを正とする。
- 検索用コストデータはRepositoryに追加済みであり、本Featureではそれを検索に利用する。データ形式の新設やコスト分類の変更は行わない。
- distinctな`effect_cost_text`の人手Mapping、非空値の未Mapping検証、`search_cost`生成、および変換後JSONの人手レビューはFeature開始前に完了している。QDS §7.5の構造化・検証の公開前提は満たされており、本Featureでruntime publication controlを追加しない。
- 詳細検索におけるコスト条件入力およびカード検索URLは既存の検索体験に沿って提供する。
- 利用可能なコスト条件に含まれない新しい支払い規則の推測は行わない。
