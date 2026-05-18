import type { SearchOption } from '~~/app/types/ui/searchOption'
import { resistanceItems } from '~~/app/utils/constants/search/items'

export const RESISTANCE_OPTIONS = resistanceItems as SearchOption[]
export const RESISTANCE_VALUES = new Set(RESISTANCE_OPTIONS.map(x => x.value))
export type Resistance = string