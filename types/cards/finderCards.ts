/* eslint-disable @typescript-eslint/no-empty-object-type */
// finderCards.ts
// 検索Webサイト表示用カードデータ定義
//
// 【ファイル分割方針】
//   このファイルは最終的に以下のJSONへ出力されることを想定しています。
//
//   cards.json          … Card[] の配列。カード1件につき1オブジェクト。
//                          stat_*/trait_*/feature_* を全てネストして持つ。
//                          マスター名称（_name）は非正規化して埋め込む。
//                          → 検索フィルタ・カード詳細表示の両方に利用する。
//
//   masters.json        … 以下のマスターテーブルを1ファイルにまとめる。
//                          card_categories / item_categories / land_categories /
//                          card_types / move_types / rarities / blocks / factions /
//                          elements / races / products / product_categories /
//                          providers / provider_categories /
//                          ability_slot_types / affinities / affinity_categories /
//                          affinity_modifier_types / damage_sources / damage_attributes /
//                          effect_activation_categories / effect_activation_types /
//                          effect_activation_timings / effect_condition_categories /
//                          effect_types / tag_categories / erratum_categories /
//                          display_tokens
//                          → UIのドロップダウン・フィルタ選択肢の生成に使う。
//                             effect_conditions / effect_costs / effect_targets は
//                             カード側に非正規化済みだが、検索プルダウン用途のため masters.json にも含む。
//
// 【DB → JSON 出力用 View 方針】
//   cards.json 出力用に v_finderCards という View を作成することを推奨します。
//   以下のテーブルを LEFT JOIN し、GROUP_CONCAT（またはJSON_GROUP_ARRAY）で
//   配列列を生成してください。
//     - cards (基底)
//     - stat_unit / stat_spell / stat_item / stat_item_consume /
//       stat_item_equip / stat_item_bullet / stat_land / stat_ritual / stat_summoner
//     - trait_card_types → card_types
//     - trait_blocks     → blocks
//     - trait_factions   → factions
//     - trait_elements   → elements  (stat_unit / stat_spell のサブ)
//     - trait_races      → races     (stat_unit のサブ)
//     - feature_abilities / feature_ability_slots → ability_slot_types
//     - feature_affinities → affinities → (affinity_categories, damage_sources,
//                                           damage_attributes, affinity_modifier_types)
//     - feature_effects  → effects → (effect_activation_categories,
//                                      effect_activation_types, effect_activation_timings,
//                                      effect_conditions → effect_condition_categories,
//                                      effect_types, effect_costs, effect_targets)
//     - trait_tags → tags → tag_categories
//     - feature_errata → erratum_categories
//     - rarities / products → (product_categories, providers → provider_categories)
//
//   出力時のフィルタ:
//     WHERE cards.edit_status_code = 'published'  （公開済みのみ）
//
//   masters.json 出力用 View は各マスターテーブルをそのままSELECTする形で
//   v_master_<テーブル名> として個別に作成し、アプリ側で1ファイルに結合するか、
//   SQLite の JSON 関数でまとめて出力する構成が扱いやすいです。

// Memo:
// - 既に議論済ですが、検索のコストパフォーマンスをモニタリングしつつ、必要に応じて構成をグレードアップする予定です。
//   そのため、「最終的に必ずIndexedDB/APIにする」という訳ではなく「重くなったので技術的にスケールアップする」という方針です。
//   - スタート時：finderCards.json, masters.json のファイル構成× LocalStorage保持。カード枚数300～400枚程度 ←いまここ
//   - アップデートフェーズ1：cards_index.json + cards_detail.json + masters.json の3ファイル構成 × LocalStorage保持。カード枚数1300～2000枚程度
//   - アップデートフェーズ2：IndexedDBやバックエンド構築してAPIによるデータ取得を想定。カード枚数3500～6000枚程度

import type { 
  Product, 
  Affinity, 
  CardType,
  Block,
  Faction,
  Element,
  Race,
  Tag
} from './masters'

// ---------------------------------------------------------------------------
// カードデータルート
// ---------------------------------------------------------------------------

/** cards.json のルートオブジェクト */
export interface FinderCards {
  /** スキーマバージョン（例: "1.0.0"） */
  version: string;
  /** 生成日時（ISO 8601） */
  generated_at: string;
  cards: Card[];
}

// ---------------------------------------------------------------------------
// カード本体
// ---------------------------------------------------------------------------

/** カード1件分のデータ（検索・詳細表示共用） */
export interface Card {
  // ── 基本情報 ─────────────────────────────────────────────
  /** カードID */
  card_id: string;
  /** 整理番号（表示用ラベル） */
  reference_label: string;
  /** カード名 */
  name: string;

  // ── カード分類 (card_categories) ─────────────────────────
  card_category_code: string;
  card_category_name: string;

  // ── カード種別詳細（カード分類に応じて1つだけ非null） ────
  /** ユニット詳細 (stat_unit) */
  unit: StatUnit | null;
  /** 戦闘スペル詳細 (stat_spell) */
  spell: StatSpell | null;
  /** アイテム詳細 (stat_item) */
  item: StatItem | null;
  /** 地形詳細 (stat_land) */
  land: StatLand | null;
  /** 儀式スペル詳細 (stat_ritual) */
  ritual: StatRitual | null;
  /** 召喚術師詳細 (stat_summoner) */
  summoner: StatSummoner | null;

  // ── トレイト（1対多・配列） ──────────────────────────────
  /** タイプ一覧 (trait_card_types → card_types) */
  card_types: CardType[];
  /** ブロック一覧 (trait_blocks → blocks) */
  blocks: Block[];
  /** 勢力一覧 (trait_factions → factions) */
  factions: Faction[];

  // ── フィーチャー ──────────────────────────────────────────
  /** カード効果一覧 (feature_effects → effects) */
  effects: Effect[];
  /** タグ一覧 (trait_tags → tags) */
  tags: Tag[];
  /** エラッタ一覧 (feature_errata) */
  errata: Erratum[];

  // ── 表示情報 ──────────────────────────────────────────────
  /** フレーバーテキスト */
  flavor_text: string;
  /** 出現頻度 (rarities) */
  rarity_code: string;
  rarity_name: string;
  /** イラストレーター */
  illustrator_id: string;
  illustrator_name: string;
  /** 収録カードセット (products) */
  product: Product;

  // ── 検索補助 ──────────────────────────────────────────────
  search_support: SearchSupport;
}

// ---------------------------------------------------------------------------
// カード種別詳細
// ---------------------------------------------------------------------------

/**
 * ユニット詳細 (stat_unit)
 *
 * 【設計メモ】
 *   DBでは feature_abilities / feature_affinities / feature_ability_slots は
 *   card_id に直接紐づいていますが、JSON上はユニット（と装備品）の文脈でのみ
 *   意味を持つため、StatUnit / StatItemEquip の子として持たせています。
 *   これにより表示ロジックがシンプルになります。
 *   View 生成時は card_id で JOIN し、カード分類に応じてネストしてください。
 */
export interface StatUnit {
  level: number;
  /** 即時召喚可否 */
  is_instant_summon: boolean;
  /** 英雄アイコン有無 */
  is_hero: boolean;
  /** 英雄点（is_hero=false なら 0） */
  hero_point: number;
  /** 進軍タイプ (move_types) */
  move_type_code: string;
  move_type_name: string;
  attack: number;
  defense: number;
  /** 属性一覧 (trait_elements → elements) */
  elements: Element[];
  /** 種族一覧 (trait_races → races) */
  races: Race[];
  /** 常備能力（存在しないユニットは null） */
  ability: Ability | null;
}

/** 戦闘スペル詳細 (stat_spell) */
export interface StatSpell {
  /** 属性一覧 (trait_elements → elements) */
  elements: Element[];
}

/** アイテム共通 (stat_item) */
export interface StatItem {
  /** アイテム分類 (item_categories) */
  item_category_code: string;
  item_category_name: string;
  /** 消耗品詳細（アイテム分類が消耗品の場合のみ非null） */
  consume: StatItemConsume | null;
  /** 装備品詳細（アイテム分類が装備品の場合のみ非null） */
  equip: StatItemEquip | null;
  /** 錬金弾詳細（アイテム分類が錬金弾の場合のみ非null） */
  bullet: StatItemBullet | null;
}

/** 消耗品詳細 (stat_item_consume) */
export interface StatItemConsume {
  // 現時点で固有フィールドなし（将来拡張用）
}

/** 装備品詳細 (stat_item_equip) */
export interface StatItemEquip {
  attack: number;
  defense: number;
  /** 常備能力（存在しない場合は null） */
  ability: Ability | null;
}

/** 錬金弾詳細 (stat_item_bullet) */
export interface StatItemBullet {
  // 現時点で固有フィールドなし（将来拡張用）
}

/** 地形詳細 (stat_land) */
export interface StatLand {
  land_limit: number;
  /** 地形分類 (land_categories) */
  land_category_code: string;
  land_category_name: string;
}

/** 儀式スペル詳細 (stat_ritual) */
export interface StatRitual {
  // 現時点で固有フィールドなし（将来拡張用）
}

/** 召喚術師詳細 (stat_summoner) */
export interface StatSummoner {
  arcana: string;
  secondary_name: string;
}

// ---------------------------------------------------------------------------
// 常備能力（StatUnit / StatItemEquip から参照）
// ---------------------------------------------------------------------------

/**
 * 常備能力セット (feature_abilities + feature_ability_slots + feature_affinities)
 *
 * DBでは3テーブルに分かれているが、JSON上は1オブジェクトに統合する。
 * feature_abilities は card_id ごとに sequence_number で複数行持てるが、
 * 実運用上1カードに1セットという前提であればオブジェクトでOK。
 * 複数セット対応が必要な場合は Ability[] に変更してください。
 */
export interface Ability {
  initiative: number;
  charge: number;
  defender: number;
  /** 常備能力枠一覧 (feature_ability_slots → ability_slot_types) */
  ability_slots: AbilitySlot[];
  /** ダメージ相性一覧 (feature_affinities → affinities) */
  affinities: AffinitySet[];
}

/** 常備能力枠 (feature_ability_slots) */
export interface AbilitySlot {
  ability_slot_type_code: string;
  ability_slot_type_name: string;
  ability_slot_category_code: string;
  ability_slot_category_name: string;
  slot_count: number;
}

/** 常備能力枠 (feature_ability_slots) */
export interface AbilitySlotCategory {
  ability_slot_type_code: string;
  ability_slot_type_name: string;
  slot_count: number;
}

/** ダメージ相性（カード紐づき、ダメージ補正値付き）(feature_affinities → affinities) */
export interface AffinitySet {
  /** 相性マスター詳細 */
  affinity: Affinity;
  /** ダメージ補正値 */
  affinity_value: number;
}

// ---------------------------------------------------------------------------
// カード効果
// ---------------------------------------------------------------------------

/**
 * カード効果 (feature_effects → effects)
 * effects テーブルのフィールドを全て非正規化して埋め込む。
 * 各id または code と紐づくテーブル は個別の検索用途として masters.json に組み込む。
 */
export interface Effect {
  effect_name: string;
  /** カード効果有効時期 (effect_activation_categories) */
  effect_activation_category_code: string;
  effect_activation_category_name: string;
  /** カード効果宣言タイプ (effect_activation_types) */
  effect_activation_type_id: string;
  effect_activation_type_name: string;
  /** カード効果宣言タイミング (effect_activation_timings) */
  effect_activation_timing_id: string;
  effect_activation_timing_name: string;
  /** 使用条件 (effect_conditions → effect_condition_categories) */
  effect_condition_id: string;
  effect_condition_text: string;
  effect_condition_category_code: string;
  effect_condition_category_name: string;
  /** カード効果タイプ (effect_types) */
  effect_type_code: string;
  effect_type_name: string;
  /** コスト (effect_costs) */
  effect_cost_id: string;
  effect_cost_text: string;
  /** 対象 (effect_targets) */
  effect_target_id: string;
  effect_target_name: string;
  /** 効果テキスト */
  effect_text: string;
}

// ---------------------------------------------------------------------------
// エラッタ
// ---------------------------------------------------------------------------

/** エラッタ (feature_errata → erratum_categories) */
export interface Erratum {
  erratum_category_id: string;
  erratum_category_name: string;
  before_text: string;
  after_text: string;
  revision_reason: string;
  /** 適用開始日（ISO 8601 date string） */
  effective_date: string;
  erratum_note: string;
}

// ---------------------------------------------------------------------------
// 検索補助
// ---------------------------------------------------------------------------

/**
 * 検索補助データ
 * 将来的にはフルテキスト検索用の結合テキストや
 * ファセット検索用の正規化済みフラグを追加する。
 */
export interface SearchSupport {
  full_text?: string;
  
  // トークンカード判定フラグ
  // card_category_code では判別不可のため tags で代替。 
  // 例：ユニットカードベースのトークン、地形カードベースのトークン等
  // tags の中に { tag_category_id = 'is_token', tag_value = 'true' }
  // が含まれている場合に true とする。
  is_token: boolean;

  // 以降、ページを作成しながら都度検討
  // 案➀：検索用のコード関連はこちらに集約する？
  // 案➁：組み合わせの検索など（装備とユニットの攻撃力をあわせて検索する等）
}
