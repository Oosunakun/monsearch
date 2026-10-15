# Quickstart: デック制限Chipの検証

## 用途

本書は、承認済みの仕様・設計に基づき、Implementationでの検証準備とVerificationで利用する手順である。

## 前提

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
