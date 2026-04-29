import type {
  CardSearchFormState,
  CardSearchRequestDto,
  SearchResultRow,
  SearchResultSource
} from '~~/app/types/ui/search'

const createInitialState = (): CardSearchFormState => ({
  basic: {
    cardName: '',
    selectedCategory: 'Unit',
    selectedRarity: 'S',
    selectedCardPool: 'open',
    selectedSet: '6D',
    selectedItemCategory: '',
    selectedLandCategory: ''
  },
  unit: {
    levelFrom: 1,
    levelTo: 8,
    attackFrom: 1,
    attackTo: 10,
    defenseFrom: 1,
    defenseTo: 10,
    selectedMoveType: 'flying',
    selectedElements: [],
    selectedSpecific: ''
  },
  raceType: {
    raceKeyword: '',
    cardTypeKeyword: '',
    selectedType: ''
  },
  keyword: {
    keyword: ''
  }
})

export const useCardSearchForm = () => {
  const formState = ref<CardSearchFormState>(createInitialState())

  const resetForm = () => {
    formState.value = createInitialState()
  }

  const toSearchRequestDto = (): CardSearchRequestDto => ({
    card_name: formState.value.basic.cardName.trim(),
    category_code: formState.value.basic.selectedCategory,
    rarity_code: formState.value.basic.selectedRarity,
    card_pool_code: formState.value.basic.selectedCardPool,
    set_code: formState.value.basic.selectedSet,
    unit: {
      level_from: formState.value.unit.levelFrom,
      level_to: formState.value.unit.levelTo,
      attack_from: formState.value.unit.attackFrom,
      attack_to: formState.value.unit.attackTo,
      defense_from: formState.value.unit.defenseFrom,
      defense_to: formState.value.unit.defenseTo,
      move_type_code: formState.value.unit.selectedMoveType,
      element_codes: formState.value.unit.selectedElements,
      specific_code: formState.value.unit.selectedSpecific
    },
    race_type: {
      race_keyword: formState.value.raceType.raceKeyword.trim(),
      card_type_keyword: formState.value.raceType.cardTypeKeyword.trim(),
      type_keyword: formState.value.raceType.selectedType.trim()
    },
    item_category_code: formState.value.basic.selectedItemCategory,
    land_category_code: formState.value.basic.selectedLandCategory,
    keyword: formState.value.keyword.keyword.trim()
  })

  const withZebraRows = (rows: SearchResultSource[]): SearchResultRow[] =>
    rows.map((row, index) => ({
      ...row,
      zebra: index % 2 === 1
    }))

  return {
    formState,
    resetForm,
    toSearchRequestDto,
    withZebraRows
  }
}
