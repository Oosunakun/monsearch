import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('cards result page', () => {
  const source = readFileSync(resolve('app/pages/cards/index.vue'), 'utf8')
  it('API responseだけで結果を描画する', () => {
    expect(source).toContain('useCardSearch(routeQuery)')
    expect(source).toContain(':cards="result.items"')
    expect(source).not.toContain('mockFinderCards')
    expect(source).not.toContain('cards.json')
  })
  it('loading・empty・error・successを相互排他的に表示する', () => {
    expect(source).toContain("status === 'idle' || status === 'pending'")
    expect(source).toContain("status === 'error'")
    expect(source).toContain('result.totalCount === 0')
    expect(source).toContain('@click="retry"')
  })
})
