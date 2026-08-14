import type { SearchOption } from '~~/app/types/ui/searchOption'
import { itemSlotItems } from '~~/app/utils/constants/search/items'

export const ITEM_SLOT_OPTIONS = itemSlotItems as SearchOption[]
export const ITEM_SLOT_VALUES = new Set(ITEM_SLOT_OPTIONS.map(x => x.value))
export type ItemSlot = string