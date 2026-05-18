import type { SearchOption } from '~~/app/types/ui/searchOption'
import { raceItems } from '~~/app/utils/constants/search/items'

export const RACE_OPTIONS = raceItems as SearchOption[]
export const RACE_VALUES = new Set(RACE_OPTIONS.map(x => x.value))
export type Race = string