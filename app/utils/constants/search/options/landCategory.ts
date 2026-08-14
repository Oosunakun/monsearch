import type { SearchOption } from '~~/app/types/ui/searchOption'

export const LAND_CATEGORY = {
  ALL: { label: 'すべて', value: 'all' },
  NONE: { label: '分類なし', value: 'none' },
  RITUAL: { label: '儀式', value: 'ritual' },
} as const
export const LAND_CATEGORY_OPTIONS: SearchOption[] = Object.values(LAND_CATEGORY)
export const LAND_CATEGORY_VALUES = new Set(LAND_CATEGORY_OPTIONS.map(x => x.value))
export type LandCategory = typeof LAND_CATEGORY[keyof typeof LAND_CATEGORY]['value']