import type { RouteLocationRaw } from 'vue-router'
import { PRODUCT_VALUES } from '~~/app/utils/constants/search/options/product'

export const buildProductSearchLocation = (candidate: unknown): RouteLocationRaw | undefined => {
  if (typeof candidate !== 'string' || !PRODUCT_VALUES.has(candidate)) return undefined

  return {
    path: '/cards',
    query: { pd: candidate },
  }
}
