import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'

describe('card list query boundary', () => {
  it('consumes the current route through the defensive parser', () => {
    const source = readFileSync(resolve('app/pages/cards/index.vue'), 'utf8')
    expect(source).toContain('parseCardSearchQuery(route.query)')
    expect(source).toContain(':query="route.query"')
    expect(source).toContain('<ResultList')
  })

  it('有効な product 条件を結果件数にかかわらず route query に保持する', () => {
    const query = { pd: '073ce193' }
    expect(parseCardSearchQuery(query).products).toEqual(['073ce193'])

    const source = readFileSync(resolve('app/pages/cards/index.vue'), 'utf8')
    expect(source).toContain(':query="route.query"')
    expect(source).toContain(':cards="pagedCards"')
    expect(source).toContain(':total-count="totalCount"')
  })
})
