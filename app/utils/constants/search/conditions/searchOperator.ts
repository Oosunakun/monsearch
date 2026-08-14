import type { SearchOption } from '~~/app/types/ui/searchOption'

export const SEARCH_OPERATOR = {
  GREATER_THAN_OR_EQUAL: { label: '以上', value: 'gte' },
  EQUAL: { label: '一致', value: 'eq' },
  LESS_THAN_OR_EQUAL: { label: '以下', value: 'lte' },
} as const
export const SEARCH_OPERATOR_OPTIONS: SearchOption[] = Object.values(SEARCH_OPERATOR)
export const SEARCH_OPERATOR_VALUES = new Set(SEARCH_OPERATOR_OPTIONS.map(x => x.value))
export type SearchOperator = typeof SEARCH_OPERATOR[keyof typeof SEARCH_OPERATOR]['value']