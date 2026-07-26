import type { NumericOption } from '~~/app/types/ui/searchOption'
import { additionalCombatItems } from '~~/app/utils/constants/search/items'

export const ADDITIONAL_COMBAT_OPTIONS = additionalCombatItems as NumericOption[]
export const ADDITIONAL_COMBAT_VALUES = new Set(ADDITIONAL_COMBAT_OPTIONS.map(x => x.value))
export type AdditionalCombat = number