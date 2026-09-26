# Phase 0 Research: カードセット収録カード検索

## 1. Query Specification と検索条件の表現

- **Decision**: URL Query の Source of Truth は `docs/architecture/query_specification.md` とする。同仕様で `products` の canonical collection alias と定義された `pd` に、選択された一意な product value を1件だけ設定する。
- **Rationale**: Repository 調査により、既存 `buildCardSearchQuery` は `SearchForm.products` を `pd` へ生成し、既存 `parseCardSearchQuery` は `pd` を `SearchForm.products` へ復元し、双方が `PRODUCT_VALUES` で値を検証していることを確認した。これは Query Specification の mapping、canonical rule、builder/parser guarantee に従っており、既存検索の意味を変えず詳細検索と同じ結果判定へ接続できる。
- **Alternatives considered**: 名称を `nm` や独自 parameter に渡す案はカード名検索または未承認 vocabulary となる。詳細検索 form を一時構築して汎用 builder を呼ぶ案は、多数の無関係な default state と結合するため採用しない。

## 2. 一覧項目の識別情報

- **Decision**: `ProductRow` に表示・table identity 用 `id` とは別の `searchValue` を必須で持たせ、`productItems.json` の対応する一意な value を設定する。表示名から value を runtime lookup しない。
- **Rationale**: 現行 mock row の `id` は `20a` などで検索 option value と一致せず、`20f` の重複も存在する。表示名 lookup は同名要件を満たせない。row が検索 identity を明示すれば同名でも選択項目を一意に保てる。
- **Alternatives considered**: row `id` の転用は現行値の互換性がなく責務も曖昧。表示名と option label の照合は同名、表記変更、短縮表示に弱い。

## 3. query/location builder と無効値

- **Decision**: `Readonly` の candidate value を受け、`PRODUCT_VALUES` に含まれる場合だけ `{ path: '/cards', query: { pd: value } }` を返す pure utility を追加する。無効・空値では navigation target を返さず、UI は遷移を開始しない。
- **Rationale**: FR-003 の単一条件と FR-009 の fail-closed を独立 Unit Test で保証できる。専用 builder は一覧入力を canonical logical query に変換する adapter として責務が明確になる。
- **Alternatives considered**: component 内の inline object 構築は validation と contract が分散する。無効値を bare `/cards` に fallback する案は不正確な全件検索を開くため採用しない。

## 4. UI interaction とアクセシビリティ

- **Decision**: desktop/mobile ともカードセット名の text を semantic link または button として提示し、備考・発売日・row 全体は click target にしない。navigation は Vue Router/Nuxt の location object に委譲する。
- **Rationale**: keyboard 操作と link affordance を提供しつつ、FR-008 の click area を構造的に限定できる。location object は Unicode と予約記号の encode を framework に委譲する既存方針と一致する。
- **Alternatives considered**: row click は備考・発売日も実質的な click target にする。plain text に click handler を付ける案は keyboard と semantic accessibility が不足する。

## 5. 対象画面と共通 contract

- **Decision**: `ProductTable` を利用する既存の全画面、すなわち `/` と `/restrictions` を対象にし、両画面と desktop/mobile で required の `ProductRow.searchValue`、同じ validation、同じ location builder、同じ navigation contract を使用する。
- **Rationale**: Repository 調査では `ProductTable` の page 利用箇所は `app/pages/index.vue` と `app/pages/restrictions/index.vue` の2件で、いずれも各画面の mock source を `ProductRow` に変換して共通 component へ渡している。同一カードセットの意味が起点や表示形式で変化しない設計にできる。
- **Alternatives considered**: `/` のみを対象にする案は共通 component の一方の利用箇所だけで挙動が異なる。画面別 builder は同じ contract の重複と乖離を招く。

## 6. 結果画面との境界と永続性

- **Decision**: 本 feature は canonical `pd` location の生成までを担当する。URL Query を検索条件の Source of Truth とし、`/cards` の既存 `parseCardSearchQuery` をそのまま再利用して reload、bookmark、新しい tab、共有 URL から `SearchForm.products` を復元する。Feature 固有 state は追加せず、検索結果 filtering、empty state、sort/pagination も変更しない。
- **Rationale**: Query Specification の round-trip guarantee と既存 architecture を利用すれば、一覧起点を表す一時 state なしで同じ意味を再現できる。FR-010 と Incremental Change を守り、結果 filtering を入力元に依存させない。
- **Alternatives considered**: 一覧 page からカード配列を渡す案や専用 result page は、URL を source of truth とする既存 architecture を迂回する。

## 7. 検証戦略

- **Decision**: table-driven Unit Test で有効 value、同名を想定した別 value、空・未知 value、出力が `pd` だけであること、不変性を検証する。component/page test でカードセット名だけの操作、`/` と `/restrictions`、desktop/mobile、無効 row の非遷移、同一カードセットの location 一致を検証する。parser/E2E test で生成 URL の reload と新規閲覧状態から同一 `products` 条件が復元されることを確認し、既存 test・typecheck・lint・build を回帰 gate とする。
- **Rationale**: pure logic、UI boundary、repository 全体の三層で Constitution の Testability と既存動作維持を確認できる。
- **Alternatives considered**: snapshot のみでは click target と query の意味を十分検証できない。手動確認のみでは同名・無効値の回帰を防げない。

すべての技術的未確定事項は解消済みである。
