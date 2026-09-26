import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { matchesCardSearch } from '~~/server/utils/cardSearch/search'

let cardsHandler: EventHandler

beforeAll(async () => {
  vi.stubGlobal('defineEventHandler', defineEventHandler)
  vi.stubGlobal('createError', createError)
  cardsHandler = (await import('./cards.get')).default
})

afterAll(() => vi.unstubAllGlobals())

describe('GET /api/cards contract', () => {
  const source = readFileSync(resolve('server/api/cards.get.ts'), 'utf8')
  it('graceful parsingと既定制御値を適用する', () => {
    expect(parseCardSearchQuery({ unknown: 'x', lv: 'broken', cc: 'unit' }).cardCategory).toBe('unit')
    expect(source).toContain("positiveInteger(lastString(query.page), 1)")
    expect(source).toContain("'CARD_SEARCH_FAILED'")
  })
  it('filterからprojectionまでserverで処理する', () => {
    for (const operation of ['matchesCardSearch', 'sortSourceCards', 'paginate', 'projectCards']) expect(source).toContain(operation)
    expect(source).toContain('categoryBreakdown')
  })
  it('効果コストURL条件をAPIと同じcriteria/filter境界で適用する', () => {
    const query = parseCardSearchQuery({ coe: 'trash:1' })
    const source = getSourceCards().map(item => item.card)
    const matched = source.filter(card => matchesCardSearch(card, query))
    expect(matched.length).toBeGreaterThan(0)
    expect(matched.every(card => card.effects.some(effect => effect.search_cost?.alternatives.some(alternative => alternative.costs.some(cost => {
      const quantity = cost.quantity ?? cost.max
      return cost.type === 'other' && cost.value === 'trash' && typeof quantity === 'number' && quantity >= 1
    }))))).toBe(true)
  })

  it('実際のAPI handlerレスポンスで効果コスト条件により結果が絞られる', async () => {
    const handler = toWebHandler(createApp().use('/api/cards', cardsHandler))
    const [unfiltered, filtered] = await Promise.all([
      handler(new Request('http://localhost/api/cards?perPage=100')),
      handler(new Request('http://localhost/api/cards?coe=trash%3A1&perPage=100')),
    ])
    const allBody = await unfiltered.json() as { totalCount: number }
    const filteredBody = await filtered.json() as { totalCount: number, items: Array<{ reference_label: string }> }
    const criteria = parseCardSearchQuery({ coe: 'trash:1' })
    const expected = getSourceCards().map(item => item.card).filter(card => matchesCardSearch(card, criteria))

    expect(unfiltered.status).toBe(200)
    expect(filtered.status).toBe(200)
    expect(filteredBody.totalCount).toBe(expected.length)
    expect(filteredBody.totalCount).toBeGreaterThan(0)
    expect(filteredBody.totalCount).toBeLessThan(allBody.totalCount)
    expect(filteredBody.items.map(item => item.reference_label)).toEqual(expected.slice(0, 100).map(card => card.reference_label))
  })
})
