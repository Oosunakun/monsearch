import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { parseCardSearchQuery } from './cardSearchQueryParser'
import { createFreshSearchForm } from './cardSearchQueryTestFixtures'
import { buildProductSearchLocation } from './productSearchLocation'

describe('card search router round trip', () => {
  it('preserves Unicode, spaces, emoji and reserved punctuation', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    const form = createFreshSearchForm(); form.name = '青い Dragon 🐉 &=,:?'
    const query = buildCardSearchQuery(form); await router.push({ path: '/cards', query })
    expect(buildCardSearchQuery(parseCardSearchQuery(router.currentRoute.value.query))).toEqual(query)
    const first = router.currentRoute.value.fullPath; await router.push({ path: '/cards', query })
    expect(router.currentRoute.value.fullPath).toBe(first)
  })

  it.each(['initial navigation', 'reload', 'bookmark/new tab/share'])('%s で product URL を安定して復元する', async () => {
    const location = buildProductSearchLocation('22d7e')!
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    await router.push(location)
    const logicalUrl = router.currentRoute.value.fullPath

    expect(logicalUrl).toBe('/cards?pd=22d7e')
    expect(parseCardSearchQuery(router.currentRoute.value.query).products).toEqual(['22d7e'])

    const freshRouter = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    await freshRouter.push(logicalUrl)
    expect(freshRouter.currentRoute.value.fullPath).toBe(logicalUrl)
    expect(parseCardSearchQuery(freshRouter.currentRoute.value.query).products).toEqual(['22d7e'])
  })

  it('uppercaseを含むShort UUIDをnavigation/reload後もlowercase canonical値で保持する', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    const canonicalQuery = buildCardSearchQuery(parseCardSearchQuery({ pd: '22D7E' }))
    await router.push({ path: '/cards', query: canonicalQuery })

    expect(router.currentRoute.value.fullPath).toBe('/cards?pd=22d7e')
    expect(buildCardSearchQuery(parseCardSearchQuery(router.currentRoute.value.query))).toEqual({ pd: '22d7e' })

    const freshRouter = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cards', component: { template: '<div />' } }] })
    await freshRouter.push(router.currentRoute.value.fullPath)
    expect(freshRouter.currentRoute.value.fullPath).toBe('/cards?pd=22d7e')
    expect(buildCardSearchQuery(parseCardSearchQuery(freshRouter.currentRoute.value.query))).toEqual({ pd: '22d7e' })
  })
})
