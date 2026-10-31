import { beforeEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { parseQuery } from 'vue-router'
import { historicalSources } from '~~/tests/fixtures/cardSearch/sources'
import { makeCard } from '~~/tests/fixtures/cardSearch/cards'
import baseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import catalogOracle from '~~/specs/014-search-catalog-normalization/verification/expected-catalog-results.json'
import { prepareCardSearch, runCardSearch } from './runner'
import { normalizeClientSearchQuery } from './clientQuery'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS, CARD_SEARCH_PER_PAGE } from './types'
import { expectedIds, revisedAtkPageIds, projected } from '~~/specs/015-search-result-sorting/verification/sort-expectations'
import { fixtureOrders, makeSortFixtures } from '~~/specs/015-search-result-sorting/verification/sort-fixtures'
let fixedSources = historicalSources()
beforeEach(() => { fixedSources = historicalSources() })
const getSourceCards = () => fixedSources








const search = (query: string) => runCardSearch(getSourceCards(), prepareCardSearch(normalizeClientSearchQuery(parseQuery(query))))

describe('CSR runnerの独立した固定oracle', () => {
  it.each(baseline.cases)('$nameの全ページ/境界/完全DTOはFeature014固定値と一致する', example => {
    for (const page of [...example.api.pages, ...example.api.boundaries]) {
      const result = search(page.requestQuery)
      const changed = new URLSearchParams(page.requestQuery).get('sort') === 'atk'
      const ids = changed ? revisedAtkPageIds(page.requestQuery, example.api.allIds) : page.response.items
      expect(result).toEqual({ ...page.response, items: ids.map(id => projected[id]) })
      if (!changed && 'responseSha256' in page && 'responseFields' in page) {
        const fields = page.responseFields as Array<keyof typeof result>
        const body = Object.fromEntries(fields.map(field => [field, result[field]]))
        expect(createHash('sha256').update(JSON.stringify(body)).digest('hex')).toBe(page.responseSha256)
      }
    }
  })
  it.each(catalogOracle.realCases)('$idの全ID/順序はcatalog固定oracleと一致する', example => {
    const params = new URLSearchParams({ perPage: '100' })
    for (const [key, value] of Object.entries(example.query)) if (value !== undefined) params.set(key, value)
    const ids: string[] = []
    for (let page = 1, pages = 1; page <= pages; page++) {
      params.set('page', String(page))
      const result = search(params.toString())
      expect(result.totalCount).toBe(example.ids.length)
      ids.push(...result.items.map(card => card.card_id))
      pages = result.totalPages
    }
    expect(ids).toEqual([...example.ids].sort((a, b) => a.localeCompare(b)))
  })
  it('sourceを変更せず、kw=ダメージは149件', () => {
    const before = JSON.stringify(getSourceCards())
    expect(search('kw=ダメージ').totalCount).toBe(149)
    search('sort=atk&order=desc&page=99&perPage=100')
    expect(JSON.stringify(getSourceCards())).toBe(before)
  })
})

describe('015 全件ソートからページを決定する契約', () => {
  for (const key of CARD_SEARCH_SORT_KEYS) for (const order of CARD_SEARCH_SORT_ORDERS) {
    it(`${key}/${order} 合成契約・入力非破壊`, () => {
      const source = makeSortFixtures(makeCard()).reverse()
      const query = { sort: key, order }
      const sourceBefore = JSON.stringify(source)
      const queryBefore = JSON.stringify(query)
      const prepared = prepareCardSearch(query)
      const before = JSON.stringify(prepared)
      const result = runCardSearch(source, prepared)
      expect(result.sort).toEqual({ key, order })
      expect(result.items.map(card => card.card_id)).toEqual(fixtureOrders[key][order])
      expect(JSON.stringify(prepared)).toBe(before)
      expect(JSON.stringify(query)).toBe(queryBefore)
      expect(JSON.stringify(source)).toBe(sourceBefore)
    })
    it.each(CARD_SEARCH_PER_PAGE)(`${key}/${order}/%i 全ページ・境界・DTO・集合・集計`, perPage => {
      const ids = expectedIds(key, order)
      const totalPages = Math.ceil(ids.length / perPage)
      const reference = search(`perPage=${perPage}`)
      const actual: string[] = []
      for (let page = 1; page <= totalPages; page++) {
        const result = search(`sort=${key}&order=${order}&perPage=${perPage}&page=${page}`)
        expect(result).toEqual({ ...reference, page, sort: { key, order }, items: ids.slice((page - 1) * perPage, page * perPage).map(id => projected[id]) })
        actual.push(...result.items.map(card => card.card_id))
      }
      expect(actual).toEqual(ids)
      expect(new Set(actual).size).toBe(ids.length)
      expect(search(`sort=${key}&order=${order}&perPage=${perPage}&page=999`)).toEqual(search(`sort=${key}&order=${order}&perPage=${perPage}&page=${totalPages}`))
      for (const count of [0, 1]) {
        const result = runCardSearch(getSourceCards().slice(0, count), prepareCardSearch({ sort: key, order, page: '999', perPage: String(perPage) }))
        expect(result).toMatchObject({ page: 1, totalPages: 1, totalCount: count })
        expect(result.items).toEqual(getSourceCards().slice(0, count).map(row => projected[row.card.card_id]))
      }
    })
  }
})
