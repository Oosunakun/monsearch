# Contract: Short UUID Card Search Query

## Accepted values

`ct`、`pd`、`fa`、`ra`、`il`、`eat`、`re`、`are` はcomma-separated valuesを受理する。各値は5文字ちょうどのASCII hexadecimalでなければならない。`0-9`、`a-f`、`A-F` を受理し、Collection member前後の空白は既存のcollection parsing rulesに従う。

## Canonical output

canonical Builder outputは英字を小文字化し、形式不正memberを除外し、canonical値の重複を除外し、既存のstable collection orderingを使用する。例: 両方が有効なら `pd=22D7E,abcde` は `pd=22d7e,abcde` になる。

## Unknown but valid values

有効な5文字値は、現在のmaster dataに対応する値がない場合でも保持し、validation failureとして扱わない。値は既存server-side searchのParameter固有のID mappingや名称・category・affinity等の意味論へ渡される。ID照合を行う既存semanticsでは対応IDとの一致がない値となるが、全alias共通で非ヒット（0件）になることはこのFeatureの保証範囲に含めない。他の有効memberは同一Parameterの既存OR behaviorを継続する。

## Invalid values and collisions

桁数違い、非ASCII-hex文字、空memberは除外する。アプリケーションは1つのParameterが参照するID間のcollisionを検出・報告・解決しない。一意性はproducer-side invariantである。

## Compatibility

8つのShort UUID alias以外は既存のparsing、canonicalization、search semanticsを維持する。さらに、Short UUID aliasであっても、ct / fa / ra の名称fallback、re / are のAffinity照合、Natural Key semantics、その他の既存server-side search semanticsはこのFeatureで変更しない。URL percent encodingはVue Router/framework serializationの責務とする。
