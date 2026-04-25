export type SearchCondition = {
  id: string
  label: string
}

export type CardListSourceRow = {
  id: string
  setCode: string
  cardName: string
  category: string
  race: string
  element: string
  level: number
  attack: number
  defense: number
  rarity: string
}

export type CardListRow = CardListSourceRow & {
  zebra: boolean
}

export type CardListHeader = {
  title: string
  key: keyof CardListRow
  sortable: boolean
}
