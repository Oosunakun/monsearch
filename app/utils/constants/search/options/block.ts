import type { SearchOption } from '~~/app/types/ui/searchOption'
import { blockItems } from '~~/app/utils/constants/search/items'

export const BLOCK_OPTONS = blockItems as SearchOption[]
export const BLOCK_VALUES = new Set(BLOCK_OPTONS.map(x => x.value))
export type Block = string
