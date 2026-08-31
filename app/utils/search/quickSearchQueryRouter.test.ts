import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { buildQuickSearchQuery } from './quickSearchQueryBuilder'

describe('quick search router round trip', () => {
  it.each([
    ['name', '  青い 竜 🐉  '],
    ['race-type', '竜族 / 英雄'],
    ['keyword', 'a,b:c=1 & ? 🐉'],
  ] as const)('preserves %s Unicode and reserved punctuation', async (selectedSearchType, searchText) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    const query = buildQuickSearchQuery({ selectedCardPool: 'open', selectedSearchType, searchText })
    await router.push({ path: '/cards', query })
    const firstPath = router.currentRoute.value.fullPath
    expect(router.currentRoute.value.query).toEqual(query)
    await router.push(firstPath)
    expect(router.currentRoute.value.query).toEqual(query)
    expect(router.currentRoute.value.fullPath).toBe(firstPath)
  })
})
