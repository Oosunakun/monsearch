import type { NumericOption } from '~~/app/types/ui/searchOption'
import { chargeItems } from '~~/app/utils/constants/search/items'

export const CHARGE_OPTIONS = chargeItems as NumericOption[]
export const CHARGE_VALUES = new Set(CHARGE_OPTIONS.map(x => x.value))
export type Charge = number
