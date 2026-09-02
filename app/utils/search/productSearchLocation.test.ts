import { describe, expect, it } from 'vitest'
import { buildProductSearchLocation } from './productSearchLocation'

describe('buildProductSearchLocation', () => {
  it.each([
    ['太陽の金の竜姫', '91122d7e'],
    ['同名 set A', '073ce193'],
    ['同名 set B', 'a859f77f'],
  ])('%s に対応する pd だけを持つ location を返す', (_label, value) => {
    expect(buildProductSearchLocation(value)).toEqual({ path: '/cards', query: { pd: value } })
  })

  it('入力を変更せず、表示名を URL value に利用しない', () => {
    const value = '91122d7e'
    buildProductSearchLocation(value)
    expect(value).toBe('91122d7e')
  })

  it.each(['', 'unknown', '太陽の金の竜姫', undefined, null])('無効値 %s では fail closed する', value => {
    expect(buildProductSearchLocation(value)).toBeUndefined()
  })
})
