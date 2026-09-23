# Research: 効果コスト検索

## 1. URL条件の生成・復元

- **Decision**: 新しいURL処理を作らず、既存の`SearchForm.costItemSlots/costSpellSlots/costOtherEntities`と`cardSearchQueryBuilder` / `cardSearchQueryParser`を利用する。
- **Rationale**: Builderは既に`cis/cism`、`css/cssm`、`coe/coem`を出力し、Parserも条件を復元する。Query Specification 1.1.0のPair Collection canonical order、正数数量、`or` default、`and`/`none`の省略規則が既存実装にある。
- **Alternatives considered**: コスト用の独自query parser/builderを追加する案はcanonicalizationの二重実装となるため採用しない。

## 2. 検索用データの出所

- **Decision**: `app/utils/mockData/items/cards.json`の各Effectにある`search_cost`を検索の入力データとして使う。例では`alternatives[]`内に`costs[]`（`type`、`value`、`quantity`）があり、`has_other_cost`が検索キー化されないその他コストの存在を示す。
- **Rationale**: ユーザー要件が既存の検索用コストデータの利用を指定し、QDS 1.1.0は原文`effect_cost_text`の文字列照合を正式方式としていない。データ構造はRepositoryのJSONに既にあるが、`types/cards/finderCards.ts`の`Effect`型にはまだ表現されていない。
- **Alternatives considered**: 原文から検索時にコストを解析する、`effect_cost_text`部分一致を行う、または別カード間のデータを結合する案はいずれもQDSの禁止事項と不一致。

### 任意Spell枠の内部値

- **Decision**: `search_cost`内の`type: "spell"`, `value: "any"`を任意Spell枠の内部Projection値として扱う。これはQuery SpecificationのURL Pair valueではなく、既存のQuery Builder/Parserに追加しない。
- **Rationale**: `any`はレビュー済みMappingから構造化された支払いcapacityを表し、URLで利用者が選択するSpell種別ではない。

## 3. コスト一致の境界

- **Decision**: 同一Effectの同一`alternative`内で支払可能な数量を評価する。コスト種類間の正条件はAND、同一種類内Pairは`or`ならいずれか、`and`なら同一alternativeに含まれる別々の支払い要素で全て成立させる。選択肢間・別Effect間の数量は合算しない。
- **Rationale**: QDS 1.1.0 §7.1–7.3でカード・Effect・選択肢の評価単位、数量境界、任意Spell枠の扱いが確定している。
- **Alternatives considered**: Effect横断・alternative横断集約は、記載された支払いを実際に選べることを保証しないため不採用。

- **Capacity semantics**: exact quantityはalternativeが要求数量以上を支払えるとき一致する。rangeは許可範囲内に要求数量以上を支払える値が存在するとき一致する。`spell:any`はSpell Pairへ割り当て可能な共有capacityであり、同一capacityを複数Pairに二重充当しない。たとえば任意Spell枠1～3は`fire:2,water:1&and`を満たすが、必要合計4の`fire:2,water:2&and`は満たさない。

## 4. `none`とデータ状態

- **Decision**: `search_cost: null`は、元データで`effect_cost_id`が確定して空である場合にのみQDS上の確定「コストなし」と対応させる。構造化情報が欠損・未定義・不明ならnone検索の根拠にしない。`has_other_cost`も`coe=none`の判定に含める。
- **Rationale**: QDS §7.4はeffectなしとコストなしEffectを区別し、任意指定できないコスト（行動完了等）もother noneを妨げるとする。単なるJSON nullだけでは確定状態を識別できない可能性がある。
- **Alternatives considered**: すべてのnullをコストなしと見なすfallbackは不明・未構造化を誤って一致させるので不可。

## 5. 公開前提と完全性

- **Decision**: QDS §7.5 / ADR 0001の公開前提は、Feature開始前に完了したデータ整備で満たされたものとして本Featureを進める。人手レビュー済みMapping、未Mappingを失敗させる生成検証、`search_cost`生成、変換後JSONのレビュー、JSON差分確認が完了済みである。本Featureではこのデータを型付けして検索に利用する。
- **Scope**: 新しいfeature flag、公開可否フラグ、API側の未検証データ検出、新規の未提供時エラー応答などruntime publication controlを追加しない。QDSのコスト意味論、unknownの扱い、原文runtime解析禁止は維持する。

## 6. テスト境界

- **Decision**: pureなcost matcher相当の関数を既存`matchesCardSearch`経由でtable-drivenに検証する。データ型テストだけにせず、API応答が絞り込まれる経路を含める。
- **Rationale**: 組合せ意味はEffect/alternative/Pair集約の境界で決まるため、実際の検索predicateの観測が必要。
- **Alternatives considered**: UI表示のみのテストでは検索結果の正しさを立証できない。
