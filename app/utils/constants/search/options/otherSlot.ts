import type { SearchOption } from '~~/app/types/ui/searchOption'
import { otherSlotItems } from '~~/app/utils/constants/search/items'

export const OTHER_SLOT_OPTIONS = otherSlotItems as SearchOption[]
export const OTHER_SLOT_VALUES = new Set(OTHER_SLOT_OPTIONS.map(x => x.value))
export type OtherSlot = string