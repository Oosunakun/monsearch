export type NavItem = {
  label: string
  to: string
  icon: string
}

export type QuickSearchOption = {
  title: string
  value: string
}

export type QuickSearchState = {
  selectedCardPool: string
  selectedSearchType: string
  searchText: string
}

export const LAYOUT_SIDEBAR = {
  WIDTH: 256,
  RAIL_WIDTH: 56,
} as const

export const LAYOUT_HEADER = {
  HEIGHT: 48,
} as const