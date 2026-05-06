# カード検索画面の構成

## 現在のページ遷移
```
  { label: 'カードリスト', to: '/cards' },
  { label: '詳細検索', to: '/cards/search' },
  { label: '使用制限', to: '/restrictions' },
  { label: 'ルール', to: '/rules' },
  { label: '大会情報', to: '/tournaments' },
  { label: 'About', to: '/about' }
```
## 補足情報


[カード検索アプリ - ルート]
│
├─ 1. カードセット（LP）
│     └─ カードセット一覧
│        ├─ [カードセット略称](short_name)
│        ├─ [カードセット名](product_name)
│        ├─ [備考](product_note)
│        └─ [発売日](release_date)
│
├─ 2. 詳細検索
│     ├─ 検索フォーム
│     │  ├─ 基本検索
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [属性](element)
│     │  │  ├─ [種族/タイプ](archetype)
│     │  │  └─ [キーワード](keyword)
│     │  │
│     │  ├─ 詳細検索
│     │  │  ├─ [進軍タイプ](move_type)
│     │  │  ├─ [レベル/リミット](level)
│     │  │  ├─ [英雄点](hero_point)
│     │  │  ├─ [攻撃力](attack)
│     │  │  ├─ [防御力](defense)
│     │  │  ├─ [イニシアチブ](initiative)
│     │  │  ├─ [チャージ](charge)
│     │  │  ├─ [ディフェンダー](defender)
│     │  │  ├─ [耐性](affinity)
│     │  │  ├─ [アイテム枠/コスト](ability_slot_item)
│     │  │  ├─ [戦闘スペル枠/コスト](ability_slot_spell)
│     │  │  ├─ [特殊能力](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  ├─ [カード効果宣言タイミング](effect_activation_timing)
│     │  │  │  └─ [カード効果タイプ](effect_type)
│     │  │  └─ [特殊条件](specific)
│     │  │     └─ [枠がないユニット](banilla)
│     │  │
│     │  └─ その他検索
│     │     ├─ [勢力](faction)
│     │     ├─ [ブロック](block)
│     │     ├─ [カードセット](product)
│     │     ├─ [出現頻度](rarity)
│     │     ├─ [イラストレーター](illustrator)
│     │     └─ [カードNo/整理番号](reference_label)
│     │
│     ├─ 検索結果
│     │  ├─ [ユニット](unit)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [属性](element)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [レベル](level)
│     │  │  ├─ [即時召喚](is_instant_summon)
│     │  │  ├─ [英雄点](hero_point)
│     │  │  ├─ [攻撃力](attack)
│     │  │  ├─ [防御力](defense)
│     │  │  ├─ [進軍タイプ](move_type)
│     │  │  ├─ [種族](race)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [イニシアチブ](initiative)
│     │  │  ├─ [チャージ](charge)
│     │  │  ├─ [ディフェンダー](defender)
│     │  │  ├─ [耐性](affinity)
│     │  │  ├─ [アイテム枠](ability_slot_item)
│     │  │  ├─ [戦闘スペル枠](ability_slot_spell)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  ├─ [戦闘スペル](spell)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [属性](element)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  ├─ [アイテム](item)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [アイテム分類](item_category)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [攻撃力](attack)
│     │  │  ├─ [防御力](defense)
│     │  │  ├─ [種族](race)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [イニシアチブ](initiative)
│     │  │  ├─ [チャージ](charge)
│     │  │  ├─ [ディフェンダー](defender)
│     │  │  ├─ [耐性](affinity)
│     │  │  ├─ [アイテム枠](ability_slot_item)
│     │  │  ├─ [戦闘スペル枠](ability_slot_spell)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  ├─ [儀式スペル](ritual)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  ├─ [地形](land)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [地形分類](land_category)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [リミット](limit)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  ├─ [召喚術師](summoner)
│     │  │  ├─ [カード分類](card_category)
│     │  │  ├─ [カード名](name)
│     │  │  ├─ [整理番号](product_note)
│     │  │  ├─ [タイプ](type)
│     │  │  ├─ [カード効果](effects)
│     │  │  │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │  │  │  └─ [カード効果テキスト](effect_text)
│     │  │  └─ [出現頻度](rarity)
│     │  └─ [その他](others)
│     │     ├─ [カード分類](card_category)
│     │     ├─ [属性](element)
│     │     ├─ [カード名](name)
│     │     ├─ [整理番号](product_note)
│     │     ├─ [レベル](level)
│     │     ├─ [即時召喚](is_instant_summon)
│     │     ├─ [英雄点](hero_point)
│     │     ├─ [攻撃力](attack)
│     │     ├─ [防御力](defense)
│     │     ├─ [進軍タイプ](move_type)
│     │     ├─ [種族](race)
│     │     ├─ [タイプ](type)
│     │     ├─ [イニシアチブ](initiative)
│     │     ├─ [チャージ](charge)
│     │     ├─ [ディフェンダー](defender)
│     │     ├─ [耐性](affinity)
│     │     ├─ [アイテム枠](ability_slot_item)
│     │     ├─ [戦闘スペル枠](ability_slot_spell)
│     │     ├─ [カード効果](effects)
│     │     │  ├─ [カード効果有効時期分類](effect_activation_category)
│     │     │  └─ [カード効果テキスト](effect_text)
│     │     └─ [出現頻度](rarity)
│     │
│     └─ カード詳細
│        ├─ [属性](element)
│        ├─ [英雄点](hero_point)
│        ├─ [レベル](level)
│        ├─ [攻撃力](attack)
│        ├─ [防御力](defense)
│        ├─ [進軍タイプ](move_type)
│        ├─ [カード分類](card_category)
│        ├─ [カード名](name)
│        ├─ [種族](race)
│        ├─ [タイプ](type)
│        ├─ [イニシアチブ](initiative)
│        ├─ [チャージ](charge)
│        ├─ [ディフェンダー](defender)
│        ├─ [耐性](affinity)
│        ├─ [アイテム枠](ability_slot_item)
│        ├─ [戦闘スペル枠](ability_slot_spell)
│        ├─ [カード効果](effects)
│        │  ├─ [カード効果有効時期分類](effect_activation_category)
│        │  └─ [カード効果テキスト](effect_text)
│        ├─ [出現頻度](rarity)
│        ├─ [ブロック](product_note)
│        ├─ [整理番号](product_note)
│        ├─ [イラストレーター](product_note)
│        └─ [収録カードセット](product_note)
│
├─ 3. 使用制限リスト
│     ├─ 注意事項
│     ├─ 構築条件
│     │  ├─ 概要
│     │  ├─ 使用できるカードセット
│     │  ├─ 禁止カード
│     │  └─ 制限カード
│     └─ アーカイブ
│        └─ 過去の構築条件
│
├─ 4. ルール
│     ├─ 注意事項
│     ├─ カード解釈と読み替え
│     │  ├─ カードの読み替え
│     │  ├─ エラッタ
│     │  │  ├─ [掲載日](post_date)
│     │  │  ├─ [対象カード](card_name)
│     │  │  ├─ [適用開始日](effective_date)
│     │  │  ├─ [修正内容](erratta_text)
│     │  │  └─ [修正理由](revision_reason)
│     │  └─ Q&A
│     │  │  ├─ [掲載日](post_date)
│     │  │  ├─ [対象カード](card_name)
│     │  │  ├─ [質問](question)
│     │  │  └─ [回答](answer)
│     └─ アーカイブ
│        └─ カード解釈と読み替え
│
├─ 5. 大会情報
│     └─ カード大会カレンダーへのリンク or 画面埋め込み
│        └─ 大会カレンダー(https://calendar.google.com/calendar/newembed?src=cWN1NzB1a3NrOGZlbTIxbHNjcGQ5Z3ZlM2NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=anJjbnM0dmdidGc1YmpmdmYydXF2dTZmY2NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23D50000&color=%237CB342&color=%23009688&showTitle=1&showNav=1&showTz=1&showCalendars=1&showTabs=1&title=%E3%83%A2%E3%83%B3%E3%82%B3%E3%83%AC%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB)
│
└─ 6. About
      ├─ 免責事項
      ├─ このサイトについて
      ├─ 謝辞
      ├─ 更新履歴
│     │  ├─ [更新日付](released_at)
│     │  ├─ [バージョン](version)
│     │  └─ [更新内容](release_notes)
      ├─ リンク
      └─ お問い合わせ

# メニュー

[カード検索アプリ - メニュー]
│
├─ 1. カードセット
├─ 2. 詳細検索
├─ 3. 使用制限
├─ 4. ルール
├─ 5. 大会情報
└─ 6. About

```