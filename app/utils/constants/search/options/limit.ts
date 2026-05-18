import type { NumericOption } from '~~/app/types/ui/searchOption'
import { limitItems } from '~~/app/utils/constants/search/items'

export const LIMIT_OPTIONS = limitItems as NumericOption[]
export const LIMIT_VALUES = new Set(LIMIT_OPTIONS.map(x => x.value))
export type Limit = number