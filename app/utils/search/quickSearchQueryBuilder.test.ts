import { describe, expect, it } from 'vitest'
import type { QuickSearchState } from '~~/app/types/ui/layout'
import { buildQuickSearchQuery } from './quickSearchQueryBuilder'

const createState = (overrides: Partial<QuickSearchState> = {}): QuickSearchState => ({
  selectedCardPool: 'open',
  selectedSearchType: 'name',
  searchText: 'Dragon',
  ...overrides,
})

describe('buildQuickSearchQuery', () => {
  it.each([
    ['name', 'nm'],
    ['race-type', 'att'],
    ['keyword', 'kw'],
  ] as const)('maps %s to the single %s condition', (selectedSearchType, alias) => {
    expect(buildQuickSearchQuery(createState({ selectedSearchType, searchText: '  青い 竜 🐉  ' })))
      .toEqual({ [alias]: '青い 竜 🐉' })
  })

  it('is deterministic and leaves logical text unencoded', () => {
    const state = createState({ selectedSearchType: 'keyword', searchText: ' a,b:c=1 & ? 🐉 ' })
    const results = Array.from({ length: 100 }, () => buildQuickSearchQuery(state))
    expect(results.every(result => JSON.stringify(result) === JSON.stringify(results[0]))).toBe(true)
    expect(results[0]).toEqual({ kw: 'a,b:c=1 & ? 🐉' })
  })

  it.each([
    { searchText: '' },
    { searchText: ' \t\n ' },
    { selectedSearchType: '' },
    { selectedSearchType: 'unsupported' },
    { searchText: 42 },
  ])('omits invalid runtime input %#', invalid => {
    const state = { ...createState(), ...invalid } as unknown as QuickSearchState
    expect(buildQuickSearchQuery(state)).toEqual({})
  })

  it('omits card pool and does not mutate input', () => {
    const state = createState({ selectedCardPool: 'neo-stand', searchText: '  Dragon  ' })
    const snapshot = { ...state }
    expect(buildQuickSearchQuery(state)).toEqual({ nm: 'Dragon' })
    expect(state).toEqual(snapshot)
  })
})
