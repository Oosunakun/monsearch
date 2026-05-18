import type { SearchOption } from '~~/app/types/ui/searchOption'
import { moveTypeItems } from '~~/app/utils/constants/search/items'

export const MOVE_TYPE_OPTIONS = moveTypeItems as SearchOption[]
export const MOVE_TYPE_VALUES = new Set(MOVE_TYPE_OPTIONS.map(x => x.value))
export type MoveType = string