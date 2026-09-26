import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('useCardSearch', () => {
  const source = readFileSync(resolve('app/composables/useCardSearch.ts'), 'utf8')
  it('route queryとpage/sort指定をAPIへ渡す', () => {
    expect(source).toContain("$fetch<CardSearchResultPage>('/api/cards'")
    for (const key of ['page', 'perPage', 'sort', 'order']) expect(source).toContain(key)
  })
  it('状態を分離し、最後のrequestでretryする', () => {
    for (const state of ["'pending'", "'success'", "'error'"]) expect(source).toContain(state)
    expect(source).toContain('execute(lastRequest ?? makeRequest())')
  })
  it('表示条件変更時にpageを1へ戻す', () => {
    expect(source).toContain('watch([query, page, perPage, sort, order]')
    expect(source).toContain('page.value = 1')
  })
})
