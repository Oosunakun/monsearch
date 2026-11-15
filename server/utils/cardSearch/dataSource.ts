import finderCardFile from '~~/app/utils/mockData/items/cards.json'
import type { FinderCards } from '~~/types/cards/finderCards'
import type { SourceCard } from '~~/shared/cardSearch/types'

const finderCards = finderCardFile as unknown as FinderCards

export const getSourceCards = (): readonly SourceCard[] =>
  finderCards.cards.map((card, sourceIndex) => ({ card, sourceIndex }))
