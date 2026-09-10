import { describe, expect, it } from 'vitest'
import { paginate } from './paginate'

describe('paginate', () => {
  it.each([20, 50, 100])('%d件単位でsliceする', perPage => {
    const result = paginate(Array.from({ length: 121 }, (_, index) => index), 2, perPage)
    expect(result.items[0]).toBe(perPage)
    expect(result.totalPages).toBe(Math.ceil(121 / perPage))
  })
  it('範囲外pageをclampし、0件はpage 1にする', () => {
    expect(paginate([1, 2, 3], 99, 2)).toMatchObject({ page: 2, totalPages: 2, items: [3] })
    expect(paginate([], 99, 20)).toEqual({ page: 1, totalPages: 1, items: [] })
  })
})
