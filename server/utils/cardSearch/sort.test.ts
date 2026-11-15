import { describe, expect, it } from 'vitest'
import { makeCard } from '~~/tests/fixtures/cardSearch/cards'
import { sourcesFor } from '~~/tests/fixtures/cardSearch/sources'
import { sortSourceCards } from './sort'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS } from '~~/shared/cardSearch/types'
import { makeSortFixtures, fixtureOrders } from '~~/specs/015-search-result-sorting/verification/sort-fixtures'
const getSourceCards = () => sourcesFor(Array.from({ length: 30 }, (_, i) => makeCard({ card_id: String(i) })))




describe('sortSourceCards', () => {
  for (const key of CARD_SEARCH_SORT_KEYS) {
    it.each(CARD_SEARCH_SORT_ORDERS)(`${key}/%sは手書き契約と一致し入力を保持する`, order => {
      const source = makeSortFixtures(makeCard()).reverse()
      const before = JSON.stringify(source)
      expect(sortSourceCards(source, key, order).map(row => row.card.card_id)).toEqual(fixtureOrders[key][order])
      expect(JSON.stringify(source)).toBe(before)
    })
  }
  it('両詳細はunit優先、initiative欠損はequip採用、NULLと親なしは最後', () => {
    const sources = makeSortFixtures(makeCard())
    const both = structuredClone(sources[1]!)
    both.card.item = structuredClone(sources[2]!.card.item)
    const missing = structuredClone(sources[1]!)
    missing.sourceIndex = 10
    missing.card.card_id = 'fallback'
    missing.card.unit!.ability!.initiative = null
    missing.card.item = structuredClone(sources[4]!.card.item)
    const absent = structuredClone(sources[1]!)
    absent.sourceIndex = 11
    absent.card.card_id = 'absent'
    absent.card.unit!.ability = null
    for (const order of CARD_SEARCH_SORT_ORDERS) {
      expect(sortSourceCards([absent, sources[0]!, missing, both], 'initiative', order).map(row => row.card.card_id)).toEqual(['U0a', 'fallback', 'N1', 'absent'])
      expect(sortSourceCards([sources[8]!, sources[0]!], 'initiative', order)).toEqual([sources[0], sources[8]])
      const duplicate = structuredClone(both)
      duplicate.sourceIndex = 12
      expect(sortSourceCards([duplicate, both], 'id', order).map(row => row.sourceIndex)).toEqual([1, 12])
    }
  })
  it.each(['level', 'atk', 'defense', 'initiative'] as const)('%sの全件欠損と装備品同値は両方向ともsourceIndex順', key => {
    const sources = makeSortFixtures(makeCard())
    const missing = [sources[8]!, sources[0]!]
    const duplicate = structuredClone(sources[4]!)
    duplicate.sourceIndex = 12
    duplicate.card.card_id = 'E0b'
    for (const order of CARD_SEARCH_SORT_ORDERS) {
      expect(sortSourceCards(missing, key, order).map(row => row.card.card_id)).toEqual(['N1', 'N2'])
      expect(sortSourceCards([duplicate, sources[4]!], key, order).map(row => row.card.card_id)).toEqual(['E0', 'E0b'])
    }
  })
  it.each(['id', 'rarity', 'atk'] as const)('%s の昇降順を決定的に返す', key => {
    const source = getSourceCards().slice(0, 30)
    expect(sortSourceCards(source, key, 'asc')).toEqual(sortSourceCards(source, key, 'asc'))
    expect(sortSourceCards(source, key, 'desc')).toHaveLength(source.length)
  })
  it('同値時はsource順を維持する', () => {
    const source = getSourceCards().slice(0, 3).map((item, index) => ({ ...item, sourceIndex: index, card: { ...item.card, rarity_code: 'Rare' } }))
    expect(sortSourceCards(source, 'rarity', 'desc').map(item => item.sourceIndex)).toEqual([0, 1, 2])
  })
})
