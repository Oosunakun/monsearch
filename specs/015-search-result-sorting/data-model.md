# データモデル: 検索結果の並び順

**日付**: 2026-10-29／D1・D2承認反映済み、統合Human Reviewの完了確認待ち。Schema変更・migrationなし。

## 既存モデルと参照先

基準は[Card型](../../types/cards/finderCards.ts)、[共有型](../../shared/cardSearch/types.ts)、[loader](../../app/utils/cardSearchDataset.ts)。JSON正本は変更しない。

| UI順 | 表示名 | sort key | ユニット側 | 装備品側 |
|---|---|---|---|---|
| 1 | カードNo | `id`（既存） | `card.card_id`の既存比較 | 全カード共通 |
| 2 | レベル | `level`（新規） | `card.unit?.level` | 使用しない |
| 3 | 攻撃力 | `atk`（既存・意味拡張） | `card.unit?.attack` | `card.item?.equip?.attack` |
| 4 | 防御力 | `defense`（新規・D1承認済み） | `card.unit?.defense` | `card.item?.equip?.defense` |
| 5 | イニシアチブ | `initiative`（新規） | `card.unit?.ability?.initiative` | `card.item?.equip?.ability?.initiative` |
| 6 | 出現頻度 | `rarity`（既存） | `card.rarity_code`の既存順位 | 全カード共通 |

既存型ではlevel/attack/defenseは親がある場合number、Ability.initiativeはnumberまたはnull。親のnull・能力のnull・対象値の不存在は値なし。0はtruthy判定せず数値として採用する。型をnullableへ拡張して入力Schemaを変える必要はない。未定義の値はoptional参照で欠損として扱い、文字列の数値化・NaN補正等の新しいデータ修復規則は導入しない。

## 比較用の一時概念

- `SourceCard`: `{ card, sourceIndex }`。sourceIndexは正本配列順から作る既存識別情報。現在の検索結果配列内のindexで振り直さない。
- 数値比較は一時的な「groupとvalue」で表現する。group=0は対象値ありのunit、group=1は対象値ありのequip、group=2は値なし。levelではgroup=1なし。
- unitの対象値が非null/非undefinedならgroup=0、そうでなくequipの対象値があればgroup=1、それ以外group=2。通常データは分類詳細が一つだけだが、両方が存在する合成例でもこの優先順位となり、加算しない。
- group差は常に昇順。同groupの数値差だけasc/desc。値が同じ、または両方値なしならsourceIndex昇順。
- この一時概念をJSON・DTO・Vue stateへ追加しない。小さなsort内の関数で十分で、索引や永続キャッシュは不要。

## 入出力と状態遷移

`CardSearchSortKey`は`id | level | atk | defense | initiative | rarity`。`CardSearchSortOrder`は既存`asc | desc`。sort key `defense`は検索条件のURL alias `df`とは別であり、検索条件の仕様は変更しない。

`prepareCardSearch`が許可定数を使ってsort/orderを独立に補正する。配列入力の末尾採用等、現在の入力処理は維持する。`runCardSearch`がfilter後の全件をsortし、paginateと既存projectionを適用する。

初期id/asc → 項目・方向変更（page=1、perPage保持）→ ページ移動（sort/order保持）。perPage変更はpage=1。0件時page=1/totalPages=1、範囲外pageは既存clamp。ready・リクエスト世代・unmount・retryの意味は変更しない。

結果DTOは既存フィールドを維持し、`sort.key`の許可値だけ増える。ソートを変えるとitemsのページ構成は変わるが、IDごとの完全DTO、全ページのID集合、totalCount、categoryBreakdownは不変。categoryBreakdownはソート結果ではなくmatched順から作る現行処理を維持する。
