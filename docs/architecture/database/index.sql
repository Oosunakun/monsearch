-- =====================================================
-- Indexes
-- =====================================================

-- Auto-generated indexes from INDEX column
DROP INDEX IF EXISTS "idx_cards_reference_label";
CREATE INDEX IF NOT EXISTS "idx_cards_reference_label" ON "cards" ("reference_label");

DROP INDEX IF EXISTS "idx_cards_name";
CREATE INDEX IF NOT EXISTS "idx_cards_name" ON "cards" ("name");

DROP INDEX IF EXISTS "idx_cards_name_kana";
CREATE INDEX IF NOT EXISTS "idx_cards_name_kana" ON "cards" ("name_kana");

DROP INDEX IF EXISTS "idx_cards_card_category_code";
CREATE INDEX IF NOT EXISTS "idx_cards_card_category_code" ON "cards" ("card_category_code");

DROP INDEX IF EXISTS "idx_cards_rarity_code";
CREATE INDEX IF NOT EXISTS "idx_cards_rarity_code" ON "cards" ("rarity_code");

DROP INDEX IF EXISTS "idx_cards_illustrator_id";
CREATE INDEX IF NOT EXISTS "idx_cards_illustrator_id" ON "cards" ("illustrator_id");

DROP INDEX IF EXISTS "idx_cards_product_id";
CREATE INDEX IF NOT EXISTS "idx_cards_product_id" ON "cards" ("product_id");

DROP INDEX IF EXISTS "idx_cards_card_layout_code";
CREATE INDEX IF NOT EXISTS "idx_cards_card_layout_code" ON "cards" ("card_layout_code");

DROP INDEX IF EXISTS "idx_cards_override_ruleset_code";
CREATE INDEX IF NOT EXISTS "idx_cards_override_ruleset_code" ON "cards" ("override_ruleset_code");

DROP INDEX IF EXISTS "idx_cards_staging_card_id";
CREATE INDEX IF NOT EXISTS "idx_cards_staging_card_id" ON "cards" ("staging_card_id");

DROP INDEX IF EXISTS "idx_cards_edit_status_code";
CREATE INDEX IF NOT EXISTS "idx_cards_edit_status_code" ON "cards" ("edit_status_code");

DROP INDEX IF EXISTS "idx_stat_unit_level";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_level" ON "stat_unit" ("level");

DROP INDEX IF EXISTS "idx_stat_unit_is_instant_summon";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_is_instant_summon" ON "stat_unit" ("is_instant_summon");

DROP INDEX IF EXISTS "idx_stat_unit_is_hero";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_is_hero" ON "stat_unit" ("is_hero");

DROP INDEX IF EXISTS "idx_stat_unit_hero_point";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_hero_point" ON "stat_unit" ("hero_point");

DROP INDEX IF EXISTS "idx_stat_unit_move_type_code";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_move_type_code" ON "stat_unit" ("move_type_code");

DROP INDEX IF EXISTS "idx_stat_unit_attack";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_attack" ON "stat_unit" ("attack");

DROP INDEX IF EXISTS "idx_stat_unit_defense";
CREATE INDEX IF NOT EXISTS "idx_stat_unit_defense" ON "stat_unit" ("defense");

DROP INDEX IF EXISTS "idx_stat_item_item_category_code";
CREATE INDEX IF NOT EXISTS "idx_stat_item_item_category_code" ON "stat_item" ("item_category_code");

DROP INDEX IF EXISTS "idx_stat_item_equip_attack";
CREATE INDEX IF NOT EXISTS "idx_stat_item_equip_attack" ON "stat_item_equip" ("attack");

DROP INDEX IF EXISTS "idx_stat_item_equip_defense";
CREATE INDEX IF NOT EXISTS "idx_stat_item_equip_defense" ON "stat_item_equip" ("defense");

DROP INDEX IF EXISTS "idx_stat_land_land_limit";
CREATE INDEX IF NOT EXISTS "idx_stat_land_land_limit" ON "stat_land" ("land_limit");

DROP INDEX IF EXISTS "idx_stat_land_land_category_code";
CREATE INDEX IF NOT EXISTS "idx_stat_land_land_category_code" ON "stat_land" ("land_category_code");

DROP INDEX IF EXISTS "idx_stat_summoner_arcana";
CREATE INDEX IF NOT EXISTS "idx_stat_summoner_arcana" ON "stat_summoner" ("arcana");

DROP INDEX IF EXISTS "idx_stat_summoner_secondary_name";
CREATE INDEX IF NOT EXISTS "idx_stat_summoner_secondary_name" ON "stat_summoner" ("secondary_name");

DROP INDEX IF EXISTS "idx_stat_summoner_secondary_name_kana";
CREATE INDEX IF NOT EXISTS "idx_stat_summoner_secondary_name_kana" ON "stat_summoner" ("secondary_name_kana");

DROP INDEX IF EXISTS "idx_trait_elements_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_elements_card_id" ON "trait_elements" ("card_id");

DROP INDEX IF EXISTS "idx_trait_elements_element_code";
CREATE INDEX IF NOT EXISTS "idx_trait_elements_element_code" ON "trait_elements" ("element_code");

DROP INDEX IF EXISTS "idx_elements_element_name";
CREATE INDEX IF NOT EXISTS "idx_elements_element_name" ON "elements" ("element_name");

DROP INDEX IF EXISTS "idx_trait_card_types_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_card_types_card_id" ON "trait_card_types" ("card_id");

DROP INDEX IF EXISTS "idx_trait_card_types_card_type_id";
CREATE INDEX IF NOT EXISTS "idx_trait_card_types_card_type_id" ON "trait_card_types" ("card_type_id");

DROP INDEX IF EXISTS "idx_card_types_card_type_name";
CREATE INDEX IF NOT EXISTS "idx_card_types_card_type_name" ON "card_types" ("card_type_name");

DROP INDEX IF EXISTS "idx_trait_races_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_races_card_id" ON "trait_races" ("card_id");

DROP INDEX IF EXISTS "idx_trait_races_race_id";
CREATE INDEX IF NOT EXISTS "idx_trait_races_race_id" ON "trait_races" ("race_id");

DROP INDEX IF EXISTS "idx_races_race_name";
CREATE INDEX IF NOT EXISTS "idx_races_race_name" ON "races" ("race_name");

DROP INDEX IF EXISTS "idx_trait_tags_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_tags_card_id" ON "trait_tags" ("card_id");

DROP INDEX IF EXISTS "idx_trait_tags_tag_id";
CREATE INDEX IF NOT EXISTS "idx_trait_tags_tag_id" ON "trait_tags" ("tag_id");

DROP INDEX IF EXISTS "idx_tags_tag_category_code";
CREATE INDEX IF NOT EXISTS "idx_tags_tag_category_code" ON "tags" ("tag_category_code");

DROP INDEX IF EXISTS "idx_feature_abilities_card_id";
CREATE INDEX IF NOT EXISTS "idx_feature_abilities_card_id" ON "feature_abilities" ("card_id");

DROP INDEX IF EXISTS "idx_feature_abilities_initiative";
CREATE INDEX IF NOT EXISTS "idx_feature_abilities_initiative" ON "feature_abilities" ("initiative");

DROP INDEX IF EXISTS "idx_feature_abilities_charge";
CREATE INDEX IF NOT EXISTS "idx_feature_abilities_charge" ON "feature_abilities" ("charge");

DROP INDEX IF EXISTS "idx_feature_abilities_defender";
CREATE INDEX IF NOT EXISTS "idx_feature_abilities_defender" ON "feature_abilities" ("defender");

DROP INDEX IF EXISTS "idx_feature_affinities_card_id";
CREATE INDEX IF NOT EXISTS "idx_feature_affinities_card_id" ON "feature_affinities" ("card_id");

DROP INDEX IF EXISTS "idx_feature_affinities_affinity_id";
CREATE INDEX IF NOT EXISTS "idx_feature_affinities_affinity_id" ON "feature_affinities" ("affinity_id");

DROP INDEX IF EXISTS "idx_feature_ability_slots_card_id";
CREATE INDEX IF NOT EXISTS "idx_feature_ability_slots_card_id" ON "feature_ability_slots" ("card_id");

DROP INDEX IF EXISTS "idx_feature_ability_slots_ability_slot_type_code";
CREATE INDEX IF NOT EXISTS "idx_feature_ability_slots_ability_slot_type_code" ON "feature_ability_slots" ("ability_slot_type_code");

DROP INDEX IF EXISTS "idx_feature_effects_card_id";
CREATE INDEX IF NOT EXISTS "idx_feature_effects_card_id" ON "feature_effects" ("card_id");

DROP INDEX IF EXISTS "idx_feature_effects_effect_id";
CREATE INDEX IF NOT EXISTS "idx_feature_effects_effect_id" ON "feature_effects" ("effect_id");

DROP INDEX IF EXISTS "idx_feature_effects_effect_assignment_status_code";
CREATE INDEX IF NOT EXISTS "idx_feature_effects_effect_assignment_status_code" ON "feature_effects" ("effect_assignment_status_code");

DROP INDEX IF EXISTS "idx_trait_blocks_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_blocks_card_id" ON "trait_blocks" ("card_id");

DROP INDEX IF EXISTS "idx_trait_blocks_block_code";
CREATE INDEX IF NOT EXISTS "idx_trait_blocks_block_code" ON "trait_blocks" ("block_code");

DROP INDEX IF EXISTS "idx_blocks_block_name";
CREATE INDEX IF NOT EXISTS "idx_blocks_block_name" ON "blocks" ("block_name");

DROP INDEX IF EXISTS "idx_trait_factions_card_id";
CREATE INDEX IF NOT EXISTS "idx_trait_factions_card_id" ON "trait_factions" ("card_id");

DROP INDEX IF EXISTS "idx_trait_factions_faction_id";
CREATE INDEX IF NOT EXISTS "idx_trait_factions_faction_id" ON "trait_factions" ("faction_id");

DROP INDEX IF EXISTS "idx_factions_faction_name";
CREATE INDEX IF NOT EXISTS "idx_factions_faction_name" ON "factions" ("faction_name");

DROP INDEX IF EXISTS "idx_products_product_category_code";
CREATE INDEX IF NOT EXISTS "idx_products_product_category_code" ON "products" ("product_category_code");

DROP INDEX IF EXISTS "idx_products_product_name";
CREATE INDEX IF NOT EXISTS "idx_products_product_name" ON "products" ("product_name");

DROP INDEX IF EXISTS "idx_products_provider_category_code";
CREATE INDEX IF NOT EXISTS "idx_products_provider_category_code" ON "products" ("provider_category_code");

DROP INDEX IF EXISTS "idx_products_provider_code";
CREATE INDEX IF NOT EXISTS "idx_products_provider_code" ON "products" ("provider_code");

DROP INDEX IF EXISTS "idx_products_release_ruleset_code";
CREATE INDEX IF NOT EXISTS "idx_products_release_ruleset_code" ON "products" ("release_ruleset_code");

DROP INDEX IF EXISTS "idx_product_categories_product_category_name";
CREATE INDEX IF NOT EXISTS "idx_product_categories_product_category_name" ON "product_categories" ("product_category_name");

DROP INDEX IF EXISTS "idx_card_categories_card_category_name";
CREATE INDEX IF NOT EXISTS "idx_card_categories_card_category_name" ON "card_categories" ("card_category_name");

DROP INDEX IF EXISTS "idx_item_categories_item_category_name";
CREATE INDEX IF NOT EXISTS "idx_item_categories_item_category_name" ON "item_categories" ("item_category_name");

DROP INDEX IF EXISTS "idx_land_categories_land_category_name";
CREATE INDEX IF NOT EXISTS "idx_land_categories_land_category_name" ON "land_categories" ("land_category_name");

DROP INDEX IF EXISTS "idx_move_types_move_type_name";
CREATE INDEX IF NOT EXISTS "idx_move_types_move_type_name" ON "move_types" ("move_type_name");

DROP INDEX IF EXISTS "idx_rarities_rarity_name";
CREATE INDEX IF NOT EXISTS "idx_rarities_rarity_name" ON "rarities" ("rarity_name");

DROP INDEX IF EXISTS "idx_illustrators_illustrator_name";
CREATE INDEX IF NOT EXISTS "idx_illustrators_illustrator_name" ON "illustrators" ("illustrator_name");

DROP INDEX IF EXISTS "idx_edit_statuses_edit_status_name";
CREATE INDEX IF NOT EXISTS "idx_edit_statuses_edit_status_name" ON "edit_statuses" ("edit_status_name");

DROP INDEX IF EXISTS "idx_provider_categories_provider_category_name";
CREATE INDEX IF NOT EXISTS "idx_provider_categories_provider_category_name" ON "provider_categories" ("provider_category_name");

DROP INDEX IF EXISTS "idx_providers_provider_name";
CREATE INDEX IF NOT EXISTS "idx_providers_provider_name" ON "providers" ("provider_name");

DROP INDEX IF EXISTS "idx_tag_categories_tag_category_name";
CREATE INDEX IF NOT EXISTS "idx_tag_categories_tag_category_name" ON "tag_categories" ("tag_category_name");

DROP INDEX IF EXISTS "idx_ability_slot_categories_ability_slot_category_name";
CREATE INDEX IF NOT EXISTS "idx_ability_slot_categories_ability_slot_category_name" ON "ability_slot_categories" ("ability_slot_category_name");

DROP INDEX IF EXISTS "idx_ability_slot_types_ability_slot_category_code";
CREATE INDEX IF NOT EXISTS "idx_ability_slot_types_ability_slot_category_code" ON "ability_slot_types" ("ability_slot_category_code");

DROP INDEX IF EXISTS "idx_ability_slot_types_ability_slot_type_name";
CREATE INDEX IF NOT EXISTS "idx_ability_slot_types_ability_slot_type_name" ON "ability_slot_types" ("ability_slot_type_name");

DROP INDEX IF EXISTS "idx_affinities_affinity_name";
CREATE INDEX IF NOT EXISTS "idx_affinities_affinity_name" ON "affinities" ("affinity_name");

DROP INDEX IF EXISTS "idx_affinities_affinity_category_code";
CREATE INDEX IF NOT EXISTS "idx_affinities_affinity_category_code" ON "affinities" ("affinity_category_code");

DROP INDEX IF EXISTS "idx_affinities_damage_source_code";
CREATE INDEX IF NOT EXISTS "idx_affinities_damage_source_code" ON "affinities" ("damage_source_code");

DROP INDEX IF EXISTS "idx_affinities_damage_attribute_code";
CREATE INDEX IF NOT EXISTS "idx_affinities_damage_attribute_code" ON "affinities" ("damage_attribute_code");

DROP INDEX IF EXISTS "idx_affinities_affinity_modifier_type_code";
CREATE INDEX IF NOT EXISTS "idx_affinities_affinity_modifier_type_code" ON "affinities" ("affinity_modifier_type_code");

DROP INDEX IF EXISTS "idx_affinity_categories_affinity_category_name";
CREATE INDEX IF NOT EXISTS "idx_affinity_categories_affinity_category_name" ON "affinity_categories" ("affinity_category_name");

DROP INDEX IF EXISTS "idx_affinity_modifier_types_affinity_modifier_type_name";
CREATE INDEX IF NOT EXISTS "idx_affinity_modifier_types_affinity_modifier_type_name" ON "affinity_modifier_types" ("affinity_modifier_type_name");

DROP INDEX IF EXISTS "idx_damage_sources_damage_source_name";
CREATE INDEX IF NOT EXISTS "idx_damage_sources_damage_source_name" ON "damage_sources" ("damage_source_name");

DROP INDEX IF EXISTS "idx_damage_attributes_damage_attribute_name";
CREATE INDEX IF NOT EXISTS "idx_damage_attributes_damage_attribute_name" ON "damage_attributes" ("damage_attribute_name");

DROP INDEX IF EXISTS "idx_effects_effect_name";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_name" ON "effects" ("effect_name");

DROP INDEX IF EXISTS "idx_effects_effect_activation_category_code";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_activation_category_code" ON "effects" ("effect_activation_category_code");

DROP INDEX IF EXISTS "idx_effects_effect_activation_type_id";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_activation_type_id" ON "effects" ("effect_activation_type_id");

DROP INDEX IF EXISTS "idx_effects_effect_activation_timing_id";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_activation_timing_id" ON "effects" ("effect_activation_timing_id");

DROP INDEX IF EXISTS "idx_effects_effect_condition_id";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_condition_id" ON "effects" ("effect_condition_id");

DROP INDEX IF EXISTS "idx_effects_effect_type_code";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_type_code" ON "effects" ("effect_type_code");

DROP INDEX IF EXISTS "idx_effects_effect_cost_id";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_cost_id" ON "effects" ("effect_cost_id");

DROP INDEX IF EXISTS "idx_effects_effect_target_id";
CREATE INDEX IF NOT EXISTS "idx_effects_effect_target_id" ON "effects" ("effect_target_id");

DROP INDEX IF EXISTS "idx_effect_activation_categories_effect_activation_category_name";
CREATE INDEX IF NOT EXISTS "idx_effect_activation_categories_effect_activation_category_name" ON "effect_activation_categories" ("effect_activation_category_name");

DROP INDEX IF EXISTS "idx_effect_activation_types_effect_activation_type_name";
CREATE INDEX IF NOT EXISTS "idx_effect_activation_types_effect_activation_type_name" ON "effect_activation_types" ("effect_activation_type_name");

DROP INDEX IF EXISTS "idx_effect_activation_timings_effect_activation_timing_name";
CREATE INDEX IF NOT EXISTS "idx_effect_activation_timings_effect_activation_timing_name" ON "effect_activation_timings" ("effect_activation_timing_name");

DROP INDEX IF EXISTS "idx_effect_condition_categories_effect_condition_category_name";
CREATE INDEX IF NOT EXISTS "idx_effect_condition_categories_effect_condition_category_name" ON "effect_condition_categories" ("effect_condition_category_name");

DROP INDEX IF EXISTS "idx_effect_conditions_effect_condition_category_code";
CREATE INDEX IF NOT EXISTS "idx_effect_conditions_effect_condition_category_code" ON "effect_conditions" ("effect_condition_category_code");

DROP INDEX IF EXISTS "idx_effect_conditions_effect_condition_text";
CREATE INDEX IF NOT EXISTS "idx_effect_conditions_effect_condition_text" ON "effect_conditions" ("effect_condition_text");

DROP INDEX IF EXISTS "idx_effect_types_effect_type_name";
CREATE INDEX IF NOT EXISTS "idx_effect_types_effect_type_name" ON "effect_types" ("effect_type_name");

DROP INDEX IF EXISTS "idx_effect_costs_effect_cost_text";
CREATE INDEX IF NOT EXISTS "idx_effect_costs_effect_cost_text" ON "effect_costs" ("effect_cost_text");

DROP INDEX IF EXISTS "idx_effect_targets_effect_target_name";
CREATE INDEX IF NOT EXISTS "idx_effect_targets_effect_target_name" ON "effect_targets" ("effect_target_name");

DROP INDEX IF EXISTS "idx_effect_assignment_statuses_effect_assignment_status_name";
CREATE INDEX IF NOT EXISTS "idx_effect_assignment_statuses_effect_assignment_status_name" ON "effect_assignment_statuses" ("effect_assignment_status_name");

DROP INDEX IF EXISTS "idx_feature_errata_card_id";
CREATE INDEX IF NOT EXISTS "idx_feature_errata_card_id" ON "feature_errata" ("card_id");

DROP INDEX IF EXISTS "idx_feature_errata_erratum_category_id";
CREATE INDEX IF NOT EXISTS "idx_feature_errata_erratum_category_id" ON "feature_errata" ("erratum_category_id");

DROP INDEX IF EXISTS "idx_erratum_categories_erratum_category_name";
CREATE INDEX IF NOT EXISTS "idx_erratum_categories_erratum_category_name" ON "erratum_categories" ("erratum_category_name");

DROP INDEX IF EXISTS "idx_card_layouts_card_layout_name";
CREATE INDEX IF NOT EXISTS "idx_card_layouts_card_layout_name" ON "card_layouts" ("card_layout_name");

DROP INDEX IF EXISTS "idx_card_layouts_card_layout_type_code";
CREATE INDEX IF NOT EXISTS "idx_card_layouts_card_layout_type_code" ON "card_layouts" ("card_layout_type_code");

DROP INDEX IF EXISTS "idx_card_layouts_card_layout_orb_code";
CREATE INDEX IF NOT EXISTS "idx_card_layouts_card_layout_orb_code" ON "card_layouts" ("card_layout_orb_code");

DROP INDEX IF EXISTS "idx_card_layout_types_card_layout_type_name";
CREATE INDEX IF NOT EXISTS "idx_card_layout_types_card_layout_type_name" ON "card_layout_types" ("card_layout_type_name");

DROP INDEX IF EXISTS "idx_card_layout_orbs_card_layout_orb_name";
CREATE INDEX IF NOT EXISTS "idx_card_layout_orbs_card_layout_orb_name" ON "card_layout_orbs" ("card_layout_orb_name");

DROP INDEX IF EXISTS "idx_card_layout_orbs_card_layout_orb_shape_code";
CREATE INDEX IF NOT EXISTS "idx_card_layout_orbs_card_layout_orb_shape_code" ON "card_layout_orbs" ("card_layout_orb_shape_code");

DROP INDEX IF EXISTS "idx_card_layout_orbs_card_layout_orb_color";
CREATE INDEX IF NOT EXISTS "idx_card_layout_orbs_card_layout_orb_color" ON "card_layout_orbs" ("card_layout_orb_color");

DROP INDEX IF EXISTS "idx_card_layout_orb_shapes_card_layout_orb_shape_name";
CREATE INDEX IF NOT EXISTS "idx_card_layout_orb_shapes_card_layout_orb_shape_name" ON "card_layout_orb_shapes" ("card_layout_orb_shape_name");

DROP INDEX IF EXISTS "idx_rulesets_ruleset_name";
CREATE INDEX IF NOT EXISTS "idx_rulesets_ruleset_name" ON "rulesets" ("ruleset_name");

DROP INDEX IF EXISTS "idx_card_lineages_lineage_name";
CREATE INDEX IF NOT EXISTS "idx_card_lineages_lineage_name" ON "card_lineages" ("lineage_name");

DROP INDEX IF EXISTS "idx_display_tokens_token_name";
CREATE INDEX IF NOT EXISTS "idx_display_tokens_token_name" ON "display_tokens" ("token_name");

DROP INDEX IF EXISTS "idx_staging_sources_source_type";
CREATE INDEX IF NOT EXISTS "idx_staging_sources_source_type" ON "staging_sources" ("source_type");

DROP INDEX IF EXISTS "idx_staging_sources_status";
CREATE INDEX IF NOT EXISTS "idx_staging_sources_status" ON "staging_sources" ("status");

DROP INDEX IF EXISTS "idx_staging_cards_staging_source_id";
CREATE INDEX IF NOT EXISTS "idx_staging_cards_staging_source_id" ON "staging_cards" ("staging_source_id");

DROP INDEX IF EXISTS "idx_staging_cards_reference_label";
CREATE INDEX IF NOT EXISTS "idx_staging_cards_reference_label" ON "staging_cards" ("reference_label");

-- =====================================================
-- Index Count: 119 indexes total
--   Auto-generated: 119
--   Custom (from Index sheet): 0
-- =====================================================
