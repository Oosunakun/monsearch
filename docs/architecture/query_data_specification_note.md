|Query Object Property|Query Object Name|Parameter Alias|Value Format|Database Table Relation|Database Column Relation|Type Supplementary|
|----|----|----|----|----|----|----|
|name|カード名|nm|Primitive|cards|cards.name|自由記述|
|cardCategory|カード分類|cc|Primitive|cards|cards.card_category_code|natural key|
|elements|属性|el|Collection|cards <- trait_elements|trait_elements.element_code|natural key|
|cardTypes|カードタイプ|ct|Collection|cards <- trait_card_types|trait_card_types.card_type_id|uuidv7|
|keyword|キーワード|kw|Primitive|cards <- card_search_catalog|card_search_catalog.full_text|自由記述|
|products|カードセット|pd|Collection|cards|cards.product_id|uuidv7|
|factions|勢力|fa|Collection|cards <- trait_factions|trait_factions.faction_id|uuidv7|
|blocks|ブロック|bl|Collection|cards <- trait_blocks|trait_blocks.block_code|natural key|
|level.filterType|レベル（Modifier）|lvm|Modifier|cards <- stat_unit|stat_unit.is_instant_summon|"all" , "include" , "exclude"|
|level|レベル|lv|Comparison|cards <- stat_unit|stat_unit.level|"gte" , "eq" , "lte"|
|heroPoint.filterType|英雄点（Modifier）|hem|Modifier|cards <- stat_unit|stat_unit.is_hero|"all" , "include" , "exclude"|
|heroPoint|英雄点|he|Comparison|cards <- stat_unit|stat_unit.hero_point|"gte" , "eq" , "lte"|
|attack|攻撃力|at|Comparison|cards <- stat_unit|stat_unit.attack|"gte" , "eq" , "lte"|
|defense|防御力|df|Comparison|cards <- stat_unit|stat_unit.defense|"gte" , "eq" , "lte"|
|moveTypes|進軍タイプ|mt|Collection|cards <- stat_unit|stat_unit.move_type_code|natural key|
|races|種族|ra|Collection|cards <- trait_races|trait_races.race_id|uuidv7|
|abilityItemSlots|アイテム枠|is|Pair Collection|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|natural key|
|abilityItemSlots.match|アイテム枠（Modifier）|ism|Modifier|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|"or" , "and" , "none"|
|abilitySpellSlots|戦闘スペル枠|ss|Pair Collection|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|natural key|
|abilitySpellSlots.match|戦闘スペル枠（Modifier）|ssm|Modifier|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|"or" , "and" , "none"|
|initiative|イニシアチブ|it|Comparison|cards <- feature_abilities|feature_abilities.initiative|"gte" , "eq" , "lte"|
|charge.filterType|チャージ（Modifier）|chm|Modifier|cards <- feature_abilities|feature_abilities.charge|"all" , "include" , "exclude"|
|charge|チャージ|ch|Comparison|cards <- feature_abilities|feature_abilities.charge|"gte" , "eq" , "lte"|
|defender.filterType|ディフェンダー（Modifier）|dem|Modifier|cards <- feature_abilities|feature_abilities.defender|"all" , "include" , "exclude"|
|defender|ディフェンダー|de|Comparison|cards <- feature_abilities|feature_abilities.defender|"gte" , "eq" , "lte"|
|resistances|耐性|re|Collection|cards <- feature_affinities|feature_affinities.affinity_id|uuidv7|
|additionalAttack|追加攻撃力|aat|Comparison|cards <- stat_item_equip|stat_item_equip.attack|"gte" , "eq" , "lte"|
|additionaldefense|追加防御力|adf|Comparison|cards <- stat_item_equip|stat_item_equip.defense|"gte" , "eq" , "lte"|
|additionalAbilityItemSlots|追加アイテム枠|ais|Pair Collection|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|natural key|
|additionalAbilityItemSlots.match|追加アイテム枠（Modifier）|aism|Modifier|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|"or" , "and" , "none"|
|additionalAbilitySpellSlots|追加戦闘スペル枠|ass|Pair Collection|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|natural key|
|additionalAbilitySpellSlots.match|追加戦闘スペル枠（Modifier）|assm|Modifier|cards <- feature_ability_slots|feature_ability_slots.ability_slot_type_code|"or" , "and" , "none"|
|additionalInitiative|追加イニシアチブ|ait|Comparison|cards <- feature_abilities|feature_abilities.initiative|"gte" , "eq" , "lte"|
|additionalCharge.filterType|追加チャージ（Modifier）|achm|Modifier|cards <- feature_abilities|feature_abilities.charge|"all" , "include" , "exclude"|
|additionalCharge|追加チャージ|ach|Comparison|cards <- feature_abilities|feature_abilities.charge|"gte" , "eq" , "lte"|
|additionalDefender.filterType|追加ディフェンダー（Modifier）|adem|Modifier|cards <- feature_abilities|feature_abilities.defender|"all" , "include" , "exclude"|
|additionalDefender|追加ディフェンダー|ade|Comparison|cards <- feature_abilities|feature_abilities.defender|"gte" , "eq" , "lte"|
|additionalResistances|追加耐性|are|Collection|cards <- feature_affinities|feature_affinities.affinity_id|uuidv7|
|limit|リミット|lm|Comparison|cards <- stat_land|stat_land.number|"gte" , "eq" , "lte"|
|landCategory|地形分類|lc|Primitive|cards <- stat_land|stat_land.land_category_code|natural key|
|costItemSlots|コスト（アイテム）|cis|Pair Collection|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|natural key|
|costItemSlots.match|コスト（アイテム）（Modifier）|cism|Modifier|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|"or" , "and" , "none"|
|costSpellSlots|コスト（戦闘スペル）|css|Pair Collection|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|natural key|
|costSpellSlots.match|コスト（戦闘スペル）（Modifier）|cssm|Modifier|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|"or" , "and" , "none"|
|costOtherEntities|コスト（その他）|coe|Pair Collection|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|natural key|
|costOtherEntities.match|コスト（その他）（Modifier）|coem|Modifier|cards <- feature_effects <- effects <- effect_costs|effect_costs.effect_cost_text|"or" , "and" , "none"|
|effectTypes|カード効果タイプ|eft|Collection|cards <- feature_effects <- effects|effect_costs.effect_type_code|natural key|
|effectActivationTypes|カード効果宣言タイミング|eat|Collection|cards <- feature_effects <- effects|effects.effect_activation_type_id|uuidv7|
|effectActivationCategories|カード効果有効時期分類|eac|Collection|cards <- feature_effects <- effects|effects.effect_activation_category_code|natural key|
|effectText|カード効果テキスト|etx|Primitive|cards <- feature_effects <- effects|effects.effect_text|自由記述|
|rarities|出現頻度|rt|Collection|cards|cards.rarity_code|natural key|
|illustrators|イラストレーター|il|Collection|cards|cards.illustrator_id|uuidv7|
|referenceLabel|カードNo（整理番号）|rl|Primitive|cards|cards.reference_label|自由記述|
|archetypeText|種族・タイプ|att|Primitive|cards <- card_search_catalog|card_search_catalog.archetype_text|自由記述|
