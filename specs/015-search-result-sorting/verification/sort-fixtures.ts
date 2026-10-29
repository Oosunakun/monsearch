import type { Card, Ability } from '~~/types/cards/finderCards'
import type { SourceCard } from '~~/shared/cardSearch/types'

const ability = (initiative: number | null): Ability => ({ initiative, charge: null, defender: null, ability_slots: [], affinities: [] })

// 本体の比較関数を使わず、契約表をそのまま入力と期待順にする。
export const makeSortFixtures = (base: Card): SourceCard[] => {
  const rows = [['N1', null, null], ['U0a', 'unit', 0], ['E3', 'equip', 3], ['U5', 'unit', 5], ['E0', 'equip', 0], ['U0b', 'unit', 0], ['Un', 'unit', -2], ['En', 'equip', -1], ['N2', null, null]] as const
  return rows.map(([id, group, value], sourceIndex) => {
    const card = structuredClone(base)
    card.card_id = id
    card.reference_label = `逆順-${9 - sourceIndex}`
    card.unit = group === 'unit' ? {
      level: value!, attack: value!, defense: value!, ability: ability(value),
      is_instant_summon: false, is_hero: false, hero_point: null,
      move_type_code: '', move_type_name: '', elements: [], races: [],
    } : null
    card.item = group === 'equip' ? { item_category_code: 'equip', item_category_name: '装備品', consume: null, bullet: null, equip: { attack: value!, defense: value!, ability: ability(value) } } : null
    card.rarity_code = sourceIndex === 3 ? 'Summoner' : sourceIndex === 4 ? 'Basic' : 'Unknown'
    return { card, sourceIndex }
  })
}

export const fixtureOrders = {
  id: { asc: ['E0', 'E3', 'En', 'N1', 'N2', 'U0a', 'U0b', 'U5', 'Un'], desc: ['Un', 'U5', 'U0b', 'U0a', 'N2', 'N1', 'En', 'E3', 'E0'] },
  level: { asc: ['Un', 'U0a', 'U0b', 'U5', 'N1', 'E3', 'E0', 'En', 'N2'], desc: ['U5', 'U0a', 'U0b', 'Un', 'N1', 'E3', 'E0', 'En', 'N2'] },
  atk: { asc: ['Un', 'U0a', 'U0b', 'U5', 'En', 'E0', 'E3', 'N1', 'N2'], desc: ['U5', 'U0a', 'U0b', 'Un', 'E3', 'E0', 'En', 'N1', 'N2'] },
  defense: { asc: ['Un', 'U0a', 'U0b', 'U5', 'En', 'E0', 'E3', 'N1', 'N2'], desc: ['U5', 'U0a', 'U0b', 'Un', 'E3', 'E0', 'En', 'N1', 'N2'] },
  initiative: { asc: ['Un', 'U0a', 'U0b', 'U5', 'En', 'E0', 'E3', 'N1', 'N2'], desc: ['U5', 'U0a', 'U0b', 'Un', 'E3', 'E0', 'En', 'N1', 'N2'] },
  rarity: { asc: ['N1', 'U0a', 'E3', 'U0b', 'Un', 'En', 'N2', 'E0', 'U5'], desc: ['U5', 'E0', 'N1', 'U0a', 'E3', 'U0b', 'Un', 'En', 'N2'] },
}
