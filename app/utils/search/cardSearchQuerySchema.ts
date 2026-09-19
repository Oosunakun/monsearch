import {
  CARD_CATEGORY_VALUES, LAND_CATEGORY_VALUES,
} from '~~/app/utils/constants/search/options'
import { LOGICAL_MATCH_VALUES, SEARCH_FILTER_VALUES, SEARCH_OPERATOR_VALUES } from '~~/app/utils/constants/search/conditions'
import type { CardCategory, LandCategory } from '~~/app/utils/constants/search/options'
import type { LogicalMatch, SearchFilter, SearchOperator } from '~~/app/utils/constants/search/conditions'

export const CARD_SEARCH_QUERY_ALIASES = [
  'nm', 'cc', 'el', 'ct', 'kw', 'att', 'pd', 'fa', 'bl', 'lvm', 'lv', 'hem', 'he',
  'at', 'df', 'mt', 'ra', 'ism', 'is', 'ssm', 'ss', 'itm', 'it', 'chm', 'ch',
  'dem', 'de', 're', 'aat', 'adf', 'aism', 'ais', 'assm', 'ass', 'aitm', 'ait',
  'achm', 'ach', 'adem', 'ade', 'are', 'lm', 'lc', 'cism', 'cis', 'cssm',
  'css', 'coem', 'coe', 'eft', 'eat', 'eac', 'etx', 'rt', 'il', 'rl',
] as const

export type CardSearchQueryAlias = typeof CARD_SEARCH_QUERY_ALIASES[number]

const contains = <T extends string>(values: ReadonlySet<string>, value: string): value is T => values.has(value)
export const isCardCategory = (value: string): value is CardCategory => contains<CardCategory>(CARD_CATEGORY_VALUES, value)
export const isLandCategory = (value: string): value is LandCategory => contains<LandCategory>(LAND_CATEGORY_VALUES, value)
export const isSearchOperator = (value: string): value is SearchOperator => contains<SearchOperator>(SEARCH_OPERATOR_VALUES, value)
export const isSearchFilter = (value: string): value is SearchFilter => contains<SearchFilter>(SEARCH_FILTER_VALUES, value)
export const isLogicalMatch = (value: string): value is LogicalMatch => contains<LogicalMatch>(LOGICAL_MATCH_VALUES, value)

export const isUnitApplicable = (category: SearchFormCategory) => !category || category === 'unit' || category === 'token'
export const isEquipmentApplicable = (category: SearchFormCategory) => !category || category === 'item-equip' || category === 'token'
export const isLandApplicable = (category: SearchFormCategory) => !category || category === 'land' || category === 'token'
export type SearchFormCategory = CardCategory | ''

export const UI_TO_QUERY_ALIAS = { defense: 'df', additionalDefense: 'adf' } as const
