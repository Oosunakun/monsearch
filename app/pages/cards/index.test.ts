import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('card list query boundary', () => {
  it('consumes the current route through the defensive parser', () => {
    const source = readFileSync(resolve('app/pages/cards/index.vue'), 'utf8')
    expect(source).toContain('parseCardSearchQuery(route.query)')
    expect(source).toContain(':query="route.query"')
    expect(source).toContain('<ResultList')
  })
})
