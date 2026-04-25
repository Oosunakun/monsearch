export type SelectOption = {
  title: string
  value: string
}

export type ElementOption = {
  label: string
  value: string
  color: string
}

export type BasicSearchForm = {
  cardName: string
  selectedCategory: string
  selectedRarity: string
  selectedCardPool: string
  selectedSet: string
}

export type UnitSearchForm = {
  levelFrom: number | null
  levelTo: number | null
  attackFrom: number | null
  attackTo: number | null
  defenseFrom: number | null
  defenseTo: number | null
  selectedMoveType: string
  selectedElements: string[]
}

export type RaceTypeSearchForm = {
  raceKeyword: string
  cardTypeKeyword: string
}

export type KeywordSearchForm = {
  keyword: string
}

export type CardSearchFormState = {
  basic: BasicSearchForm
  unit: UnitSearchForm
  raceType: RaceTypeSearchForm
  keyword: KeywordSearchForm
}

export type SearchResultSource = {
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

export type SearchResultRow = SearchResultSource & {
  zebra: boolean
}

export type SearchResultHeader = {
  title: string
  key: keyof SearchResultRow
  sortable: boolean
}

export type CardSearchRequestDto = {
  card_name: string
  category_code: string
  rarity_code: string
  card_pool_code: string
  set_code: string
  unit: {
    level_from: number | null
    level_to: number | null
    attack_from: number | null
    attack_to: number | null
    defense_from: number | null
    defense_to: number | null
    move_type_code: string
    element_codes: string[]
  }
  race_type: {
    race_keyword: string
    card_type_keyword: string
  }
  keyword: string
}
