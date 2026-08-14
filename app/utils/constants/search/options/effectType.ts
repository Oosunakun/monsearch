import type { SearchOption } from '~~/app/types/ui/searchOption'
import { effectTypeItems } from '~~/app/utils/constants/search/items'

export const EFFECT_TYPE_OPTIONS = effectTypeItems as SearchOption[]
export const EFFECT_TYPE_VALUES = new Set(EFFECT_TYPE_OPTIONS.map(x => x.value))
export type EffectType = string