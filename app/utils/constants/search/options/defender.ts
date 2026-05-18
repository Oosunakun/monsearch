import type { NumericOption } from '~~/app/types/ui/searchOption'
import { defenderItems } from '~~/app/utils/constants/search/items'

export const DEFENDER_OPTIONS = defenderItems as NumericOption[]
export const DEFENDER_VALUES = new Set(DEFENDER_OPTIONS.map(x => x.value))
export type Defender = number