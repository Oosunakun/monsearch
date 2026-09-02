import { describe, expect, it } from 'vitest'
import { mockProductSources } from '~~/app/utils/mockData/indexPage'
import { mockRestrictionAvailableProductSources } from '~~/app/utils/mockData/restrictions'
import { buildProductSearchLocation } from '~~/app/utils/search/productSearchLocation'

describe('product set page navigation boundary', () => {
  it('トップと制限ページの同じ row が同じ navigation contract を使う', () => {
    for (const source of mockProductSources) {
      const restrictionSource = mockRestrictionAvailableProductSources.find(row => row.searchValue === source.searchValue)
      expect(restrictionSource).toBeDefined()
      expect(buildProductSearchLocation(source.searchValue)).toEqual(
        buildProductSearchLocation(restrictionSource!.searchValue),
      )
    }
  })
})
