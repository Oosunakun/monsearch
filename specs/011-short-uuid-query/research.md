# Research: Short UUID検索条件の形式判定

## 調査範囲

既存の `cardSearchQuerySchema`、Parser/Builder、検索本体、Query Data Specification、検索ParameterのMock値とテストをリポジトリ内で確認した。外部ライブラリや外部仕様の追加調査は不要だった。

## Decision: 形式判定を共有する単一の5桁定義とする

`SHORT_UUID_LENGTH = 5` と、ASCII hexadecimalを大文字小文字非区別で検証して小文字化する共有ヘルパーを `app/utils/search/cardSearchQuerySchema.ts` 周辺に追加する。対象Parameterの一覧も同じ場所で型付き定義する。

## Rationale

現在のParser/Builderは `Set` のmembershipで値を受理しているため、master dataから消えた値や未投入値を保持できない。検索本体の `includesAny` は既にcase-insensitiveかつ `endsWith` のため、5桁canonical値をSearchFormへ渡せば既存の検索意味論を保てる。桁数をParser、Builder、データ検証で個別に持つと将来変更時に不整合になるため、定数とヘルパーを共有する。

## Decision: Parserは形式上有効な未知値を保持する

対象8 aliasでは、query値をcomma collectionとして分解・trimし、形式validatorを通った値だけを小文字canonical化して重複排除する。選択肢Setは対象Parameterの形式判定には使わない。不正形式は従来どおり除外する。

## Rationale

仕様は存在性と形式を分離し、未知だが形式上有効な値を非ヒット条件として保持することを要求する。同一Parameter内の衝突確認は生成側責務なので、Parser/Builderは追加の衝突検出・解決を行わない。

## Decision: Builderも対象8 aliasだけをShort UUID正規化へ切り替える

対象フィールドは共有のShort UUID collection serializerで、形式不正を除外し、lowercase・重複排除・安定ソートを行う。対象外のNatural Key collectionは既存のallowed Set処理を維持する。

## Decision: Mock/ParameterデータはUUID末尾5桁へ更新する

`cardTypeItems.json`、`productItems.json`、`factionItems.json`、`raceItems.json`、`effectActivationTypeItems.json`、`resistanceItems.json` と、これらの値を直接保持する既存のMock/fixtureを、対応するfull UUIDの末尾5桁へ整合させる。`illustratorItems.json` が空であることは変更せず、実カードのillustrator UUIDは検索照合元として維持する。

## Alternatives considered

- 選択肢Setを拡張して未知値を追加する: master dataの存在性と形式を再び結合するため不採用。
- 任意長のhexを受理する: 現行仕様が5桁固定であり、不正形式を通すため不採用。
- 検索本体で短縮値を5桁へ変換する: URL復元時の保持責務と検索評価責務が混ざり、既存後方一致の意味論を変更するため不採用。
- Parameterごとに桁数定数を持つ: 将来変更時の不整合を生むため不採用。
