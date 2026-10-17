# Quickstart: デック制限Chipの検証

## 用途

本書は、承認済みの仕様・設計に基づき、Implementationでの検証準備とVerificationで利用する手順である。

## 実装前の比較基準（T001）

- 基準commit: `f21816f5ed8b75abd2e30c58e692c2ae3a4088e8`
- `cards.json` SHA-256: `88dada8cd5ab6cae3c9fb3ea8a3fe810234c1e3a8532f8fb6e2d3929a828a174`
- 保存先: [verification/api-baseline.json](verification/api-baseline.json)。実装前の実handlerから取得した16 queryの全レスポンスを保持する。
- query: 代表5カードの名前検索、`cc=unit&lv=gte:3`、0件検索、`id/rarity/atk` の昇順・降順、`page=2` と `perPage=20/50/100`。正確なqueryは保存ファイルの各 `cases[].query` に記録する。
- 取得検証: 実handlerを呼ぶ一時テスト1件が成功。保存後に一時テストは削除。

## 検証環境

Node.js・repository dependenciesが利用可能で、既存のNuxt内部API `/api/cards` がFeature実装後に各itemへ必須の `deck_restriction_count: number | null` を返すこと。唯一の入力は `cards.json` のカード自身の `modification.deck_restriction_count` とする。

## 実データでの検証

調査時点の `cards.json` は0が6件、1が25件、2が1件、空文字が31件、`modification: null` が419件。3以上と値のnullは追加fixtureで確認する。

| カード / 整理番号 | Source | API期待値 | UI期待値 |
|---|---|---|---|
| ラプラース / `M20E-002` | `0` | `0` | 禁止 |
| ホーリー・フェニックス / `M20E-041` | `1` | `1` | 1枚制限 |
| スペクター / `M20E-073` | `2` | `2` | 2枚制限 |
| アーニャ / `M20A-001` | 空文字 | `null` | Chipなし |
| サラマンダー / `M20A-007` | `modification: null` | `null` | Chipなし |

Implementation後に開発serverを起動する。

```powershell
npm run dev
```

別のPowerShellから代表カードを確認する。

```powershell
$deckRestrictionName = 'ラプラース'
$deckRestrictionUri = "http://localhost:3000/api/cards?nm=$([uri]::EscapeDataString($deckRestrictionName))"
$deckRestrictionResponse = Invoke-RestMethod -Uri $deckRestrictionUri
$deckRestrictionResponse.items | Select-Object card_id, reference_label, name, deck_restriction_count
```

表の他のカードも同様に確認する。同名カードがある場合は `reference_label` で確認対象を識別する。この番号は検証対象の識別に使い、別JSONとのjoinには使わない。

## 追加fixtureによる検証

後続工程で、実データのカードを複製したメモリ上のfixtureを既存projection/APIテストへ渡す。元の `cards.json` は編集しない。Componentテストには対応するDTOを渡す。

| 追加fixtureのSource | API期待値 | Chip期待値 |
|---|---|---|
| 数値 `0` | `0`（項目も保持） | 禁止 |
| 数値 `1` | `1` | 1枚制限 |
| 数値 `2` | `2` | 2枚制限 |
| 数値 `3` | `3` | なし |
| 数値 `4`（3を超える例） | `4` | なし |
| 値が `null` | `null` | なし |
| 値が空文字 `""` | `null`（0にしない） | なし |
| `modification: null` | `null` | なし |

- 全itemに項目があり、数値0をnull化・省略しないこと、3以上を変換しないことを確認する。
- 同名かつ異なるID・制限値のカードを用意し、それぞれ自身の値が表示されることを確認する。
- `modification_text` に条件や改訂説明が含まれていても、解析・表示されず枚数Chipだけが表示されることを確認する。
- `is_deck_restriction_lifted` を参照する制御が追加されていないことをコードレビューで確認する。現データはすべて0であり、別の値の意味は今回定義しない。

## 自動検証（Implementation後）

正規化とAPIレスポンスの検証を追加した後、関連testsを実行する。

```powershell
npx vitest run server/utils/cardSearch/project.test.ts server/api/cards.get.test.ts server/utils/cardSearch/search.test.ts server/utils/cardSearch/sort.test.ts server/utils/cardSearch/paginate.test.ts
```

実装時に追加するヘッダーまたは専用Componentのテストも実行し、表の全ケースのChip文言・非表示を確認する。

## 検索・sort・paginationの回帰確認

- 同じデータ・queryで追加前後のAPI結果を比較する。新フィールドのみを除外した結果が一致し、カードID・順序、`totalCount`・`categoryBreakdown`・`page`・`perPage`・`totalPages`・`sort` が変化しないことを確認する。
- 名前検索・既存の詳細検索条件、各sort keyの昇順・降順、ページ切替・表示件数切替を確認する。URL Queryの形式と値、ブックマークからの表示が維持されることを確認する。
- 制限値がnullでも検索対象から除外されず、0件検索の既存表示も変化しないことを確認する。

## PC・モバイルのHuman Verification

PCとモバイルの両方で `/cards` の代表カードを表示する。ブラウザーのレスポンシブ表示または実機を利用する。

- ヘッダー付近で「禁止」「1枚制限」「2枚制限」を読める。
- Chipがカード名・既存情報に重ならず、長いカード名でも確認できる。
- 3以上・null・空文字・改訂情報nullではChipが表示されず、代替の不明・無制限表示も出ない。実データにないケースは追加fixtureを使ったComponent表示で確認する。
- ページ・表示順変更後も、各カードに対応するChipが表示される。
- 配置・配色等の詳細はここでHumanが確認し、調整する。

## 契約上の確認事項

今回の内部API Responseは [contracts/card-search-result.md](contracts/card-search-result.md) に従って確認する。009のOpenAPIと実装には既にnullable型等の不整合があるが、同期問題は今回のScope外の観測事項であり、009のOpenAPI更新を要求しない。同期完了を検証の前提条件にしない。外部サービスとのサーバー間API通信・外部向けREST APIの整備は検証対象外。

## 実施記録（2026-10-17）

- T004〜T006: 実装前に30テストを実行し、未実装のDTO項目とChipによる20件の失敗を確認した。
- T007〜T009: `node node_modules/vitest/vitest.mjs run server/utils/cardSearch/project.test.ts server/api/cards.get.test.ts app/components/cards/result/list/ItemHeader.test.ts` は3ファイル・30テスト成功。ローカルに導入済みのVitestを直接実行した。
- 実handlerで `M20E-002: 0`、`M20E-041: 1`、`M20E-073: 2`、`M20A-001: null`、`M20A-007: null` を確認。メモリfixtureの3・4・値のnull、既存500エラー契約も成功。
- T009完了時点ではPC・モバイルの目視確認とHuman Verificationは未実施だった。最終結果は下記T015に記録する。

### 回帰確認・型・lint（T013〜T014）

- `node node_modules/vitest/vitest.mjs run server/api/cards.get.test.ts app/components/cards/result/layout/ResultList.test.ts app/pages/cards/index.test.ts server/utils/cardSearch/search.test.ts server/utils/cardSearch/sort.test.ts server/utils/cardSearch/paginate.test.ts app/composables/useCardSearch.test.ts` を実行した。
- API・既存検索・sort・pagination・composableの5ファイルは成功。追加UIテストでVuetify injectionのmock漏れとNuxtによるComponent名変更に起因する3件の失敗があり、テスト側を修正した。
- `node node_modules/vitest/vitest.mjs run app/components/cards/result/layout/ResultList.test.ts app/pages/cards/index.test.ts` の再実行は2ファイル・6テスト成功。上記7ファイルの計113テストは修正後すべて成功した。
- 16 queryの基準レスポンスと、新項目のみを除いた実handlerのレスポンスは全件一致。既存itemの全フィールド、件数、カテゴリ別件数、順序、ページ情報を比較した。同名カード・異なる制限値のメモリfixtureもページ・sort変更後の対応を維持した。
- `node node_modules/nuxt/bin/nuxt.mjs typecheck` は終了コード0。
- `node node_modules/eslint/bin/eslint.js types/cards/finderCards.ts server/types/cardSearch.ts server/utils/cardSearch/project.ts server/utils/cardSearch/project.test.ts server/api/cards.get.test.ts app/components/cards/result/list/ItemHeader.vue app/components/cards/result/list/ItemHeader.test.ts app/components/cards/result/layout/ResultList.test.ts app/pages/cards/index.test.ts` は終了コード0。
- アプリケーションの変更はSource型・DTO・projection・ItemHeaderのみ。検索・sort・pagination・URL Query、Source JSON、009 OpenAPI、Spec Kit設定は変更していない。別JSONとのjoin、日付判定・バイパス、解除フラグ制御、説明文解析は追加していない。

### ブラウザー確認・Human Verification（T015）

- Edge headless、PC 1440×1100・モバイル390×844で実画面を確認した。`node specs/013-deck-restriction-display/verification/browser-check.mjs` は終了コード0。
- 0/1/2の実カードは期待どおりのChip、空文字・modification nullの実カードはChipなし。長いカード名「ムーンライト・チャージャー」も確認した。カード名・既存情報とChipの重なりは見られなかった。
- ブックマークURL `?sort=id&order=desc&page=2&perPage=20` は再読込後も維持された。記録は [browser-results.json](verification/browser-results.json)。
- `node specs/013-deck-restriction-display/verification/browser-operations.mjs` は終了コード0。PCの次ページ・sort・表示件数変更、モバイルの次ページ操作で検索queryの保持とAPIへの引渡しを確認した。記録は [browser-operations.json](verification/browser-operations.json)。
- 実データにない3・4・値のnullは、ブラウザーの内部APIレスポンスをfixtureへ差し替えて確認した。0/1/2だけChipがあり、3/4/nullにはChipがない。[PC全ケース](verification/pc-all-counts.png)・[モバイル全ケース](verification/mobile-all-counts.png)。Source JSONやアプリにfixture用設定は追加していない。
- 代表画像: [PC・禁止](verification/pc-prohibited.png)、[PC・1枚](verification/pc-limit-one.png)、[PC・2枚](verification/pc-limit-two.png)、[PC・長い名前](verification/pc-long-name.png)、[モバイル・禁止](verification/mobile-prohibited.png)、[モバイル・1枚](verification/mobile-limit-one.png)、[モバイル・2枚](verification/mobile-limit-two.png)、[モバイル・長い名前](verification/mobile-long-name.png)。
- **Human Verification承認済み（2026-10-17）**。HumanがPC・モバイルのスクリーンショットを確認し、Chipの配置・配色・視認性を承認した。現在の表示デザインで問題なく、今回の追加UI修正は不要。細かなデザイン調整は後日Humanが行う。
- 最終状態: T001〜T015の全15タスク完了。自動テスト・型・lint・ブラウザー確認の記録に加え、Human本人による承認を記録した。今回の承認反映ではアプリケーションコードの変更やテストの再実行は行っていない。
- 開発serverでは既存のNuxt/Vuetify `useLayout` 重複警告と、Wranglerがユーザープロファイルのログ・registryへ書き込む際の `EPERM` を観測した。画面と内部APIの確認は実施できた。Sandbox外実行や権限変更は行っていない。
- `.specify/extensions.yml` を実行前後に確認した。`before_implement`・`after_implement` の登録はなく、実行対象フックはない。Workflow Runの開始・再開は行っていない。
