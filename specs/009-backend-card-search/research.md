# Phase 0 Research: バックエンドによるカード検索

## Decision 1: `GET /api/cards` を同一オリジンのNitro endpointとする

- **Decision**: 既存 `/cards` URL queryの検索条件に、`page`、`perPage`、`sort`、`order`を加えて `GET /api/cards` へ送る。
- **Rationale**: read-only検索であり、Nuxt/Nitroなら別serviceやCORSを追加せずCloudflare Pages preset内で完結する。Human Review Decisionのendpointとslug版の配置案に合致する。
- **Alternatives considered**: `/api/cards/search` はreviewで却下された。POST bodyと別backend serviceは現行の公開query・規模に対して過剰。

## Decision 2: Query SpecificationをAPIでもGracefulに解釈する

- **Decision**: `docs/architecture/query_specification.md` Version 1.1.0のalias、値形式、duplicate rule、default omission、category applicabilityをsource of truthとする。未知aliasとinvalid valueは当該指定だけを無視し、残る有効条件で検索する。制御parameterのinvalid valueも各defaultへ戻す。
- **Rationale**: Query SpecificationのGraceful ParsingとHuman Review DecisionをそのままAPI境界へ適用できる。既存`parseCardSearchQuery`もcomparisonやcollectionの不正部分を無視する実装であり、Browserとの意味互換性を保ちやすい。
- **Alternatives considered**: User Story版旧設計とslug版の `400 INVALID_QUERY` は有効条件まで検索不能にするため不採用。独自DTO/aliasはquery semanticsを二重管理するため不採用。

## Decision 3: 既存cards JSONをServer側で検索する

- **Decision**: `app/utils/mockData/items/cards.json` と既存`FinderCards`型をread-only data sourceとしてServer moduleから参照し、parsed criteriaを受けるpure matcherで絞り込む。
- **Rationale**: Browserの全dataset importを除去しつつ、既存Browser検索をoracleにparity testできる。現在DB bindingやmigrationは存在しない。
- **Alternatives considered**: D1/SQLite、repository interface、別search engineは後続featureの関心事。Browser fallbackは移行Goalを曖昧にする。

## Decision 4: sortとpaginationをAPIで実行し、現在のUI semanticsを維持する

- **Decision**: 処理順はfilter → sort → count/category breakdown → page slice。`page=1`、`perPage=20`、`sort=id`、`order=asc`をdefaultとし、perPageは20/50/100、sortはid/rarity/atk、orderはasc/descに限定する。主比較が同値ならJSON source orderを維持する。範囲外pageは最終pageへclampし、0件はpage 1 / totalPages 1とする。
- **Rationale**: `app/pages/cards/index.vue` と `ResultList.vue` が持つ現在の選択肢、rarity順序、攻撃力の欠損値0、page reset/clampの体験をServer責務へ移せる。
- **Alternatives considered**: slug版の `card_id` tie-breakと0件時totalPages 0は現在のstable sort/source orderおよびUIの `Math.max(1, ...)` と差があるため不採用。cursor paginationはpage-number UIと不一致。

## Decision 5: 現行Result componentsに必要な明示的projectionを返す

- **Decision**: itemはsnake_caseの表示用shapeとし、identity/category、該当category detail、表示するtraits/ability/effects、rarity、illustrator、product nameだけを返す。`categoryBreakdown` は全一致結果のcategory code/countとして返す。
- **Rationale**: 現行componentsは既存`Card`のsnake_case nested fieldsを直接参照するため、同shapeのsubsetなら不要なmappingとcomponent改修を避けられる。category breakdownは`ResultSummary`に必要だがlabel/colorは既存UI定義で解決できる。
- **Alternatives considered**: `Card`全体は`search_support`、tags、errata、flavor、未使用metadataまで公開する。slug版のcamelCase汎用object projectionは境界が曖昧で、既存UIに追加adapterが必要。

## Decision 6: loading/success/error/retryだけを明示する

- **Decision**: APIは200 successと単一の500 failureを持つ。Browserはloading、success（0件を含む）、errorを管理し、最後の同一requestをretryする。追加のsequence state machineは導入せず、通常のNuxt data-fetch lifecycleを用いる。
- **Rationale**: invalid検索値は無視されるためvalidation error stateは不要。Human Review Decisionは500/503の区別を不要とし、現在UIで必要な非同期状態だけを求める。
- **Alternatives considered**: 400/500/503 taxonomy、`retryable` metadata、AbortControllerとsequenceの二重防御は現時点のUI要求を超える。実装時のpage testで古いresponse採用が実証された場合のみ最小の取消/guardを追加する。

## Decision 7: 検証はcorrectnessと通常quality gateに限定する

- **Decision**: Query Specificationの各形式、境界値、category applicability、duplicate、複合条件を代表する十分なparity cases、API/UI integration、typecheck、lint、buildで検証する。
- **Rationale**: 固定100 cases、p95、利用者成功率、retry成功率、大量dataset、concurrent requestはHuman Review Decisionで除外された。
- **Alternatives considered**: slug版の10,000件/100 concurrent benchmarkと旧User Story版の定量UX試験は今回のSuccess Criteriaに含めない。
