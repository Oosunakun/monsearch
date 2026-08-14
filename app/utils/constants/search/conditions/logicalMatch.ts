import type { SearchOption } from '~~/app/types/ui/searchOption'

export const LOGICAL_MATCH = {
  OR: { label: 'いずれかを含む', value: 'or' },
  AND: { label: 'すべてを含む', value: 'and' },
  NONE: { label: 'なし', value: 'none' },
} as const
export const LOGICAL_MATCH_OPTIONS: SearchOption[] = Object.values(LOGICAL_MATCH)
export const LOGICAL_MATCH_VALUES = new Set(LOGICAL_MATCH_OPTIONS.map(x => x.value))
export type LogicalMatch = typeof LOGICAL_MATCH[keyof typeof LOGICAL_MATCH]['value']