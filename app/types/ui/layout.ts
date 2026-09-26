export type NavItem = {
  label: string
  to: string
  icon: string
}

export type QuickSearchTarget = 'name' | 'race-type' | 'keyword'

export type QuickSearchOption<T extends string = string> = {
  title: string
  value: T
}

export type QuickSearchState = {
  selectedCardPool: string
  selectedSearchType: QuickSearchTarget
  searchText: string
}

export const LAYOUT_SIDEBAR = {
  WIDTH: 256,
  RAIL_WIDTH: 56,
} as const

export const LAYOUT_HEADER = {
  HEIGHT: 48,
} as const
