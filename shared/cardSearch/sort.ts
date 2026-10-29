import type { SourceCard, CardSearchSortKey, CardSearchSortOrder } from './types'
import type { Card } from '~~/types/cards/finderCards'

const rarityOrder: Record<string, number> = { Basic: 1, Common: 2, Uncommon: 3, Rare: 4, SuperRare: 5, Special: 6, DragonJr: 7, Promotion: 8, Summoner: 9 }

const numericValue = (card: Card, key: Exclude<CardSearchSortKey, 'id' | 'rarity'>): { group: number, value: number } => {
  const unit = key === 'initiative' ? card.unit?.ability?.initiative : card.unit?.[key === 'atk' ? 'attack' : key]
  if (unit != null) return { group: 0, value: unit }
  const equip = key === 'level' ? undefined
    : key === 'initiative' ? card.item?.equip?.ability?.initiative : card.item?.equip?.[key === 'atk' ? 'attack' : key]
  if (equip != null) return { group: 1, value: equip }
  return { group: 2, value: 0 }
}

export const sortSourceCards = (cards: readonly SourceCard[], key: CardSearchSortKey, order: CardSearchSortOrder): SourceCard[] =>
  [...cards].sort((left, right) => {
    let result: number
    if (key === 'id') result = left.card.card_id.localeCompare(right.card.card_id)
    else if (key === 'rarity') result = (rarityOrder[left.card.rarity_code] ?? 0) - (rarityOrder[right.card.rarity_code] ?? 0)
    else {
      const a = numericValue(left.card, key)
      const b = numericValue(right.card, key)
      if (a.group !== b.group) return a.group - b.group
      result = a.value - b.value
    }
    return result === 0 ? left.sourceIndex - right.sourceIndex : (order === 'asc' ? result : -result)
  })
