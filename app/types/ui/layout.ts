export type NavItem = {
  label: string
  to: string
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
