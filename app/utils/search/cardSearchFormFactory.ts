import { 
  SEARCH_OPERATOR,
  SEARCH_FILTER,
  LOGICAL_MATCH,
} from '~~/app/utils/constants/search/conditions'
import type { 
  NumericCondition, 
  FilteredNumericCondition, 
  SlotCondition,
  SearchForm,
} from '~~/app/types/ui/search'
import { LAND_CATEGORY } from '~~/app/utils/constants/search/options'

export const defaultNumericCondition: NumericCondition = {
  value: null,
  operator: SEARCH_OPERATOR.GREATER_THAN_OR_EQUAL.value,
}

export const defaultFilteredNumericCondition: FilteredNumericCondition = {
  filterType: SEARCH_FILTER.ALL.value,
  value: null,
  operator:  SEARCH_OPERATOR.GREATER_THAN_OR_EQUAL.value,
}

export const defaultSlotCondition: SlotCondition = {
  slots: {},
  match: LOGICAL_MATCH.OR.value,
}


export const createNumericCondition = (): NumericCondition => ({
  value: null,
  operator: SEARCH_OPERATOR.GREATER_THAN_OR_EQUAL.value,
})

export const createFilteredNumericCondition = (): FilteredNumericCondition => ({
  filterType: SEARCH_FILTER.ALL.value,
  value: null,
  operator:  SEARCH_OPERATOR.GREATER_THAN_OR_EQUAL.value,
})

export const createSlotCondition = (): SlotCondition => ({
  slots: {},
  match: LOGICAL_MATCH.OR.value,
})

export const createSearchForm = (): SearchForm => ({
  // --------------------
  // 基本情報
  // --------------------
  name: '',
  cardCategory: '',
  elements: [],
  cardTypes: [],
  keyword: '',

  // --------------------
  // カードセット・所属
  // --------------------
  products: [],
  factions: [],
  blocks: [],

  // --------------------
  // ユニット
  // --------------------
  level: createFilteredNumericCondition(),
  heroPoint: createFilteredNumericCondition(),
  attack: createNumericCondition(),
  defense: createNumericCondition(),
  moveTypes: [],
  races: [],
  abilityItemSlots: createSlotCondition(),
  abilitySpellSlots: createSlotCondition(),
  initiative: createNumericCondition(),
  charge: createFilteredNumericCondition(),
  defender: createFilteredNumericCondition(),
  resistances: [],

  // --------------------
  // 装備品
  // --------------------
  additionalAttack: createNumericCondition(),
  additionalDefense: createNumericCondition(),
  additionalAbilityItemSlots: createSlotCondition(),
  additionalAbilitySpellSlots: createSlotCondition(),
  additionalInitiative: createNumericCondition(),
  additionalCharge: createFilteredNumericCondition(),
  additionalDefender: createFilteredNumericCondition(),
  additionalResistances: [],

  // --------------------
  // 地形
  // --------------------
  limit: createNumericCondition(),
  landCategory: LAND_CATEGORY.ALL.value,

  // --------------------
  // 特殊能力・カード効果
  // --------------------
  costItemSlots: createSlotCondition(),
  costSpellSlots: createSlotCondition(),
  costOtherEntities: createSlotCondition(),
  effectTypes: [],
  effectActivationTypes: [],
  effectActivationCategories: [],
  effectText: '',

  // --------------------
  // その他
  // --------------------
  rarities: [],
  illustrators: [],
  referenceLabel: '',
})
