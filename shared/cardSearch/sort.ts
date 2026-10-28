import type { SourceCard, CardSearchSortKey, CardSearchSortOrder } from './types'

const rarityOrder: Record<string, number> = { Basic: 1, Common: 2, Uncommon: 3, Rare: 4, SuperRare: 5, Special: 6, DragonJr: 7, Promotion: 8, Summoner: 9 }

export const sortSourceCards = (cards: readonly SourceCard[], key: CardSearchSortKey, order: CardSearchSortOrder): SourceCard[] =>
  [...cards].sort((left, right) => {
    const result = key === 'id'
      ? left.card.card_id.localeCompare(right.card.card_id)
      : key === 'rarity'
        ? (rarityOrder[left.card.rarity_code] ?? 0) - (rarityOrder[right.card.rarity_code] ?? 0)
        : (left.card.unit?.attack ?? 0) - (right.card.unit?.attack ?? 0)
    return result === 0 ? left.sourceIndex - right.sourceIndex : (order === 'asc' ? result : -result)
  })
