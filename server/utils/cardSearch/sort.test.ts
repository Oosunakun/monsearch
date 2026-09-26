import { describe, expect, it } from 'vitest'
import { getSourceCards } from './dataSource'
import { sortSourceCards } from './sort'

describe('sortSourceCards', () => {
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
