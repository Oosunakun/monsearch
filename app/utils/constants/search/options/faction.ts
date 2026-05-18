import type { SearchOption } from '~~/app/types/ui/searchOption'
import { factionItems } from '~~/app/utils/constants/search/items'

export const FACTION_OPTIONS = factionItems as SearchOption[]
export const FACTION_VALUES = new Set(FACTION_OPTIONS.map(x => x.value))
export type Faction = string