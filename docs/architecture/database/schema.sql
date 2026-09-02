PRAGMA foreign_keys = ON;

CREATE TABLE "stat_spell" (
  "card_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_item_consume" (
  "card_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_item_equip" (
  "card_id" TEXT NOT NULL,
  "attack" INTEGER,
  "defense" INTEGER,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_item_bullet" (
  "card_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_ritual" (
  "card_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_summoner" (
  "card_id" TEXT NOT NULL,
  "arcana" TEXT,
  "secondary_name" TEXT,
  "secondary_name_kana" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "elements" (
  "element_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "element_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("element_code"),
  UNIQUE ("element_name")
) WITHOUT ROWID;

CREATE TABLE "card_types" (
  "card_type_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_type_id"),
  UNIQUE ("card_type_name")
) WITHOUT ROWID;

CREATE TABLE "races" (
  "race_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "race_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("race_id"),
  UNIQUE ("race_name")
) WITHOUT ROWID;

CREATE TABLE "blocks" (
  "block_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "block_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("block_code"),
  UNIQUE ("block_name")
) WITHOUT ROWID;

CREATE TABLE "factions" (
  "faction_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "faction_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("faction_id"),
  UNIQUE ("faction_name")
) WITHOUT ROWID;

CREATE TABLE "product_categories" (
  "product_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "product_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("product_category_code"),
  UNIQUE ("product_category_name")
) WITHOUT ROWID;

CREATE TABLE "card_categories" (
  "card_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_category_code"),
  UNIQUE ("card_category_name")
) WITHOUT ROWID;

CREATE TABLE "item_categories" (
  "item_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "item_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("item_category_code"),
  UNIQUE ("item_category_name")
) WITHOUT ROWID;

CREATE TABLE "land_categories" (
  "land_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "land_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("land_category_code"),
  UNIQUE ("land_category_name")
) WITHOUT ROWID;

CREATE TABLE "move_types" (
  "move_type_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "move_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("move_type_code"),
  UNIQUE ("move_type_name")
) WITHOUT ROWID;

CREATE TABLE "rarities" (
  "rarity_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "rarity_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("rarity_code"),
  UNIQUE ("rarity_name")
) WITHOUT ROWID;

CREATE TABLE "illustrators" (
  "illustrator_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "illustrator_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("illustrator_id"),
  UNIQUE ("illustrator_name")
) WITHOUT ROWID;

CREATE TABLE "edit_statuses" (
  "edit_status_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "edit_status_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("edit_status_code"),
  UNIQUE ("edit_status_name")
) WITHOUT ROWID;

CREATE TABLE "provider_categories" (
  "provider_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "provider_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("provider_category_code"),
  UNIQUE ("provider_category_name")
) WITHOUT ROWID;

CREATE TABLE "providers" (
  "provider_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "provider_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("provider_code"),
  UNIQUE ("provider_name")
) WITHOUT ROWID;

CREATE TABLE "tag_categories" (
  "tag_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "tag_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("tag_category_code"),
  UNIQUE ("tag_category_name")
) WITHOUT ROWID;

CREATE TABLE "ability_slot_categories" (
  "ability_slot_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "ability_slot_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("ability_slot_category_code"),
  UNIQUE ("ability_slot_category_name")
) WITHOUT ROWID;

CREATE TABLE "affinity_categories" (
  "affinity_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "affinity_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("affinity_category_code"),
  UNIQUE ("affinity_category_name")
) WITHOUT ROWID;

CREATE TABLE "affinity_modifier_types" (
  "affinity_modifier_type_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "affinity_modifier_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("affinity_modifier_type_code"),
  UNIQUE ("affinity_modifier_type_name")
) WITHOUT ROWID;

CREATE TABLE "damage_sources" (
  "damage_source_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "damage_source_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("damage_source_code"),
  UNIQUE ("damage_source_name")
) WITHOUT ROWID;

CREATE TABLE "damage_attributes" (
  "damage_attribute_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "damage_attribute_name" TEXT NOT NULL,
  "is_effective_target" INTEGER NOT NULL,
  "is_affinity_target" INTEGER NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("damage_attribute_code"),
  UNIQUE ("damage_attribute_name")
) WITHOUT ROWID;

CREATE TABLE "effect_activation_categories" (
  "effect_activation_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_activation_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_activation_category_code"),
  UNIQUE ("effect_activation_category_name")
) WITHOUT ROWID;

CREATE TABLE "effect_activation_types" (
  "effect_activation_type_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_activation_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_activation_type_id"),
  UNIQUE ("effect_activation_type_name")
) WITHOUT ROWID;

CREATE TABLE "effect_activation_timings" (
  "effect_activation_timing_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_activation_timing_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_activation_timing_id"),
  UNIQUE ("effect_activation_timing_name")
) WITHOUT ROWID;

CREATE TABLE "effect_condition_categories" (
  "effect_condition_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_condition_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_condition_category_code"),
  UNIQUE ("effect_condition_category_name")
) WITHOUT ROWID;

CREATE TABLE "effect_types" (
  "effect_type_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_type_code"),
  UNIQUE ("effect_type_name")
) WITHOUT ROWID;

CREATE TABLE "effect_costs" (
  "effect_cost_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_cost_text" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_cost_id"),
  UNIQUE ("effect_cost_text")
) WITHOUT ROWID;

CREATE TABLE "effect_targets" (
  "effect_target_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_target_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_target_id"),
  UNIQUE ("effect_target_name")
) WITHOUT ROWID;

CREATE TABLE "effect_assignment_statuses" (
  "effect_assignment_status_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_assignment_status_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_assignment_status_code"),
  UNIQUE ("effect_assignment_status_name")
) WITHOUT ROWID;

CREATE TABLE "erratum_categories" (
  "erratum_category_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "erratum_category_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("erratum_category_id"),
  UNIQUE ("erratum_category_name")
) WITHOUT ROWID;

CREATE TABLE "card_layout_types" (
  "card_layout_type_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_layout_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_layout_type_code")
) WITHOUT ROWID;

CREATE TABLE "card_layout_orb_shapes" (
  "card_layout_orb_shape_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_layout_orb_shape_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_layout_orb_shape_code")
) WITHOUT ROWID;

CREATE TABLE "rulesets" (
  "ruleset_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "ruleset_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("ruleset_code")
) WITHOUT ROWID;

CREATE TABLE "card_lineages" (
  "card_lineage_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "lineage_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_lineage_id")
) WITHOUT ROWID;

CREATE TABLE "display_tokens" (
  "token_category" TEXT NOT NULL,
  "token_key" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "token_name" TEXT NOT NULL,
  "image_path" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("token_category", "token_key")
) WITHOUT ROWID;

CREATE TABLE "staging_sources" (
  "staging_source_id" TEXT NOT NULL,
  "raw_source" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "parsed_at" TEXT,
  "staging_source_note" TEXT,
  PRIMARY KEY ("staging_source_id")
) WITHOUT ROWID;

CREATE TABLE "card_search_catalog" (
  "card_id" TEXT NOT NULL,
  "full_text" TEXT NOT NULL,
  "archetype_text" TEXT,
  "body_text" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id")
) WITHOUT ROWID;

CREATE TABLE "stat_item" (
  "card_id" TEXT NOT NULL,
  "item_category_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id"),
  FOREIGN KEY ("item_category_code") REFERENCES "item_categories"("item_category_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "stat_land" (
  "card_id" TEXT NOT NULL,
  "land_limit" INTEGER,
  "land_category_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id"),
  FOREIGN KEY ("land_category_code") REFERENCES "land_categories"("land_category_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "stat_unit" (
  "card_id" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "is_instant_summon" INTEGER NOT NULL,
  "is_hero" INTEGER NOT NULL,
  "hero_point" INTEGER,
  "move_type_code" TEXT NOT NULL,
  "attack" INTEGER NOT NULL,
  "defense" INTEGER NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id"),
  FOREIGN KEY ("move_type_code") REFERENCES "move_types"("move_type_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "tags" (
  "tag_id" TEXT NOT NULL,
  "tag_category_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "tag_value" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("tag_id"),
  FOREIGN KEY ("tag_category_code") REFERENCES "tag_categories"("tag_category_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "ability_slot_types" (
  "ability_slot_type_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "ability_slot_category_code" TEXT NOT NULL,
  "ability_slot_type_name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("ability_slot_type_code"),
  UNIQUE ("ability_slot_type_name"),
  FOREIGN KEY ("ability_slot_category_code") REFERENCES "ability_slot_categories"("ability_slot_category_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "affinities" (
  "affinity_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "affinity_name" TEXT NOT NULL,
  "affinity_category_code" TEXT NOT NULL,
  "damage_source_code" TEXT,
  "damage_attribute_code" TEXT,
  "affinity_modifier_type_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("affinity_id"),
  UNIQUE ("affinity_name"),
  FOREIGN KEY ("affinity_category_code") REFERENCES "affinity_categories"("affinity_category_code") ON DELETE CASCADE,
  FOREIGN KEY ("damage_source_code") REFERENCES "damage_sources"("damage_source_code") ON DELETE CASCADE,
  FOREIGN KEY ("damage_attribute_code") REFERENCES "damage_attributes"("damage_attribute_code") ON DELETE CASCADE,
  FOREIGN KEY ("affinity_modifier_type_code") REFERENCES "affinity_modifier_types"("affinity_modifier_type_code") ON DELETE CASCADE,
  CONSTRAINT check_invalid_affinities_patterns CHECK (
      NOT (
          (affinity_modifier_type_code = 'Resistance' AND affinity_category_code = 'DamageIncrease')   -- 耐性＋ダメージ増加
          OR 
          (affinity_modifier_type_code = 'Weakness' AND affinity_category_code = 'DamageDecrease')     -- 弱点＋ダメージ軽減
          OR
          (affinity_modifier_type_code = 'Weakness' AND affinity_category_code = 'DamageBlock')        -- 弱点＋ダメージ無効
      )
  )
) WITHOUT ROWID;

CREATE TABLE "effect_conditions" (
  "effect_condition_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_condition_category_code" TEXT NOT NULL,
  "effect_condition_text" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_condition_id"),
  UNIQUE ("effect_condition_text"),
  FOREIGN KEY ("effect_condition_category_code") REFERENCES "effect_condition_categories"("effect_condition_category_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "card_layout_orbs" (
  "card_layout_orb_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_layout_orb_name" TEXT NOT NULL,
  "card_layout_orb_shape_code" TEXT NOT NULL,
  "card_layout_orb_color" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_layout_orb_code"),
  FOREIGN KEY ("card_layout_orb_shape_code") REFERENCES "card_layout_orb_shapes"("card_layout_orb_shape_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "products" (
  "product_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "product_category_code" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "short_name" TEXT,
  "official_short_name" TEXT,
  "provider_category_code" TEXT NOT NULL,
  "provider_code" TEXT NOT NULL,
  "release_ruleset_code" TEXT NOT NULL,
  "release_date" TEXT,
  "product_note" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("product_id"),
  UNIQUE ("product_name"),
  FOREIGN KEY ("product_category_code") REFERENCES "product_categories"("product_category_code") ON DELETE CASCADE,
  FOREIGN KEY ("provider_category_code") REFERENCES "provider_categories"("provider_category_code") ON DELETE CASCADE,
  FOREIGN KEY ("provider_code") REFERENCES "providers"("provider_code") ON DELETE CASCADE,
  FOREIGN KEY ("release_ruleset_code") REFERENCES "rulesets"("ruleset_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "staging_cards" (
  "staging_card_id" TEXT NOT NULL,
  "staging_source_id" TEXT NOT NULL,
  "reference_label" TEXT,
  "extracted_json" TEXT NOT NULL,
  "is_duplicate" INTEGER NOT NULL,
  "error_message" TEXT,
  "status" TEXT NOT NULL,
  "parsed_at" TEXT NOT NULL,
  "committed_at" TEXT,
  PRIMARY KEY ("staging_card_id"),
  FOREIGN KEY ("staging_source_id") REFERENCES "staging_sources"("staging_source_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "effects" (
  "effect_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_name" TEXT,
  "effect_activation_category_code" TEXT,
  "effect_activation_type_id" TEXT,
  "effect_activation_timing_id" TEXT,
  "effect_condition_id" TEXT,
  "effect_type_code" TEXT,
  "effect_cost_id" TEXT,
  "effect_target_id" TEXT,
  "effect_text" TEXT,
  "effect_composed_text" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("effect_id"),
  FOREIGN KEY ("effect_activation_category_code") REFERENCES "effect_activation_categories"("effect_activation_category_code") ON DELETE CASCADE,
  FOREIGN KEY ("effect_activation_type_id") REFERENCES "effect_activation_types"("effect_activation_type_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_activation_timing_id") REFERENCES "effect_activation_timings"("effect_activation_timing_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_condition_id") REFERENCES "effect_conditions"("effect_condition_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_type_code") REFERENCES "effect_types"("effect_type_code") ON DELETE CASCADE,
  FOREIGN KEY ("effect_cost_id") REFERENCES "effect_costs"("effect_cost_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_target_id") REFERENCES "effect_targets"("effect_target_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "card_layouts" (
  "card_layout_code" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_layout_name" TEXT NOT NULL,
  "card_layout_type_code" TEXT NOT NULL,
  "card_layout_orb_code" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_layout_code"),
  FOREIGN KEY ("card_layout_type_code") REFERENCES "card_layout_types"("card_layout_type_code") ON DELETE CASCADE,
  FOREIGN KEY ("card_layout_orb_code") REFERENCES "card_layout_orbs"("card_layout_orb_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "cards" (
  "card_id" TEXT NOT NULL,
  "reference_label" TEXT,
  "name" TEXT NOT NULL,
  "name_kana" TEXT NOT NULL,
  "card_category_code" TEXT NOT NULL,
  "flavor_text" TEXT,
  "rarity_code" TEXT NOT NULL,
  "illustrator_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "card_layout_code" TEXT NOT NULL,
  "override_ruleset_code" TEXT,
  "staging_card_id" TEXT,
  "edit_status_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_id"),
  FOREIGN KEY ("card_category_code") REFERENCES "card_categories"("card_category_code") ON DELETE CASCADE,
  FOREIGN KEY ("rarity_code") REFERENCES "rarities"("rarity_code") ON DELETE CASCADE,
  FOREIGN KEY ("illustrator_id") REFERENCES "illustrators"("illustrator_id") ON DELETE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE,
  FOREIGN KEY ("card_layout_code") REFERENCES "card_layouts"("card_layout_code") ON DELETE CASCADE,
  FOREIGN KEY ("override_ruleset_code") REFERENCES "rulesets"("ruleset_code") ON DELETE CASCADE,
  FOREIGN KEY ("edit_status_code") REFERENCES "edit_statuses"("edit_status_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_elements" (
  "trait_element_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "element_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_element_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("element_code") REFERENCES "elements"("element_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_card_types" (
  "trait_card_type_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "card_type_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_card_type_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("card_type_id") REFERENCES "card_types"("card_type_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_races" (
  "trait_race_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "race_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_race_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("race_id") REFERENCES "races"("race_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_tags" (
  "trait_tag_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "tag_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_tag_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "feature_abilities" (
  "feature_ability_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "initiative" INTEGER,
  "charge" INTEGER,
  "defender" INTEGER,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("feature_ability_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "feature_affinities" (
  "feature_affinity_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "affinity_id" TEXT NOT NULL,
  "affinity_value" INTEGER,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("feature_affinity_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("affinity_id") REFERENCES "affinities"("affinity_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "feature_ability_slots" (
  "feature_ability_slot_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "ability_slot_type_code" TEXT NOT NULL,
  "slot_count" INTEGER NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("feature_ability_slot_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("ability_slot_type_code") REFERENCES "ability_slot_types"("ability_slot_type_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "feature_effects" (
  "feature_effect_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "effect_id" TEXT,
  "effect_extracted_json" TEXT,
  "effect_raw_text" TEXT NOT NULL,
  "effect_assignment_status_code" TEXT NOT NULL,
  "effect_failed_information" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("feature_effect_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_id") REFERENCES "effects"("effect_id") ON DELETE CASCADE,
  FOREIGN KEY ("effect_assignment_status_code") REFERENCES "effect_assignment_statuses"("effect_assignment_status_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_blocks" (
  "trait_block_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "block_code" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_block_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("block_code") REFERENCES "blocks"("block_code") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "trait_factions" (
  "trait_faction_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "faction_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("trait_faction_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("faction_id") REFERENCES "factions"("faction_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "feature_errata" (
  "feature_erratum_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "erratum_category_id" TEXT NOT NULL,
  "before_text" TEXT NOT NULL,
  "after_text" TEXT NOT NULL,
  "revision_reason" TEXT,
  "effective_date" TEXT,
  "erratum_note" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("feature_erratum_id"),
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE,
  FOREIGN KEY ("erratum_category_id") REFERENCES "erratum_categories"("erratum_category_id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE "card_lineage_entries" (
  "card_lineage_id" TEXT NOT NULL,
  "card_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  PRIMARY KEY ("card_lineage_id", "card_id"),
  FOREIGN KEY ("card_lineage_id") REFERENCES "card_lineages"("card_lineage_id") ON DELETE CASCADE,
  FOREIGN KEY ("card_id") REFERENCES "cards"("card_id") ON DELETE CASCADE
) WITHOUT ROWID;
-- =====================================================
-- Table Count: 68 tables total
-- =====================================================
