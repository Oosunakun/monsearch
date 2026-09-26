---
status: accepted
---

# コスト検索は構造化と検証を公開前提とする

コスト原文には選択・範囲・任意枠・説明中の記号などが混在し、現在のSchemaだけでは支払い要素と数量を十分に構造化して保持できない。部分的な解析結果で検索を公開すると、本来の一致を欠落させたり、未解析コストを「なし」と誤認したりするため、[Query Data Specification](../architecture/query_data_specification.md)でDomain Semanticsを定め、必要な構造化・検証が完了するまでコスト検索を公開対象にしない。

原文の構造化方式、Schema変更、migration、解析、人間による確認、未提供時応答と公開制御は別途設計する。「解析できた部分だけ検索する」「解析不能なら非ヒット」というfallbackは採用せず、個別の検索キーがないコストもDomain上の存在を保持する。

この判断は[Decision D47・D51・D52](../architecture/query_data_specification_note.md)に基づく。URL語彙の削除や特定の解析方式の採用を意味しない。現状のUI・APIはコスト条件を受理する一方で検索本体が評価していないため、既存URL・直接APIを含めた公開制御の改訂も必要となる。
