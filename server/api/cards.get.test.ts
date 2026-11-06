import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { matchesCardSearch } from '~~/server/utils/cardSearch/search'
import * as dataSource from '~~/server/utils/cardSearch/dataSource'
import type { CardSearchResultItem, CardSearchResultPage } from '~~/server/types/cardSearch'
import baseline from '~~/server/api/fixtures/cards-response-baseline.json'
import catalogOracle from '~~/specs/014-search-catalog-normalization/verification/expected-catalog-results.json'
import type { Card } from '~~/types/cards/finderCards'
import * as catalogNormalizer from '~~/shared/cardSearch/normalizeCatalogText'
import approvedBaseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import { createHash } from 'node:crypto'
import { parseQuery } from 'vue-router'
import { prepareCardSearch, runCardSearch } from '~~/shared/cardSearch/runner'
import { normalizeClientSearchQuery } from '~~/shared/cardSearch/clientQuery'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS, CARD_SEARCH_PER_PAGE } from '~~/shared/cardSearch/types'
import { expectedIds, revisedAtkPageIds } from '~~/specs/015-search-result-sorting/verification/sort-expectations'
import { fixtureOrders, makeSortFixtures } from '~~/specs/015-search-result-sorting/verification/sort-fixtures'

import { historicalSources } from '~~/tests/fixtures/cardSearch/sources'
import { makeSearchCard, makeCard } from '~~/tests/fixtures/cardSearch/cards'
beforeEach(() => { vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(historicalSources()) })

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

describe('015 APIの6キー・固定順・全ページとCSR parity', () => {
  for (const key of CARD_SEARCH_SORT_KEYS) for (const order of CARD_SEARCH_SORT_ORDERS) {
    it(`${key}/${order}は手書き合成契約と一致`, async () => {
      const sources = makeSortFixtures(makeCard()).reverse()
      vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(sources)
      const response = await requestCards(`sort=${key}&order=${order}`)
      const body: CardSearchResultPage = await response.json()
      expect(response.status).toBe(200)
      expect(body.sort).toEqual({ key, order })
      expect(body.items.map(card => card.card_id)).toEqual(fixtureOrders[key][order])
      expect(body).toEqual(runCardSearch(sources, prepareCardSearch({ sort: key, order })))
    })
    it.each(CARD_SEARCH_PER_PAGE)(`${key}/${order}/%iの全ページと境界`, async perPage => {
      const ids = expectedIds(key, order)
      const projections: Record<string, CardSearchResultItem> = approvedBaseline.projectedItems
      const totalPages = Math.ceil(ids.length / perPage)
      const reference: CardSearchResultPage = await (await requestCards(`perPage=${perPage}`)).json()
      const all: string[] = []
      for (const page of [...Array.from({ length: totalPages }, (_, i) => i + 1), 999]) {
        const query = `sort=${key}&order=${order}&perPage=${perPage}&page=${page}`
        const response = await requestCards(query)
        const body: CardSearchResultPage = await response.json()
        const effective = Math.min(page, totalPages)
        expect(response.status).toBe(200)
        expect(body).toEqual({ ...reference, page: effective, sort: { key, order }, items: ids.slice((effective - 1) * perPage, effective * perPage).map(id => projections[id]) })
        expect(body).toEqual(runCardSearch(getSourceCards(), prepareCardSearch(normalizeClientSearchQuery(parseQuery(query)))))
        if (page !== 999) all.push(...body.items.map(card => card.card_id))
      }
      expect(all).toEqual(ids)
      expect(new Set(all).size).toBe(ids.length)
      const source = getSourceCards()
      for (const count of [0, 1]) {
        vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(source.slice(0, count))
        const query = `sort=${key}&order=${order}&perPage=${perPage}&page=999`
        const body: CardSearchResultPage = await (await requestCards(query)).json()
        expect(body).toMatchObject({ page: 1, totalPages: 1, totalCount: count })
        expect(body).toEqual(runCardSearch(source.slice(0, count), prepareCardSearch(normalizeClientSearchQuery(parseQuery(query)))))
      }
    })
  }
})

const parseFixtureQuery = (query: Record<string, string | undefined>) => parseCardSearchQuery(
  Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string] => entry[1] !== undefined)),
)

const makeCatalogCards = (): Card[] => catalogOracle.fixtureCards.map(fixture => {
  const card = makeSearchCard()
  card.card_id = fixture.id
  card.name = fixture.name
  card.search_support.full_text = fixture.full_text
  card.search_support.archetype_text = fixture.archetype_text
  card.unit!.races = [{ ...card.unit!.races[0]!, race_name: fixture.race }]
  const type = makeSearchCard().card_types[0]!
  card.card_types = [{ ...type, card_type_name: fixture.type }]
  return card
})

const expectAllCatalogPages = async (query: Record<string, string | undefined>, ids: readonly string[]) => {
  const allIds: string[] = []
  for (let page = 1, totalPages = 1; page <= totalPages; page += 1) {
    const parameters = new URLSearchParams({ perPage: '20', page: String(page), sort: 'id', order: 'asc' })
    for (const [key, value] of Object.entries(query)) if (value !== undefined) parameters.set(key, value)
    const response = await requestCards(parameters.toString())
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    expect(body.totalCount).toBe(ids.length)
    expect(body.page).toBe(page)
    expect(body.perPage).toBe(20)
    expect(body.totalPages).toBe(Math.max(1, Math.ceil(ids.length / 20)))
    expect(body.sort).toEqual({ key: 'id', order: 'asc' })
    totalPages = body.totalPages
    allIds.push(...body.items.map(item => item.card_id))
  }
  expect(allIds).toEqual([...ids].sort((a, b) => a.localeCompare(b)))
}

describe('GET /api/cards kw catalog契約', () => {
  it.each(catalogOracle.realCases.filter(example => 'kw' in example.query && !('att' in example.query)))('$idの全ページを独立oracleと比較する', async example => {
    await expectAllCatalogPages(example.query, example.ids)
  })
  it.each(catalogOracle.fixtureCases.filter(example => 'kw' in example.query && !('att' in example.query)))('$idは表示値とcatalogを区別する', async example => {
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(makeCatalogCards().map((card, sourceIndex) => ({ card, sourceIndex })))
    await expectAllCatalogPages(example.query, example.ids)
  })
  it.each(catalogOracle.boundaries)('$idのAPI境界', async example => {
    const card = makeSearchCard()
    card.card_id = 'boundary'
    card.name = example.query?.trim() || '表示原文'
    card.search_support.full_text = example.target
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue([{ card, sourceIndex: 0 }])
    await expectAllCatalogPages(example.query === undefined ? {} : { kw: example.query }, example.ids)
  })
})

describe('GET /api/cards att catalog契約', () => {
  it.each(catalogOracle.realCases.filter(example => 'att' in example.query))('$idの全ページを独立oracleと比較する', async example => {
    await expectAllCatalogPages(example.query, example.ids)
  })
  it.each(catalogOracle.fixtureCases.filter(example => 'att' in example.query))('$idは専用値と表示種族・種別を区別する', async example => {
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(makeCatalogCards().map((card, sourceIndex) => ({ card, sourceIndex })))
    await expectAllCatalogPages(example.query, example.ids)
  })
  it.each(catalogOracle.boundaries)('$idのAPI境界', async example => {
    const card = makeCatalogCards()[0]!
    card.card_id = 'boundary'
    card.name = example.query?.trim() || '表示原文'
    card.unit!.races[0]!.race_name = example.query ?? '表示種族'
    card.card_types[0]!.card_type_name = example.query ?? '表示種別'
    card.search_support.archetype_text = example.target
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue([{ card, sourceIndex: 0 }])
    await expectAllCatalogPages(example.query === undefined ? {} : { att: example.query }, example.ids)
  })
})

describe('GET /api/cards prepared matcherの呼出構造', () => {
  for (const count of [0, 1, 7, 101]) {
    it.each([
      { kw: 'CATALOG-ONLY' }, { att: 'ARCHETYPE-ONLY' },
      { kw: 'CATALOG-ONLY', att: 'ARCHETYPE-ONLY' }, {}, { kw: ' \n\t ', att: '　' },
    ])(`${count}枚でも%jをカード参照前に各一回だけ変換する`, async query => {
      const card = makeCatalogCards()[0]!
      const criteria = parseFixtureQuery(query)
      const expectedArguments = [criteria.keyword, criteria.archetypeText].filter(Boolean).map(value => [value])
      const normalize = vi.spyOn(catalogNormalizer, 'normalizeCatalogText')
      const sources = Array.from({ length: count }, (_, sourceIndex) => {
        const cloned = structuredClone(card)
        cloned.card_id = `fixture-${String(sourceIndex).padStart(3, '0')}`
        return { sourceIndex, get card() {
          expect(normalize.mock.calls).toEqual(expectedArguments)
          return cloned
        } }
      })
      vi.spyOn(dataSource, 'getSourceCards').mockImplementation(() => {
        expect(normalize.mock.calls).toEqual(expectedArguments)
        return sources
      })
      const parameters = new URLSearchParams()
      for (const [key, value] of Object.entries(query)) if (value !== undefined) parameters.set(key, value)
      const response = await requestCards(parameters.toString())
      const body: CardSearchResultPage = await response.json()
      expect(response.status).toBe(200)
      expect(body.totalCount).toBe(count)
      expect(body.items.map(item => item.card_id)).toEqual(sources.slice(0, 20).map(source => source.card.card_id))
      expect(normalize.mock.calls).toEqual(expectedArguments)
    })
  }
})

describe('GET /api/cards US3 承認済みT002 baseline回帰', () => {
  const projectedItems: Record<string, unknown> = approvedBaseline.projectedItems
  it.each(approvedBaseline.cases)('$nameの全ページ・境界・投影原文を維持する', async example => {
    const allIds: string[] = []
    for (const page of [...example.api.pages, ...example.api.boundaries]) {
      const response = await requestCards(page.requestQuery)
      const body: CardSearchResultPage = await response.json()
      expect(response.status).toBe(page.status)
      const changed = new URLSearchParams(page.requestQuery).get('sort') === 'atk'
      const ids = changed ? revisedAtkPageIds(page.requestQuery, example.api.allIds) : page.response.items
      expect(body).toEqual({ ...page.response, items: ids.map(id => projectedItems[id]) })
      expect(body.items.every(item => !('search_support' in item) && !('full_text' in item) && !('archetype_text' in item))).toBe(true)
      if ('responseSha256' in page && 'responseFields' in page) {
        if (!changed) expect(createHash('sha256').update(JSON.stringify(body)).digest('hex')).toBe(page.responseSha256)
        expect(Object.keys(body)).toEqual(page.responseFields)
        allIds.push(...body.items.map(item => item.card_id))
      }
    }
    expect(allIds).toEqual(new URLSearchParams(example.api.pages[0]!.requestQuery).get('sort') === 'atk'
      ? expectedIds('atk', new URLSearchParams(example.api.pages[0]!.requestQuery).get('order') === 'desc' ? 'desc' : 'asc', example.api.allIds) : example.api.allIds)
  })
})

describe('GET /api/cards US3 catalog付き結果処理', () => {
  const projections: Record<string, CardSearchResultItem> = approvedBaseline.projectedItems
  const ids = catalogOracle.realCases.find(example => example.id === 'broad-keyword')!.ids
  for (const sort of CARD_SEARCH_SORT_KEYS) {
    for (const order of CARD_SEARCH_SORT_ORDERS) {
      it.each([20, 50, 100])(`kw付き${sort}/${order}/%iの全ページ・集計・投影を固定ID集合と比較する`, async perPage => {
        const sortedIds = expectedIds(sort, order, ids)
        const expectedCounts = new Map<string, number>()
        for (const id of ids) {
          const category = projections[id]!.card_category_code
          expectedCounts.set(category, (expectedCounts.get(category) ?? 0) + 1)
        }
        const expectedBreakdown = [...expectedCounts].map(([categoryCode, count]) => ({ categoryCode, count }))
        const totalPages = Math.ceil(ids.length / perPage)
        const allIds: string[] = []
        for (let page = 1; page <= totalPages; page += 1) {
          const response = await requestCards(new URLSearchParams({ kw: '対象', sort, order, perPage: String(perPage), page: String(page) }).toString())
          const body: CardSearchResultPage = await response.json()
          expect(response.status).toBe(200)
          expect(body.totalCount).toBe(ids.length)
          expect(body.categoryBreakdown).toEqual(expectedBreakdown)
          expect(body).toMatchObject({ page, perPage, totalPages, sort: { key: sort, order } })
          const pageIds = sortedIds.slice((page - 1) * perPage, page * perPage)
          expect(body.items).toEqual(pageIds.map(id => projections[id]))
          allIds.push(...body.items.map(item => item.card_id))
        }
        expect(allIds).toEqual(sortedIds)
      })
    }
  }

  it('固定oracleと分類・集計・原文保持・公開DTOを同時に確認する', async () => {
    const cards = makeCatalogCards()
    cards[0]!.search_support.is_token = true
    const before = JSON.stringify(cards)
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(cards.map((card, sourceIndex) => ({ card, sourceIndex })))
    const response = await requestCards(new URLSearchParams({ kw: 'ＣＡＴＡＬＯＧ－ＯＮＬＹ', att: 'ARCHETYPE-ONLY', cc: 'token' }).toString())
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    expect(body.items.map(item => item.card_id)).toEqual(['A'])
    expect(body.totalCount).toBe(1)
    expect(body.categoryBreakdown).toEqual([{ categoryCode: 'Unit', count: 1 }])
    expect(body.items[0]!.name).toBe(catalogOracle.fixtureCards[0]!.name)
    expect(body.items[0]).not.toHaveProperty('search_support')
    expect(JSON.stringify(cards)).toBe(before)
    await expectAllCatalogPages({ kw: 'catalog-only', att: 'archetype-only', cc: 'unit' }, [])
  })

  it('catalog検索にもCARD_SEARCH_FAILEDの既存契約を維持する', async () => {
    const warn = vi.spyOn(console, 'warn')
    vi.spyOn(dataSource, 'getSourceCards').mockImplementation(() => { throw new Error('catalog fixture failure') })
    const response = await requestCards('kw=abc&att=abc')
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toMatchObject({ statusCode: 500, data: { statusCode: 500, code: 'CARD_SEARCH_FAILED', message: 'カード検索に失敗しました' } })
    expect(JSON.stringify(body)).not.toContain('catalog fixture failure')
    expect(warn.mock.calls.flat().join(' ')).not.toContain('[h3] Please prefer using `message` for longer error messages instead of `statusMessage`')
    expect(body).not.toHaveProperty('statusMessage')
  })
})

describe('GET /api/cards 検索結果の回帰', () => {
  it.each(baseline.cases)('$query の既存レスポンスを維持する', async ({ query, response: expected }) => {
    const response = await requestCards(query)
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    const withoutRestriction = {
      ...body,
      items: body.items.map(({ deck_restriction_count: _count, ...item }) => item),
    }
    const changed = new URLSearchParams(query).get('sort') === 'atk'
    const projections: Record<string, CardSearchResultItem> = approvedBaseline.projectedItems
    expect(withoutRestriction).toEqual(changed ? {
      ...expected,
      items: revisedAtkPageIds(query, approvedBaseline.classifications.map(row => row.card_id)).map(id => {
        const { deck_restriction_count: _count, ...item } = projections[id]!
        return item
      }),
    } : expected)
  })

  it('同名カードのsortとページ変更後もIDと制限値が対応し、nullのカードも残る', async () => {
    const original = { card: makeSearchCard(), sourceIndex: 0 }
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
    const source = { card: makeSearchCard(), sourceIndex: 0 }
    source.card.modification = { deck_restriction_count: value }
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue([source])
    const response = await requestCards()
    const body: CardSearchResultPage = await response.json()
    expect(response.status).toBe(200)
    expect(body.items).toHaveLength(1)
    expect(body.items[0]).toHaveProperty('deck_restriction_count', value)
  })

  it('既存のデータソース障害はCARD_SEARCH_FAILEDの500となる', async () => {
    const warn = vi.spyOn(console, 'warn')
    vi.spyOn(dataSource, 'getSourceCards').mockImplementation(() => { throw new Error('fixture failure') })
    const response = await requestCards()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toMatchObject({ statusCode: 500, data: { statusCode: 500, code: 'CARD_SEARCH_FAILED', message: 'カード検索に失敗しました' } })
    expect(JSON.stringify(body)).not.toContain('fixture failure')
    expect(warn.mock.calls.flat().join(' ')).not.toContain('[h3] Please prefer using `message` for longer error messages instead of `statusMessage`')
  })
})

describe('GET /api/cards contract', () => {
  const source = readFileSync(resolve('server/api/cards.get.ts'), 'utf8')
  it('graceful parsingと既定制御値を適用する', () => {
    expect(parseCardSearchQuery({ unknown: 'x', lv: 'broken', cc: 'unit' }).cardCategory).toBe('unit')
    expect(readFileSync(resolve('shared/cardSearch/runner.ts'), 'utf8')).toContain("positiveInteger(lastString(query.page), 1)")
    expect(source).toContain("'CARD_SEARCH_FAILED'")
  })
  it('filterからprojectionまでserverで処理する', () => {
    expect(source).toContain('runCardSearch(getSourceCards(), prepared)')
    const runner = readFileSync(resolve('shared/cardSearch/runner.ts'), 'utf8')
    for (const operation of ['createCardSearchMatcher', 'sortSourceCards', 'paginate', 'projectCards', 'categoryBreakdown']) expect(runner).toContain(operation)
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

describe('HTTP APIとCSR transport/DTO parity', () => {
  beforeEach(() => vi.restoreAllMocks())
  it.each([
    '', 'kw=ダメージ', 'cc=summoner&kw=アーニャ', 'att=ドラゴン', 'kw=存在しない検索語CSR',
    'coe=trash:1', 'sls=none', 'etx=ダメージ&coe=trash:1', 'lv=gte:3&cc=unit',
    'kw=literal%2B%25&att=', 'kw=&kw=ダメージ', 'kw&att=null',
    'sort=rarity&order=desc&perPage=50&page=2', 'sort=atk&order=asc&perPage=100&page=99',
    'sort=invalid&order=invalid&perPage=99&page=-1', 'perPage=100&perPage=20&page=1&page=2',
  ])('%sの完全DTO/順序/集計/ページングが一致する', async query => {
    const response = await requestCards(query)
    expect(response.status).toBe(200)
    const csr = runCardSearch(getSourceCards(), prepareCardSearch(normalizeClientSearchQuery(parseQuery(query))))
    expect(JSON.parse(JSON.stringify(csr))).toEqual(await response.json())
  })
  it('clientのnull/undefined/配列/記号を従来$fetchのHTTP transportと同じ値にする', async () => {
    // H3をブラウザーへ持ち込まず、実際のHTTP parserを独立した比較元にする。
    const { withQuery } = await import('ufo')
    const { getQuery } = await import('h3')
    const echo = toWebHandler(createApp().use(defineEventHandler(event => getQuery(event))))
    for (const query of [
      { kw: null, att: undefined }, { kw: ['ダメージ', null, '＋+%'] },
      { kw: [], att: ['ドラゴン'] }, { kw: '', etx: 'a+b%20/全角　', constructor: 'ignore' },
    ]) {
      const response = await echo(new Request(withQuery('http://localhost/echo', query)))
      expect(normalizeClientSearchQuery(query)).toEqual(await response.json())
    }
  })
})
