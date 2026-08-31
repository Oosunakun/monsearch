# Phase 0 Research: Quick Search URL Query Builder

## Canonical query 表現

- **Decision**: `docs/architecture/query_specification.md` version 1.0.0 を authority とし、選択 target に応じて `nm`、`att`、`kw` のいずれか最大1つを持つ Vue Router-compatible logical query object を生成する。version parameter は追加しない。
- **Rationale**: approved specification は3 alias を stable identifier として定義し、同じ条件から同じ canonical representation を生成することを要求している。
- **Alternatives considered**: 現行の `pool`、`type`、`q` を維持する案は承認済み語彙に違反するため採用しない。JSON payload と独自 query string 組立ても human readability と既存 router integration を損なうため採用しない。

## Pure transformation boundary

- **Decision**: `Readonly<QuickSearchState>` を受け、typed logical query を返す pure builder を `app/utils/search/` に作成する。`useQuickSearch` は state normalization を行わず builder output を `/cards` navigation へ渡す。
- **Rationale**: normalization と routing を分離すると、immutability、mapping、omission、determinism を framework 非依存 Unit Test で検証できる。QuickSearch 専用 builder と SearchForm 用 `buildCardSearchQuery` は異なる UI state の adapter として独立させ、どちらも共通の Logical URL Query 表現を出力する。これにより、今後 `/cards` 側は入力元を判別せず URL query のみを読み取れる。
- **Alternatives considered**: `runQuickSearch` 内の inline mapping は testability と再利用性が低い。既存 `buildCardSearchQuery` へ統合する案や、そのために一時的な `SearchForm` を構築する案は、QuickSearch にない多数の field/default と結合して各 builder の入力変換責務を曖昧にするため採用しない。

## 対象 component

- **Decision**: 本 feature の UI integration 対象は、`AppHeader.vue` と `AppNavigationDrawer.vue` が共通利用する `app/components/layout/QuickSearchBar.vue` とする。
- **Rationale**: PC 向け header と mobile 向け navigation drawer の簡易検索は同一 component と `useQuickSearch` を共有しており、この境界へ builder を接続すれば両動線に同じ変換規則を適用できる。
- **Alternatives considered**: header と navigation drawer に個別の変換を実装する案は、同一 UI component に対して mapping と omission rules を重複させるため採用しない。

## Target と alias の型

- **Decision**: UI がサポートする target を `'name' | 'race-type' | 'keyword'` の literal union として定義し、target-to-alias mapping を exhaustive な定数で表す。logical card query の approved vocabulary に `att` を追加するが、detailed-search form/parser の field は追加しない。
- **Rationale**: 現行の `string` は未対応値を許す。literal union と `Readonly<Record<QuickSearchTarget, ...>>` は mapping 漏れを compile time で検出できる。`att` は既に approved specification の alias である。
- **Alternatives considered**: 未対応 target を `name` へ fallback する案は FR-008 に違反する。詳細検索 `SearchForm` に archetype field を追加する案は feature scope を越える。

## Normalization と omission

- **Decision**: string である `searchText` に `trim()` を適用して両端 whitespace のみ除去し、結果が空なら `{}` を返す。内部 whitespace、Unicode、emoji、`=`, `,`, `:` などは logical value のまま保持する。未対応・空 target や runtime 上の非 string text も `{}` とし、元 state は変更しない。
- **Rationale**: primitive omission rule と feature edge cases を満たし、文字列の意味を保存する。raw text の percent-encoding は Vue Router が担当する。
- **Alternatives considered**: 内部 whitespace の collapse、Unicode normalization、手動 `encodeURIComponent` は requirement にない意味変更または double encoding を招くため採用しない。

## Card pool の扱い

- **Decision**: `selectedCardPool` は builder input には残すが output しない。
- **Rationale**: 現行 UI state に存在する一方、approved Query Specification に `pool` alias はなく、feature assumption も query 非出力を明示している。
- **Alternatives considered**: 現行 `pool=open`/`neo-stand` を残す案と別 alias を新設する案は FR-014 に違反するため採用しない。

## Navigation と encoding

- **Decision**: 有効 condition があれば `router.push({ path: '/cards', query })`、空なら `router.push({ path: '/cards' })` を呼ぶ。logical value を事前 encode せず Vue Router に委譲する。
- **Rationale**: detailed-search navigation と同じ location object pattern を保ち、Unicode と reserved punctuation の percent-encoding/decoding を framework に一元化する。bare `/cards` は空 parameter を防ぐ。
- **Alternatives considered**: URL string concatenation と builder 内 encoding は framework の責務と重複し、escaping error や double encoding の危険がある。

## Testing strategy

- **Decision**: Vitest table-driven tests で3 target mapping、trim、内部空白、Unicode/emoji/予約記号、空入力、未知 target、card pool omission、immutability、同一入力100回の deterministic output を検証する。routing boundary test で query あり/なしの `router.push`、memory router test で logical value の round trip を検証し、full test、typecheck、lint、build を final gates とする。
- **Rationale**: pure tests で semantic matrix を高速に網羅し、少数の integration tests で Vue Router handoff と encoding boundary を保護できる。
- **Alternatives considered**: E2E-only は失敗原因の切り分けが難しく、snapshot-only は mapping と omission の意図を十分に示さない。property-based testing は今回の固定3 target に対して dependency と保守 cost が過大である。

Phase 0 で特定した不明点は上記の決定で解消済みであり、`NEEDS CLARIFICATION` は残っていない。
