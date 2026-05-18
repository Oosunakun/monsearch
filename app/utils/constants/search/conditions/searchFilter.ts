import type { SearchOption } from '~~/app/types/ui/searchOption'

export const SEARCH_FILTER = {
  ALL: { label: 'すべて', value: 'all' },
  INCLUDE: { label: 'あり', value: 'include' },
  EXCLUDE: { label: 'なし', value: 'exclude' },
} as const
export const SEARCH_FILTER_OPTIONS: SearchOption[] = Object.values(SEARCH_FILTER)
export const SEARCH_FILTER_VALUES = new Set(SEARCH_FILTER_OPTIONS.map(x => x.value))
export type SearchFilter = typeof SEARCH_FILTER[keyof typeof SEARCH_FILTER]['value']

export const LELVEL_SEARCH_FILTER = {
  ALL: { label: 'すべて', value: 'all' },
  INCLUDE: { label: '即時可能', value: 'include' },
  EXCLUDE: { label: '即時不可', value: 'exclude' },
} as const
export const LEVEL_SEARCH_FILTER_OPTIONS: SearchOption[] = Object.values(LELVEL_SEARCH_FILTER)