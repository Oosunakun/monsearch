import { describe, expect, it, vi } from 'vitest'
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

vi.mock('~~/app/utils/constants/search/options/product', async () => { const { productOptions } = await import('~~/tests/fixtures/searchOptions/products'); return { PRODUCT_OPTIONS: productOptions, PRODUCT_VALUES: new Set(productOptions.map(row => row.value)) } })
vi.mock('~~/app/utils/mockData/indexPage', async () => ({ mockProductSources: [(await import('~~/tests/fixtures/searchOptions/products')).homeRows[0]] }))
vi.mock('~~/app/utils/mockData/restrictions', async () => ({ mockRestrictionAvailableProductSources: (await import('~~/tests/fixtures/searchOptions/products')).restrictionRows }))
