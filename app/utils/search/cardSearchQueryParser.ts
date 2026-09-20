import type { LocationQuery, LocationQueryValue } from 'vue-router'
import type { FilteredNumericCondition, NumericCondition, SearchForm, SlotCondition } from '~~/app/types/ui/search'
import { createSearchForm } from './cardSearchFormFactory'
import {
  isCardCategory, isLandCategory, isLogicalMatch, isSearchFilter, isSearchOperator, normalizeShortUuidCollection,
} from './cardSearchQuerySchema'
import type { ShortUuidQueryAlias } from './cardSearchQuerySchema'
import {
  BLOCK_VALUES, EFFECT_ACTIVATION_CATEGORY_VALUES, EFFECT_TYPE_VALUES, ELEMENT_VALUES, ITEM_SLOT_VALUES,
  MOVE_TYPE_VALUES, OTHER_SLOT_VALUES, RARITY_VALUES, SPELL_SLOT_VALUES,
} from '~~/app/utils/constants/search/options'

const values = (value: LocationQueryValue | LocationQueryValue[] | undefined) =>
  (Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === 'string')
const last = (query: LocationQuery, alias: string) => values(query[alias]).at(-1)
const merged = (query: LocationQuery, alias: string, allowed: ReadonlySet<string>) => [...new Set(values(query[alias]).flatMap(value => value.split(',')).map(value => value.trim()).filter(value => value && allowed.has(value)))]
const shortUuid = (query: LocationQuery, alias: ShortUuidQueryAlias) => normalizeShortUuidCollection(values(query[alias]))
const parseComparison = (value: string | undefined): NumericCondition | undefined => {
  if (!value) return
  const match = /^(gte|eq|lte):(.+)$/.exec(value)
  if (!match || !isSearchOperator(match[1]!)) return
  const number = Number(match[2])
  return Number.isFinite(number) ? { operator: match[1], value: number } : undefined
}
const applyComparison = (target: NumericCondition, value: string | undefined) => {
  const parsed = parseComparison(value); if (parsed) Object.assign(target, parsed)
}
const applyFiltered = (target: FilteredNumericCondition, query: LocationQuery, modifier: string, alias: string) => {
  const filter = last(query, modifier); if (filter && isSearchFilter(filter)) target.filterType = filter
  const parsed = parseComparison(last(query, alias)); if (parsed) Object.assign(target, parsed)
}
const applySlots = (target: SlotCondition, query: LocationQuery, modifier: string, alias: string, allowed: ReadonlySet<string>, supportsNone = false) => {
  const match = last(query, modifier)
  if (supportsNone && match === 'none') {
    target.match = 'none'
    target.slots = {}
    return
  }
  const slots: Record<string, number> = {}
  for (const part of values(query[alias]).flatMap(value => value.split(','))) {
    const match = /^([^:,]+):(.+)$/.exec(part.trim()); if (!match) continue
    const key = match[1]!.trim(); const count = Number(match[2]); if (allowed.has(key) && Number.isFinite(count) && count > 0) slots[key] = count
  }
  if (!Object.keys(slots).length) return
  target.slots = slots
  if (match && isLogicalMatch(match)) target.match = match
}

export const parseCardSearchQuery = (query: LocationQuery): SearchForm => {
  const form = createSearchForm()
  form.name = last(query, 'nm')?.trim() ?? ''
  const category = last(query, 'cc'); if (category && isCardCategory(category)) form.cardCategory = category
  form.elements = merged(query, 'el', ELEMENT_VALUES); form.cardTypes = shortUuid(query, 'ct'); form.keyword = last(query, 'kw')?.trim() ?? ''
  form.products = shortUuid(query, 'pd'); form.factions = shortUuid(query, 'fa'); form.blocks = merged(query, 'bl', BLOCK_VALUES)
  applyFiltered(form.level, query, 'lvm', 'lv'); applyFiltered(form.heroPoint, query, 'hem', 'he')
  applyComparison(form.attack, last(query, 'at')); applyComparison(form.defense, last(query, 'df'))
  form.moveTypes = merged(query, 'mt', MOVE_TYPE_VALUES); form.races = shortUuid(query, 'ra')
  applySlots(form.abilityItemSlots, query, 'ism', 'is', ITEM_SLOT_VALUES, true); applySlots(form.abilitySpellSlots, query, 'ssm', 'ss', SPELL_SLOT_VALUES, true)
  applyFiltered(form.initiative, query, 'itm', 'it'); applyFiltered(form.charge, query, 'chm', 'ch')
  applyFiltered(form.defender, query, 'dem', 'de'); form.resistances = shortUuid(query, 're')
  applyComparison(form.additionalAttack, last(query, 'aat')); applyComparison(form.additionalDefense, last(query, 'adf'))
  applySlots(form.additionalAbilityItemSlots, query, 'aism', 'ais', ITEM_SLOT_VALUES, true); applySlots(form.additionalAbilitySpellSlots, query, 'assm', 'ass', SPELL_SLOT_VALUES, true)
  applyFiltered(form.additionalInitiative, query, 'aitm', 'ait'); applyFiltered(form.additionalCharge, query, 'achm', 'ach')
  applyFiltered(form.additionalDefender, query, 'adem', 'ade'); form.additionalResistances = shortUuid(query, 'are')
  applyComparison(form.limit, last(query, 'lm')); const land = last(query, 'lc'); if (land && isLandCategory(land)) form.landCategory = land
  applySlots(form.costItemSlots, query, 'cism', 'cis', ITEM_SLOT_VALUES); applySlots(form.costSpellSlots, query, 'cssm', 'css', SPELL_SLOT_VALUES)
  applySlots(form.costOtherEntities, query, 'coem', 'coe', OTHER_SLOT_VALUES); form.effectTypes = merged(query, 'eft', EFFECT_TYPE_VALUES)
  form.effectActivationTypes = shortUuid(query, 'eat'); form.effectActivationCategories = merged(query, 'eac', EFFECT_ACTIVATION_CATEGORY_VALUES)
  form.effectText = last(query, 'etx')?.trim() ?? ''; form.rarities = merged(query, 'rt', RARITY_VALUES)
  form.illustrators = shortUuid(query, 'il'); form.referenceLabel = last(query, 'rl')?.trim() ?? ''
  return form
}
