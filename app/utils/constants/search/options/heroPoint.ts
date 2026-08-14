import type { NumericOption } from '~~/app/types/ui/searchOption'
import { heroPointItems } from '~~/app/utils/constants/search/items'

export const HERO_POINT_OPTIONS = heroPointItems as NumericOption[]
export const HERO_POINT_VALUES = new Set(HERO_POINT_OPTIONS.map(x => x.value))
export type HeroPoint = number