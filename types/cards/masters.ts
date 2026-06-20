
// ============================================================================
// masters.json 用マスターデータ型定義
// ============================================================================

/** masters.json のルートオブジェクト */
export interface FinderMasters {
  version: string;
  generated_at: string;
  card_categories: CardCategory[];
  item_categories: ItemCategory[];
  land_categories: LandCategory[];
  card_types: CardType[];
  move_types: MoveType[];
  rarities: Rarity[];
  blocks: Block[];
  factions: Faction[];
  elements: Element[];
  races: Race[];
  products: Product[];
  product_categories: ProductCategory[];
  providers: Provider[];
  provider_categories: ProviderCategory[];
  ability_slot_types: AbilitySlotType[];
  affinities: Affinity[];
  affinity_categories: AffinityCategory[];
  affinity_modifier_types: AffinityModifierType[];
  damage_sources: DamageSource[];
  damage_attributes: DamageAttribute[];
  effect_activation_categories: EffectActivationCategory[];
  effect_activation_types: EffectActivationType[];
  effect_activation_timings: EffectActivationTiming[];
  effect_condition_categories: EffectConditionCategory[];
  effect_conditions: EffectCondition[];
  effect_types: EffectType[];
  effect_costs: EffectCost[];
  effect_targets: EffectTarget[];
  tags: Tag[];
  tag_categories: TagCategory[];
  erratum_categories: ErratumCategory[];
  display_tokens: DisplayToken[];
}

// ─── 各マスター型 ────────────────────────────────────────────────────────────

export interface CardCategory {
  card_category_code: string;
  card_category_name: string;
}

export interface ItemCategory {
  item_category_code: string;
  item_category_name: string;
}

export interface LandCategory {
  land_category_code: string;
  land_category_name: string;
}

export interface CardType {
  card_type_id: string;
  card_type_name: string;
}

export interface MoveType {
  move_type_code: string;
  move_type_name: string;
}

export interface Rarity {
  rarity_code: string;
  rarity_name: string;
}

export interface Block {
  block_code: string;
  block_name: string;
}

export interface Faction {
  faction_id: string;
  faction_name: string;
}

export interface Element {
  element_code: string;
  element_name: string;
}

export interface Race {
  race_id: string;
  race_name: string;
}

export interface Product {
  product_id: string;
  product_category_code: string;
  product_category_name: string;
  product_name: string;
  short_name: string;
  official_short_name: string;
  provider_category_code: string;
  provider_category_name: string;
  provider_code: string;
  provider_name: string;
  /** 発売日（ISO 8601 date string、未定の場合は null） */
  release_date: string | null;
  product_note: string;
}

export interface ProductCategory {
  product_category_code: string;
  product_category_name: string;
}

export interface Provider {
  provider_code: string;
  provider_name: string;
}

export interface ProviderCategory {
  provider_category_code: string;
  provider_category_name: string;
}

export interface AbilitySlotType {
  ability_slot_type_code: string;
  ability_slot_type_name: string;
}

export interface Affinity {
  affinity_id: string;
  affinity_name: string;
  affinity_category_code: string;
  affinity_category_name: string;
  damage_source_code: string;
  damage_source_name: string;
  damage_attribute_code: string;
  damage_attribute_name: string;
  /** ダメージ効果計算対象 */
  is_effective_target: boolean;
  /** ダメージ相性計算対象 */
  is_affinity_target: boolean;
  affinity_modifier_type_code: string;
  affinity_modifier_type_name: string;
}

export interface AffinityCategory {
  affinity_category_code: string;
  affinity_category_name: string;
}

export interface AffinityModifierType {
  affinity_modifier_type_code: string;
  affinity_modifier_type_name: string;
}

export interface DamageSource {
  damage_source_code: string;
  damage_source_name: string;
}

export interface DamageAttribute {
  damage_attribute_code: string;
  damage_attribute_name: string;
  is_effective_target: boolean;
  is_affinity_target: boolean;
}

export interface EffectActivationCategory {
  effect_activation_category_code: string;
  effect_activation_category_name: string;
}

export interface EffectActivationType {
  effect_activation_type_id: string;
  effect_activation_type_name: string;
}

export interface EffectActivationTiming {
  effect_activation_timing_id: string;
  effect_activation_timing_name: string;
}

export interface EffectConditionCategory {
  effect_condition_category_code: string;
  effect_condition_category_name: string;
}

export interface EffectCondition {
  effect_condition_id: string;
  effect_condition_category_code: string;
  effect_condition_category_name: string;
  effect_condition_text: string;
}

export interface EffectType {
  effect_type_code: string;
  effect_type_name: string;
}

export interface EffectCost {
  effect_cost_id: string;
  effect_cost_text: string;
}

export interface EffectTarget {
  effect_target_id: string;
  effect_target_name: string;
}

export interface Tag {
  tag_id: string;
  tag_category_id: string;
  tag_category_name: string;
  tag_value: string;
}

export interface TagCategory {
  tag_category_id: string;
  tag_category_name: string;
}

export interface ErratumCategory {
  erratum_category_id: string;
  erratum_category_name: string;
}

/** 表示用トークン (display_tokens) */
export interface DisplayToken {
  token_category: string;
  token_key: string;
  token_name: string;
  image_path: string;
}
