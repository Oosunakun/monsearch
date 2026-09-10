import { describe, expect, it } from 'vitest'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { cardSearchParityQueries } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { getSourceCards } from './dataSource'
import { searchCards } from './search'

describe('searchCards', () => {
  it.each(cardSearchParityQueries)('$name を入力変更なしで評価する', ({ query }) => {
    const criteria = parseCardSearchQuery(query)
    const snapshot = structuredClone(criteria)
    const result = searchCards(getSourceCards().map(item => item.card), criteria)
    expect(result.every(card => typeof card.card_id === 'string')).toBe(true)
    expect(criteria).toEqual(snapshot)
  })
  it('条件なしでは全件を返す', () => {
    const source = getSourceCards()
    expect(searchCards(source.map(item => item.card), parseCardSearchQuery({}))).toHaveLength(source.length)
  })
})
