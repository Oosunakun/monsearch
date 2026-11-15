import type { Card, FinderCards } from '~~/types/cards/finderCards'
import type { SourceCard } from '~~/shared/cardSearch/types'
import file from './historical/014-015/cards.json'
import { smallFile } from './cards'

export const sourcesFor = (cards: readonly Card[]): SourceCard[] => structuredClone(cards).map((card, sourceIndex) => ({ card, sourceIndex }))
export const historicalCards = (): Card[] => structuredClone((file as unknown as FinderCards).cards)
export const historicalSources = (): SourceCard[] => sourcesFor(historicalCards())
export const smallSources = (): SourceCard[] => sourcesFor(smallFile().cards)
