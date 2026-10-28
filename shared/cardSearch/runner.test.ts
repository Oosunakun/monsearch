import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { parseQuery } from 'vue-router'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import baseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import catalogOracle from '~~/specs/014-search-catalog-normalization/verification/expected-catalog-results.json'
import { prepareCardSearch, runCardSearch } from './runner'
import { normalizeClientSearchQuery } from './clientQuery'

const search = (query: string) => runCardSearch(getSourceCards(), prepareCardSearch(normalizeClientSearchQuery(parseQuery(query))))

describe('CSR runnerの独立した固定oracle', () => {
  const projected: Record<string, unknown> = baseline.projectedItems
  it.each(baseline.cases)('$nameの全ページ/境界/完全DTOはFeature014固定値と一致する', example => {
    for (const page of [...example.api.pages, ...example.api.boundaries]) {
      const result = search(page.requestQuery)
      expect(result).toEqual({ ...page.response, items: page.response.items.map(id => projected[id]) })
      if ('responseSha256' in page && 'responseFields' in page) {
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
