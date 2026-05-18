import type { SearchOption } from '~~/app/types/ui/searchOption'
import { elementItems } from '~~/app/utils/constants/search/items'

export const ELEMENT_OPTIONS = elementItems as SearchOption[]
export const ELEMENT_VALUES = new Set(ELEMENT_OPTIONS.map(x => x.value))
export type Element = string