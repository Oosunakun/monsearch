import type { SearchOption } from '~~/app/types/ui/searchOption'
import { illustratorItems } from '~~/app/utils/constants/search/items'

export const ILLUSTRATOR_OPTIONS = illustratorItems as SearchOption[]
export const ILLUSTRATOR_VALUES = new Set(ILLUSTRATOR_OPTIONS.map(x => x.value))
export type Illustrator = string