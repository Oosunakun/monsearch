import type { SearchOption } from '~~/app/types/ui/searchOption'
import { rarityItems } from '~~/app/utils/constants/search/items'

export const RARITY_OPTIONS = rarityItems as SearchOption[]
export const RARITY_VALUES = new Set(RARITY_OPTIONS.map(x => x.value))
export type Rarity = string