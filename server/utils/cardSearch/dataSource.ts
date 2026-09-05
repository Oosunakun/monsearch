import finderCardFile from '~~/app/utils/mockData/items/cards.json'
import type { Card, FinderCards } from '~~/types/cards/finderCards'

const finderCards = finderCardFile as unknown as FinderCards

export interface SourceCard {
  card: Card
  sourceIndex: number
}

export const getSourceCards = (): readonly SourceCard[] =>
  finderCards.cards.map((card, sourceIndex) => ({ card, sourceIndex }))
