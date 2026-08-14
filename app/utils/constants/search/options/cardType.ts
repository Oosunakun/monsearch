import type { SearchOption } from '~~/app/types/ui/searchOption'
import { cardTypeItems } from '~~/app/utils/constants/search/items'

export const CARD_TYPE_OPTIONS = cardTypeItems as SearchOption[]
export const CARD_TYPE_VALUES = new Set(CARD_TYPE_OPTIONS.map(x => x.value))
export type CardType = string
