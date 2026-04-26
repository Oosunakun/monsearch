import type { CardCategory, ElementCode } from '~~/types/card'

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
  selectedCategory: CardCategory | ''
  selectedRarity: string
  selectedCardPool: string
  selectedSet: string
  selectedItemCategory: string
  selectedLandCategory: string
}

export type UnitSearchForm = {
  levelFrom: number | null
  levelTo: number | null
  attackFrom: number | null
  attackTo: number | null
  defenseFrom: number | null
  defenseTo: number | null
  selectedMoveType: string
  selectedElements: ElementCode[]
  selectedSpecific: '' | 'banilla'
}

export type RaceTypeSearchForm = {
  raceKeyword: string
  cardTypeKeyword: string
  selectedType: string
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

export type SearchFilter = {
  name?: string
  card_category?: CardCategory
  rarity?: string
  card_pool?: string
  product?: string
  element?: ElementCode[]
  move_type?: string
  level_from?: number | null
  level_to?: number | null
  attack_from?: number | null
  attack_to?: number | null
  defense_from?: number | null
  defense_to?: number | null
  race?: string
  type?: string
  item_category?: string
  land_category?: string
  keyword?: string
  specific?: {
    banilla?: boolean
  }
}

export type SearchResultSource = {
  id: string
  setCode: string
  cardName: string
  category: CardCategory
  race?: string
  type?: string
  itemCategory?: string
  landCategory?: string
  moveType?: string
  element?: string
  level?: number
  attack?: number
  defense?: number
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
  category_code: CardCategory | ''
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
    element_codes: ElementCode[]
    specific_code: '' | 'banilla'
  }
  race_type: {
    race_keyword: string
    card_type_keyword: string
    type_keyword: string
  }
  item_category_code: string
  land_category_code: string
  keyword: string
}
