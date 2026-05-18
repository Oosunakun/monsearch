import type { SearchOption } from '~~/app/types/ui/searchOption'
import { effectActivationCategoryItems } from '~~/app/utils/constants/search/items'

export const EFFECT_ACTIVATION_CATEGORY_OPTIONS = effectActivationCategoryItems as SearchOption[]
export const EFFECT_ACTIVATION_CATEGORY_VALUES = new Set(EFFECT_ACTIVATION_CATEGORY_OPTIONS.map(x => x.value))
export type EffectActivationCategory = string