import type { CardDetail, CardCategory } from '~~/types/card'
import type { CardListRow } from '~~/app/types/ui/cards'
import { mockCardDetails } from '~~/app/utils/mockData'

const categoryMap: Record<CardListRow['category'], CardCategory> = {
  Unit: 'Unit',
  Spell: 'Spell',
  Item: 'Item',
  Ritual: 'Ritual',
  Land: 'Land',
  Summoner: 'Summoner',
  Token: 'Token'
}

export const useCardDetailMapper = () => {
  const mapCardRowToDetail = (row: CardListRow): CardDetail => {
    const fromMock = mockCardDetails.find(card => card.id === row.id)
    if (fromMock) {
      return fromMock
    }

    return {
      id: row.id,
      name: row.cardName,
      card_category: categoryMap[row.category] ?? 'Token',
      rarity: row.rarity,
      element: [],
      product_note: `${row.setCode}-${row.id}`,
      type: [],
      effects: [{ category: 'none', text: `${row.cardName} のダミー効果です。` }]
    }
  }

  return {
    mapCardRowToDetail
  }
}
