import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { matchesCardSearch } from '~~/server/utils/cardSearch/search'
import * as dataSource from '~~/server/utils/cardSearch/dataSource'
import type { CardSearchResultPage } from '~~/server/types/cardSearch'
import baseline from '~~/specs/013-deck-restriction-display/verification/api-baseline.json'

let cardsHandler: EventHandler

beforeAll(async () => {
  vi.stubGlobal('defineEventHandler', defineEventHandler)
  vi.stubGlobal('createError', createError)
  cardsHandler = (await import('./cards.get')).default
})

afterAll(() => vi.unstubAllGlobals())
afterEach(() => vi.restoreAllMocks())

const requestCards = (query = '') => toWebHandler(createApp().use('/api/cards', cardsHandler))(
  new Request(`http://localhost/api/cards?${query}`),
)

describe('GET /api/cards 検索結果の回帰', () => {
  it.each(baseline.cases)('$query の既存レスポンスを維持する', async ({ query, response: expected }) => {
    const response = await requestCards(query)
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    const withoutRestriction = {
      ...body,
      items: body.items.map(({ deck_restriction_count: _count, ...item }) => item),
    }
    expect(withoutRestriction).toEqual(expected)
  })

  it('同名カードのsortとページ変更後もIDと制限値が対応し、nullのカードも残る', async () => {
    const original = getSourceCards()[0]!
    const source = Array.from({ length: 21 }, (_, index) => {
      const item = structuredClone(original)
      item.sourceIndex = index
      item.card.card_id = `deck-${String(index).padStart(2, '0')}`
      item.card.reference_label = `FIXTURE-${index}`
      item.card.name = '同名検証カード'
      item.card.modification = { deck_restriction_count: [0, 1, 2, null][index % 4]! }
      return item
    })
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(source)
    for (const query of ['sort=id&order=asc', 'sort=id&order=desc', 'page=2&perPage=20']) {
      const response = await requestCards(query)
      const body: CardSearchResultPage = await response.json()
      expect(body.totalCount).toBe(21)
      expect(body.items).toHaveLength(query.includes('page=2') ? 1 : 20)
      for (const item of body.items) {
        expect(item.deck_restriction_count).toBe(source.find(value => value.card.card_id === item.card_id)!.card.modification!.deck_restriction_count)
      }
      if (!query.includes('page=2')) expect(body.items.some(item => item.deck_restriction_count === null)).toBe(true)
    }
  })
})

describe('GET /api/cards 枚数制限契約', () => {
  it.each([
    ['ラプラース', 'M20E-002', 0],
    ['ホーリー・フェニックス', 'M20E-041', 1],
    ['スペクター', 'M20E-073', 2],
    ['アーニャ', 'M20A-001', null],
    ['サラマンダー', 'M20A-007', null],
  ] as const)('%sの実データを返す', async (name, reference, expected) => {
    const response = await requestCards(`nm=${encodeURIComponent(name)}`)
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    expect(body.items.find(item => item.reference_label === reference)).toHaveProperty('deck_restriction_count', expected)
    for (const item of body.items) {
      expect(item).toHaveProperty('deck_restriction_count')
      expect(item.deck_restriction_count === null || typeof item.deck_restriction_count === 'number').toBe(true)
      expect(item).not.toHaveProperty('modification')
    }
  })

  it.each([3, 4, null])('実データにない値 %s も実handlerから返す', async value => {
    const source = structuredClone(getSourceCards()[0]!)
    source.card.modification = { deck_restriction_count: value }
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue([source])
    const response = await requestCards()
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    expect(body.items).toHaveLength(1)
    expect(body.items[0]).toHaveProperty('deck_restriction_count', value)
  })

  it('既存のデータソース障害はCARD_SEARCH_FAILEDの500となる', async () => {
    vi.spyOn(dataSource, 'getSourceCards').mockImplementation(() => { throw new Error('fixture failure') })
    const response = await requestCards()
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ data: { code: 'CARD_SEARCH_FAILED' } })
  })
})

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
