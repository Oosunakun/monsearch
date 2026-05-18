import type { NumericOption } from '~~/app/types/ui/searchOption'
import { levelItems } from '~~/app/utils/constants/search/items'

export const LEVEL_OPTIONS = levelItems as NumericOption[]
export const LEVEL_VALUES = new Set(LEVEL_OPTIONS.map(x => x.value))
export type Level = number