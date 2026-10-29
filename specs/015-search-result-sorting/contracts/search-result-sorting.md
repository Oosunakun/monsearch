# 契約: 6項目ソートと表示状態

**状態**: 2026-10-29 D1・D2承認反映済み／Spec + Plan統合Human Reviewの完了確認待ち。実装済み契約ではない。

## 適用範囲

本契約は[spec.md](../spec.md)のFR-001〜008を共有runner、CSR UI、比較用APIへ適用する。対応キー・データ参照先は[data-model.md](../data-model.md)。Feature 009の[旧API契約](../../009-backend-card-search/contracts/card-search-api.openapi.yaml)に対するsort部分の差分であり、旧文書を上書きしない。API公開や動的検索の再採用を意味しない。

| 表示順 | 名称 | 許可キー |
|---|---|---|
| 1 | カードNo | id |
| 2 | レベル | level |
| 3 | 攻撃力 | atk |
| 4 | 防御力 | defense |
| 5 | イニシアチブ | initiative |
| 6 | 出現頻度 | rarity |

- directionはasc/desc。省略・不正値はsort=id、order=ascへ個別補正する。有効な他方をリセットしない。
- 検索条件Alias（lv/at/df/it等）とは別の表示制御。D1で確定したsort key `defense`はURL alias `df`と別概念であり、検索parser・URL Specificationへ新しいAliasを追加しない。
- CSRは内部表示stateをqueryへ重ねてrunnerを呼ぶ現行動作を維持する。URLのsort/orderを初回復元する機能、URL書込み、保存は追加しない。
- 比較APIは同じrunner・同じ補正・同じDTOを利用する。正常CSR検索からAPIへ通信せず、エラー時のAPI fallbackも追加しない。

## 比較規則

カードNoは`card_id.localeCompare`、出現頻度はBasic=1、Common=2、Uncommon=3、Rare=4、SuperRare=5、Special=6、DragonJr=7、Promotion=8、Summoner=9、未知=0。これらの主比較値に方向を適用し、同値はsourceIndex昇順を保持する。

4数値キーは値なし末尾。レベルはunitのみ、他3キーはunit有値→equip有値→値なしの順。group差とsourceIndex差に降順の符号を適用しない。数値差にのみ方向を適用し、0とNULLを区別する。

### 独立期待値の例

次の行順をsourceIndex=0〜8とする。ある数値項目についてUはunit、Eはequip、Nは値なし。sortへ渡す配列の順を意図的に崩してもsourceIndexで同値順を決める。

| 識別子 | group | 値 |
|---|---|---|
| N1 | 値なし | NULL |
| U0a | unit | 0 |
| E3 | equip | 3 |
| U5 | unit | 5 |
| E0 | equip | 0 |
| U0b | unit | 0 |
| Un | unit | -2 |
| En | equip | -1 |
| N2 | 値なし | 親なし |

- atk/defense/initiative昇順: **Un,U0a,U0b,U5,En,E0,E3,N1,N2**。
- atk/defense/initiative降順: **U5,U0a,U0b,Un,E3,E0,En,N1,N2**。
- levelは同じunit値だけを持つ別fixtureを使用する。昇順: **Un,U0a,U0b,U5,N1,E3,E0,En,N2**、降順: **U5,U0a,U0b,Un,N1,E3,E0,En,N2**。equip側の値はlevelに代用しない。
- rarityの未知2枚とBasic/ Summonerを混在させ、昇順は未知（source順）→Basic→Summoner、降順はSummoner→Basic→未知（source順）。
- idでは既存localeCompareの識別子順を維持し、reference_labelによる比較に変わっていないこと、同じcard_idでもsourceIndexが最終tie-breakであることを確認する。

NULLのinitiative、ability親なし、unit/equip親なし、全件値なし、0件・1件を独立して検証する。現在のSchemaでnumber必須のフィールドをnullへ変更する必要はなく、親なしで欠損を表現できる。

## 不変条件

- filter後の全件を並べてからpageを選ぶ。20/50/100件、先頭・中間・末尾・範囲外・0件を検証する。
- 全ページ連結は全件期待順序と一致する。カード集合・totalCount・totalPages（同perPage）・categoryBreakdown・IDごとのDTOは不変。
- 入力配列・card・criteriaは非破壊。document内JSON共有・新しいソート時のJSON再ダウンロード0件・通常検索API通信0件を維持する。
- UI両レイアウトに同じ名称・順序を表示。sort/order変更でpage=1、perPage維持。perPage変更ではsort/order維持、page=1。
- 既存の未知order/キー補正、retry、query履歴、ready後初回検索、世代管理、離脱保護に変更を加えない。

## 旧期待値との整合

`id`・`rarity`の比較規則は互換。`atk`キー名は互換だが、装備品値・欠損順位は承認された意図的な変更であり、旧応答順との互換を主張しない。

D2承認により、Feature 014のSpec・Plan・oracle・検証記録は変更しない。旧atk固定順序・ページhashは保全し、現在のテストコードが旧順序を要求する部分は015用の独立した新版期待値へ切り替え、検証範囲を維持する。旧ID集合・DTOは引き続き利用する。parityだけでは共有バグを検出できないため、上記手書き順序と不変項目の独立oracleを併用する。
