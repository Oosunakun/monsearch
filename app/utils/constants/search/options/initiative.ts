import type { NumericOption } from '~~/app/types/ui/searchOption'
import { initiativeItems } from '~~/app/utils/constants/search/items'

export const INITIATIVE_OPTIONS = initiativeItems as NumericOption[]
export const INITIATIVE_VALUES = new Set(INITIATIVE_OPTIONS.map(x => x.value))
export type Initiative = number