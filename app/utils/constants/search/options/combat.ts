import type { NumericOption } from '~~/app/types/ui/searchOption'
import { combatItems } from '~~/app/utils/constants/search/items'

export const COMBAT_OPTIONS = combatItems as NumericOption[]
export const COMBAT_VALUES = new Set(COMBAT_OPTIONS.map(x => x.value))
export type Combat = number