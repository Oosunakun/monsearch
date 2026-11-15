import { describe, expect, it, vi } from 'vitest'
import { buildProductSearchLocation } from './productSearchLocation'

describe('buildProductSearchLocation', () => {
  it.each([
    ['太陽の金の竜姫', '22d7e'],
    ['同名 set A', 'ce193'],
    ['同名 set B', '9f77f'],
  ])('%s に対応する pd だけを持つ location を返す', (_label, value) => {
    expect(buildProductSearchLocation(value)).toEqual({ path: '/cards', query: { pd: value } })
  })

  it('入力を変更せず、表示名を URL value に利用しない', () => {
    const value = '22d7e'
    buildProductSearchLocation(value)
    expect(value).toBe('22d7e')
  })

  it.each(['', 'unknown', '太陽の金の竜姫', undefined, null])('無効値 %s では fail closed する', value => {
    expect(buildProductSearchLocation(value)).toBeUndefined()
  })
})

vi.mock('~~/app/utils/constants/search/options/product', async () => { const { productOptions } = await import('~~/tests/fixtures/searchOptions/products'); return { PRODUCT_OPTIONS: productOptions, PRODUCT_VALUES: new Set(productOptions.map(row => row.value)) } })
