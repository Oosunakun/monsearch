# Research: Short UUID検索条件の形式判定

## 調査範囲

既存の `cardSearchQuerySchema`、Parser/Builder、検索本体、Query Data Specification、検索ParameterのMock値とテストをリポジトリ内で確認した。外部ライブラリや外部仕様の追加調査は不要だった。

## Decision: 形式判定を共有する単一の5桁定義とする

`SHORT_UUID_LENGTH = 5` と、ASCII hexadecimalを大文字小文字非区別で検証して小文字化する共有ヘルパーを `app/utils/search/cardSearchQuerySchema.ts` 周辺に追加する。対象Parameterの一覧も同じ場所で型付き定義する。

## Rationale

現在のParser/Builderは `Set` のmembershipで値を受理しているため、master dataから消えた値や未投入値を保持できない。5桁canonical値をSearchFormへ渡すことで、形式処理を既存server-side searchへ最小限の変更で接続する。なお、ct / fa / ra の名称fallback、re / are のAffinity照合、Natural Key semanticsなど、Parameterごとの既存server-side検索意味論は今回の調査・設計で変更しない。桁数をParser、Builder、データ検証で個別に持つと将来変更時に不整合になるため、定数とヘルパーを共有する。

## Decision: Parserは形式上有効な未知値を保持する

対象8 aliasでは、query値をcomma collectionとして分解・trimし、形式validatorを通った値だけを小文字canonical化して重複排除する。選択肢Setは対象Parameterの形式判定には使わない。不正形式は従来どおり除外する。

## Rationale

仕様は存在性と形式を分離し、未知だが形式上有効な値をvalidation failureにせず保持し、既存のParameter固有server-side semanticsへ渡すことを要求する。ID照合を行う既存semanticsでは対応IDとの一致がない値となるが、全8 aliasで必ず0件になることは今回保証しない。同一Parameter内の衝突確認は生成側責務なので、Parser/Builderは追加の衝突検出・解決を行わない。

## Decision: Builderも対象8 aliasだけをShort UUID正規化へ切り替える

対象フィールドは共有のShort UUID collection serializerで、形式不正を除外し、lowercase・重複排除・安定ソートを行う。対象外のNatural Key collectionは既存のallowed Set処理を維持する。

## Decision: Mock/ParameterデータはUUID末尾5桁へ更新する

`cardTypeItems.json`、`productItems.json`、`factionItems.json`、`raceItems.json`、`effectActivationTypeItems.json`、`resistanceItems.json`、`illustratorItems.json` と、これらの値を直接保持する既存のMock/fixtureを、5桁Short UUID仕様へ整合させる。illustrator dataも他のParameter dataと同じ形式検証・整合確認の対象とする。

## Alternatives considered

- 選択肢Setを拡張して未知値を追加する: master dataの存在性と形式を再び結合するため不採用。
- 任意長のhexを受理する: 現行仕様が5桁固定であり、不正形式を通すため不採用。
- 検索本体で短縮値を別の検索キーへ変換する: URL復元時の保持責務と検索評価責務が混ざり、今回対象外の既存server-side検索意味論を変更するため不採用。
- Parameterごとに桁数定数を持つ: 将来変更時の不整合を生むため不採用。
