import type { SearchOption } from '~~/app/types/ui/searchOption'
import { effectActivationTypeItems } from '~~/app/utils/constants/search/items'

export const EFFECT_ACTIVATION_TYPE_OPTIONS = effectActivationTypeItems as SearchOption[]
export const EFFECT_ACTIVATION_TYPE_VALUES = new Set(EFFECT_ACTIVATION_TYPE_OPTIONS.map(x => x.value))
export type EffectActivationType = string