import type { Card, Effect, FinderCards } from '~~/types/cards/finderCards'
import type { CardSearchResultItem } from '~~/shared/cardSearch/types'
import expectedProjection from './projection-expected.json'

export const textEffect: Effect = {
  effect_name: '', effect_activation_category_code: '', effect_activation_category_name: '',
  effect_activation_type_id: '', effect_activation_type_name: '',
  effect_activation_timing_id: '', effect_activation_timing_name: '',
  effect_condition_id: '', effect_condition_text: '', effect_condition_category_code: '', effect_condition_category_name: '',
  effect_type_code: '', effect_type_name: '', effect_cost_id: null, effect_cost_text: '', search_cost: null,
  effect_target_id: '', effect_target_name: '', effect_text: '補足。\n次の行。',
}

export const ordinaryEffect: Effect = {
  ...textEffect, effect_name: '固定能力', effect_type_code: 'ActionSkill', effect_type_name: '□完了型特殊能力',
  effect_activation_category_code: 'Battle', effect_activation_category_name: '戦闘',
  effect_text: '対象に効果を与える。',
}

export const fixtureCard: Card = {
  card_id: '00000000-0000-7000-8000-000000000001', reference_label: 'R24-001', name: '固定カード',
  card_category_code: 'Unit', card_category_name: 'ユニット',
  unit: { level: 0, attack: -1, defense: 2, is_instant_summon: false, is_hero: false, hero_point: null,
    move_type_code: 'Walk', move_type_name: '歩行', elements: [], races: [],
    ability: { initiative: 0, charge: null, defender: null, ability_slots: [], affinities: [] } },
  spell: null, item: null, land: null, ritual: null, summoner: null,
  card_types: [], blocks: [], factions: [], effects: [ordinaryEffect, textEffect], tags: [], errata: [],
  modification: { deck_restriction_count: 2 }, flavor_text: '非公開原文',
  rarity_code: 'Unknown', rarity_name: '未定義', illustrator_id: '', illustrator_name: '固定作者',
  product: { product_id: '00000000-0000-7000-8000-000000022d7e', product_name: '固定商品',
    product_category_code: '', product_category_name: '', short_name: '', official_short_name: '',
    provider_category_code: '', provider_category_name: '', provider_code: '', provider_name: '', release_date: null, product_note: '' },
  search_support: { full_text: '固定カード 対象', archetype_text: '固定種族', is_token: false },
}

export const makeCard = (overrides: Partial<Card> = {}): Card => Object.assign(structuredClone(fixtureCard), structuredClone(overrides))
export const displayCard = (): CardSearchResultItem => structuredClone(expectedProjection)
export const smallFile = (): FinderCards => ({ version: 'test', generated_at: '2026-10-31', cards: [makeCard(),
  makeCard({ card_id: '00000000-0000-7000-8000-000000000002', unit: null, card_category_code: 'Spell', card_category_name: '戦闘スペル', spell: { elements: [] } }),
  makeCard({ card_id: '00000000-0000-7000-8000-000000000003', unit: null, card_category_code: 'Land', card_category_name: '地形', land: { land_limit: 8, land_category_code: '', land_category_name: '' } }),
] })

export const makeSearchCard = (): Card => {
  const card = makeCard({ rarity_code: 'SuperRare' })
  card.unit!.level = 2
  card.unit!.races = [{ race_id: '00000000-0000-7000-8000-000000033333', race_name: '固定種族' }]
  card.card_types = [{ card_type_id: '00000000-0000-7000-8000-000000011111', card_type_name: '固定タイプ' }]
  card.factions = [{ faction_id: '00000000-0000-7000-8000-000000022222', faction_name: '固定勢力' }]
  const affinity = { affinity_id: '00000000-0000-7000-8000-000000041e89', affinity_name: '固定耐性', affinity_category_code: 'Resistance', affinity_category_name: '耐性',
    damage_source_code: 'Source', damage_source_name: '火炎', damage_attribute_code: 'fire', damage_attribute_name: '火', is_effective_target: true, is_affinity_target: true, affinity_modifier_type_code: '', affinity_modifier_type_name: '' }
  card.unit!.ability!.affinities = [{ affinity, affinity_value: 0 }]
  return card
}

export const makeSearchEquipmentCard = (): Card => {
  const card = makeSearchCard()
  const ability = structuredClone(card.unit!.ability!)
  card.card_id = '00000000-0000-7000-8000-000000000004'
  card.card_category_code = 'Item'
  card.unit = null
  card.item = { item_category_code: 'equip', item_category_name: '装備品', consume: null, bullet: null, equip: { attack: 0, defense: 0, ability } }
  return card
}

// 境界の素材は本番・歴史入力から選ばず、値をここで明示する。
export const boundaryCards = (): Record<string, Card> => ({
  zero: makeCard({ unit: { ...fixtureCard.unit!, attack: 0, defense: 0 } }),
  positive: makeCard({ unit: { ...fixtureCard.unit!, level: 3, attack: 5, defense: 4 } }),
  negative: makeCard(),
  parentAbsent: makeCard({ unit: null }),
  abilityAbsent: makeCard({ unit: { ...fixtureCard.unit!, ability: null } }),
  equipment: makeCard({ unit: null, item: { item_category_code: 'equip', item_category_name: '装備品', consume: null, bullet: null,
    equip: { attack: 0, defense: -1, ability: { initiative: null, charge: 0, defender: null, ability_slots: [], affinities: [] } } } }),
  sameId: makeCard(),
  tied: makeCard({ card_id: '00000000-0000-7000-8000-000000000002' }),
  sameEffect: makeCard({ effects: [{ ...ordinaryEffect, effect_cost_id: 'known', effect_cost_text: 'コスト',
    search_cost: { alternatives: [{ costs: [{ type: 'spell', value: 'any', min: 1, max: 3 }, { type: 'other', value: 'trash', quantity: 1 }] }], has_other_cost: false } }] }),
  splitEffects: makeCard({ effects: [ordinaryEffect, { ...textEffect, effect_type_code: 'DeclareSkill', effect_text: '別効果の条件' }] }),
  unknownCost: makeCard({ effects: [{ ...ordinaryEffect, effect_cost_id: 'unknown', effect_cost_text: '不明', search_cost: undefined }] }),
  costFree: makeCard({ effects: [textEffect] }),
})
