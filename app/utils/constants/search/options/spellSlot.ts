import type { SearchOption } from '~~/app/types/ui/searchOption'
import { spellSlotItems } from '~~/app/utils/constants/search/items'

export const SPELL_SLOT_OPTIONS = spellSlotItems as SearchOption[]
export const SPELL_SLOT_VALUES = new Set(SPELL_SLOT_OPTIONS.map(x => x.value))
export type SpellSlot = string