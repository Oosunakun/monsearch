# Phase 0 Research: 検索条件編集

## 編集条件の受け渡し

- **Decision**: 結果ページの現在の `route.query` を、Vue Router の location object `{ path: '/cards/search', query }` として編集ページへ引き継ぐ。
- **Rationale**: 現在の検索条件は既に URL に表現され、共有・bookmark・再読み込みの source of truth である。Vue Router に encoding と query 配列の保持を任せれば、手作業の URL 組立てを避けられる。
- **Alternatives considered**: Pinia や composable の memory state は再読み込み・共有に耐えないため不採用。session storage は新しい永続方式となり scope 外。結果ページで query を一度 form へ変換してから再構築する方式は、編集画面へ到達する前に未知値を失い責務を重複させるため不採用。

## 編集フォームの初期化境界

- **Decision**: `/cards/search` の setup 時に `useRoute().query` を `parseCardSearchQuery` へ渡し、返された完全な `SearchForm` で composable の `form.value` を初期化する。query が空でも同じ経路を使用する。
- **Rationale**: parser は `createSearchForm()` から開始し、全 field family、default、duplicate、不正値回復を既に型付きで実装している。空 query も全既定値になるため条件分岐を増やさず FR-002/004/009/012 を満たせる。
- **Alternatives considered**: 各 component 内で route query を読む方式は変換規則を分散させるため不採用。watch による継続同期は form 編集中に route 更新が起きた場合に入力を上書きし得るため、page instance の初期化だけを採用。

## Canonical round trip

- **Decision**: 編集後の検索は現行どおり `buildCardSearchQuery(form.value)` を使い、`/cards` へ navigation する。変更なしの場合も parse → build により意味的に同じ canonical query を得る。
- **Rationale**: feature 002 の builder/parser contract が、有効な値、zero、Unicode、default omission、compound condition、category applicability を既に規定・テストしている。編集機能はその contract を接続すべきであり、検索条件の意味を変更してはならない。
- **Alternatives considered**: 元 query へ差分 patch する方式は未知・不正値や解除済み条件を残し得るため不採用。raw query の再送は編集 form の変更と category applicability を反映できないため不採用。

## 不正値と未知値の扱い

- **Decision**: 編集画面への navigation では query を保持し、form 復元時に parser が alias 単位・value 単位で検証して無効部分だけを無視する。検索実行時には builder が復元・編集された有効状態だけを新しい query に含める。
- **Rationale**: 有効値を失わず編集を開始でき、再検索によって non-canonical・未知・不正な入力を自然に除去できる。画面全体を error にする必要がない。
- **Alternatives considered**: 不正値が1件でもあれば編集を拒否する方式は P3 に反する。未知 alias を hidden state として再送する方式は FR-010 と canonical output に反する。

## Ownership と mutation

- **Decision**: 結果ページの query は読み取り専用の入力として渡し、編集 page の `SearchForm` は新しく生成された独立 object とする。route query と result page の parsed state は変更しない。
- **Rationale**: 編集途中の状態が現在表示中の結果 location を遡及的に変えず、navigation と submit の時点だけで状態遷移を起こせる。
- **Alternatives considered**: route query object や parser の戻り値を複数画面で共有する方式は ownership が曖昧になり、意図しない mutation を招くため不採用。

## テスト戦略

- **Decision**: 結果側で query を保持した編集 navigation、検索側で全 family を含む初期復元・空 query・不正値混在・再送信を integration test で検証する。既存 parser/builder unit tests を回帰 gate として実行する。
- **Rationale**: 既存 unit tests が変換の網羅性を担保しているため、新規 test は page 間の wiring と user journey に集中できる。
- **Alternatives considered**: source text assertion だけでは実際の route input と form 描画/submit を検証できない。E2E のみでは failure の局所化が難しいため不採用。
