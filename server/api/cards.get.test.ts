import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'

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
})
