import type { SearchOption } from '~~/app/types/ui/searchOption'
import { productItems } from '~~/app/utils/constants/search/items'

export const PRODUCT_OPTIONS = productItems as SearchOption[]
export const PRODUCT_VALUES = new Set(PRODUCT_OPTIONS.map(x => x.value))
export type Product = string