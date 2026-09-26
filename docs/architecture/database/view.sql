-- =====================================================
-- Views
-- =====================================================

-- View: Card List (カード一覧表示用)
DROP VIEW IF EXISTS "view_card_list";
CREATE VIEW IF NOT EXISTS "view_card_list" AS
SELECT 
  c.card_id,
  c.reference_label,
  c.name,
  c.card_category_code,
  cc.card_category_name,
  c.rarity_code,
  r.rarity_name,
  c.product_id,
  p.product_name,
  p.release_ruleset_code,
  prs.ruleset_name as release_ruleset_name,
  c.override_ruleset_code,
  crs.ruleset_name as override_ruleset_name,
  c.edit_status_code,
  es.edit_status_name,
  c.illustrator_id,
  i.illustrator_name,
  c.flavor_text,
  c.created_at,
  c.updated_at,
  
  -- 属性（カンマ区切り）
  (SELECT GROUP_CONCAT(elem.element_code, ',') 
   FROM trait_elements te 
   JOIN elements elem ON te.element_code = elem.element_code 
   WHERE te.card_id = c.card_id 
   ORDER BY te.sequence_number) AS elements,
  
  -- カード種別（カンマ区切り）
  (SELECT GROUP_CONCAT(ct.card_type_id, ',') 
   FROM trait_card_types tct 
   JOIN card_types ct ON tct.card_type_id = ct.card_type_id 
   WHERE tct.card_id = c.card_id 
   ORDER BY tct.sequence_number) AS card_types,
  
  -- 種族（カンマ区切り）
  (SELECT GROUP_CONCAT(race.race_name, ',') 
   FROM trait_races tr 
   JOIN races race ON tr.race_id = race.race_id 
   WHERE tr.card_id = c.card_id 
   ORDER BY tr.sequence_number) AS races,
  
  -- ユニット固有情報
  su.level AS unit_level,
  su.move_type_code AS unit_move_type,
  mt.move_type_name AS unit_move_type_name,
  su.attack AS unit_attack,
  su.defense AS unit_defense,
  su.is_instant_summon AS unit_is_instant_summon,
  su.is_hero AS unit_is_hero,
  su.hero_point AS unit_hero_point,
  
  -- 装備アイテム固有情報
  sie.attack AS equip_attack,
  sie.defense AS equip_defense,
  
  -- 地形固有情報
  sl.land_limit,
  sl.land_category_code,
  lc.land_category_name,
  
  -- アイテム分類
  si.item_category_code,
  ic.item_category_name,
  
  -- 召喚術師分類
  ss.arcana,
  ss.secondary_name,
  ss.secondary_name_kana,

  -- 実効ルールセット
  COALESCE(c.override_ruleset_code, p.release_ruleset_code) AS effective_ruleset_code,
  COALESCE(crs.ruleset_name, prs.ruleset_name) AS effective_ruleset_name

FROM cards c
LEFT JOIN card_categories cc ON c.card_category_code = cc.card_category_code
LEFT JOIN rarities r ON c.rarity_code = r.rarity_code
LEFT JOIN illustrators i ON c.illustrator_id = i.illustrator_id
LEFT JOIN products p ON c.product_id = p.product_id
LEFT JOIN rulesets prs ON prs.ruleset_code = p.release_ruleset_code
LEFT JOIN rulesets crs ON crs.ruleset_code = c.override_ruleset_code
LEFT JOIN edit_statuses es ON c.edit_status_code = es.edit_status_code
LEFT JOIN stat_unit su ON c.card_id = su.card_id
LEFT JOIN move_types mt ON su.move_type_code = mt.move_type_code
LEFT JOIN stat_item_equip sie ON c.card_id = sie.card_id
LEFT JOIN stat_land sl ON c.card_id = sl.card_id
LEFT JOIN land_categories lc ON sl.land_category_code = lc.land_category_code
LEFT JOIN stat_item si ON c.card_id = si.card_id
LEFT JOIN item_categories ic ON si.item_category_code = ic.item_category_code
LEFT JOIN stat_summoner ss ON c.card_id = ss.card_id;

-- View: Card Details with Effects (カード詳細+エフェクト)
DROP VIEW IF EXISTS "view_card_details";
CREATE VIEW IF NOT EXISTS "view_card_details" AS
SELECT 
  vcl.*,
  
  -- エフェクト情報（カンマ区切り）
  (SELECT GROUP_CONCAT(eff.effect_text, ' | ') 
   FROM feature_effects fe 
   JOIN effects eff ON fe.effect_id = eff.effect_id 
   WHERE fe.card_id = vcl.card_id 
   ORDER BY fe.sequence_number) AS effects_text,
  
  -- エフェクト数
  (SELECT COUNT(*) 
   FROM feature_effects fe 
   WHERE fe.card_id = vcl.card_id) AS effects_count

FROM view_card_list vcl;

-- View: Staging Source List (StagingSource一覧)
DROP VIEW IF EXISTS "view_staging_source_list";
CREATE VIEW IF NOT EXISTS "view_staging_source_list" AS
SELECT 
  staging_source_id,
  status,
  source_type,
  staging_source_note,
  LENGTH(raw_source) AS raw_source_length,
  raw_source,
  created_at,
  parsed_at
FROM staging_sources;

-- View: Staging Cards List (Staging一覧)
DROP VIEW IF EXISTS "view_staging_card_list";
CREATE VIEW IF NOT EXISTS "view_staging_card_list" AS
SELECT
  sc.staging_card_id,
  sc.staging_source_id,
  sc.reference_label,
  json_extract(sc.extracted_json, '$.name') AS name,
  COALESCE(p.product_id, json_extract(sc.extracted_json, '$.product_id')) AS product_id,
  COALESCE(p.product_name, json_extract(sc.extracted_json, '$.product_raw')) AS product_name,
  sc.extracted_json,
  sc.is_duplicate,
  sc.error_message,
  sc.status,
  sc.parsed_at,
  sc.committed_at
FROM staging_cards AS sc
LEFT JOIN products AS p
  ON p.product_id = json_extract(sc.extracted_json, '$.product_id');

-- View: Master Summary (マスター一覧サマリ)
DROP VIEW IF EXISTS "view_master_summary";
CREATE VIEW IF NOT EXISTS "view_master_summary" AS
SELECT 
  'elements' AS table_name,
  '属性' AS table_display_name,
  COUNT(*) AS record_count
FROM elements
UNION ALL
SELECT 'card_types', 'タイプ', COUNT(*) FROM  card_types
UNION ALL
SELECT 'races', '種族', COUNT(*) FROM  races
UNION ALL
SELECT 'tags', 'タグ', COUNT(*) FROM  tags
UNION ALL
SELECT 'blocks', 'ブロック', COUNT(*) FROM  blocks
UNION ALL
SELECT 'factions', '勢力', COUNT(*) FROM  factions
UNION ALL
SELECT 'products', '収録カードセット', COUNT(*) FROM  products
UNION ALL
SELECT 'product_categories', '収録カードセット分類', COUNT(*) FROM  product_categories
UNION ALL
SELECT 'card_categories', 'カード分類', COUNT(*) FROM  card_categories
UNION ALL
SELECT 'item_categories', 'アイテム分類', COUNT(*) FROM  item_categories
UNION ALL
SELECT 'land_categories', '地形分類', COUNT(*) FROM  land_categories
UNION ALL
SELECT 'move_types', '進軍タイプ', COUNT(*) FROM  move_types
UNION ALL
SELECT 'rarities', '出現頻度', COUNT(*) FROM  rarities
UNION ALL
SELECT 'illustrators', 'イラストレーター', COUNT(*) FROM  illustrators
UNION ALL
SELECT 'edit_statuses', '編集状態', COUNT(*) FROM  edit_statuses
UNION ALL
SELECT 'provider_categories', '提供元分類', COUNT(*) FROM  provider_categories
UNION ALL
SELECT 'providers', '提供元', COUNT(*) FROM  providers
UNION ALL
SELECT 'tag_categories', 'タグ分類', COUNT(*) FROM  tag_categories
UNION ALL
SELECT 'ability_slot_categories', '常備能力枠分類', COUNT(*) FROM  ability_slot_categories
UNION ALL
SELECT 'ability_slot_types', '常備能力枠タイプ', COUNT(*) FROM  ability_slot_types
UNION ALL
SELECT 'affinities', 'ダメージ相性', COUNT(*) FROM  affinities
UNION ALL
SELECT 'affinity_categories', 'ダメージ相性分類', COUNT(*) FROM  affinity_categories
UNION ALL
SELECT 'affinity_modifier_types', 'ダメージ相性補正タイプ', COUNT(*) FROM  affinity_modifier_types
UNION ALL
SELECT 'damage_sources', 'ダメージ発生元', COUNT(*) FROM  damage_sources
UNION ALL
SELECT 'damage_attributes', 'ダメージ属性', COUNT(*) FROM  damage_attributes
UNION ALL
SELECT 'effects', 'カード効果', COUNT(*) FROM  effects
UNION ALL
SELECT 'effect_activation_categories', 'カード効果有効時期分類', COUNT(*) FROM  effect_activation_categories
UNION ALL
SELECT 'effect_activation_types', 'カード効果宣言タイミング', COUNT(*) FROM  effect_activation_types
UNION ALL
SELECT 'effect_activation_timings', 'カード効果発揮時期', COUNT(*) FROM  effect_activation_timings
UNION ALL
SELECT 'effect_condition_categories', 'カード効果使用条件分類', COUNT(*) FROM  effect_condition_categories
UNION ALL
SELECT 'effect_conditions', 'カード効果使用条件', COUNT(*) FROM  effect_conditions
UNION ALL
SELECT 'effect_types', 'カード効果タイプ', COUNT(*) FROM  effect_types
UNION ALL
SELECT 'effect_costs', 'カード効果使用コスト', COUNT(*) FROM  effect_costs
UNION ALL
SELECT 'effect_targets', 'カード効果発生対象', COUNT(*) FROM  effect_targets
UNION ALL
SELECT 'effect_assignment_statuses', 'カード効果割り当て状態', COUNT(*) FROM  effect_assignment_statuses
UNION ALL
SELECT 'card_layouts', 'カードレイアウト', COUNT(*) FROM  card_layouts
UNION ALL
SELECT 'card_layout_types', 'カードレイアウトタイプ', COUNT(*) FROM  card_layout_types
UNION ALL
SELECT 'card_layout_orbs', 'カードレイアウト色玉', COUNT(*) FROM  card_layout_orbs
UNION ALL
SELECT 'card_layout_orb_shapes', 'カードレイアウト色玉形状', COUNT(*) FROM  card_layout_orb_shapes
UNION ALL
SELECT 'rulesets', 'ルールセット', COUNT(*) FROM  rulesets
UNION ALL
SELECT 'erratum_categories', 'エラッタ分類コード', COUNT(*) FROM  erratum_categories
UNION ALL
SELECT 'display_tokens', '表示用トークン', COUNT(*) FROM  display_tokens;

-- =====================================================
-- View Count : 5 views total
-- =====================================================
