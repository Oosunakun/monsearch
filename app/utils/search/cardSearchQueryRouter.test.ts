import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { parseCardSearchQuery } from './cardSearchQueryParser'
import { createFreshSearchForm } from './cardSearchQueryTestFixtures'

describe('card search router round trip', () => {
  it('preserves Unicode, spaces, emoji and reserved punctuation', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    const form = createFreshSearchForm(); form.name = '青い Dragon 🐉 &=,:?'
    const query = buildCardSearchQuery(form); await router.push({ path: '/cards', query })
    expect(buildCardSearchQuery(parseCardSearchQuery(router.currentRoute.value.query))).toEqual(query)
    const first = router.currentRoute.value.fullPath; await router.push({ path: '/cards', query })
    expect(router.currentRoute.value.fullPath).toBe(first)
  })
})
