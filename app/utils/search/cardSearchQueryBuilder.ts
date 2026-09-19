import type {
  FilteredNumericCondition, LogicalCardSearchQuery, NumericCondition, SearchForm, SlotCondition,
} from '~~/app/types/ui/search'
import {
  isEquipmentApplicable, isLandApplicable, isLogicalMatch, isSearchFilter,
  isSearchOperator, isUnitApplicable,
} from './cardSearchQuerySchema'
import {
  BLOCK_VALUES, CARD_TYPE_VALUES, EFFECT_ACTIVATION_CATEGORY_VALUES, EFFECT_ACTIVATION_TYPE_VALUES,
  EFFECT_TYPE_VALUES, ELEMENT_VALUES, FACTION_VALUES, ILLUSTRATOR_VALUES, ITEM_SLOT_VALUES,
  MOVE_TYPE_VALUES, OTHER_SLOT_VALUES, PRODUCT_VALUES, RACE_VALUES, RARITY_VALUES,
  RESISTANCE_VALUES, SPELL_SLOT_VALUES,
} from '~~/app/utils/constants/search/options'

const text = (value: string) => value.trim() || undefined
const collection = (values: readonly string[], allowed: ReadonlySet<string>) => {
  const normalized = [...new Set(values.map(value => value.trim()).filter(value => value && allowed.has(value)))].sort()
  return normalized.length ? normalized.join(',') : undefined
}
const comparison = (condition: Readonly<NumericCondition>) =>
  isSearchOperator(condition.operator) && typeof condition.value === 'number' && Number.isFinite(condition.value)
    ? `${condition.operator}:${condition.value}` : undefined
const pairs = (condition: Readonly<SlotCondition>, allowed: ReadonlySet<string>) => {
  const normalized = Object.entries(condition.slots)
    .filter(([key, value]) => allowed.has(key.trim()) && typeof value === 'number' && Number.isFinite(value) && value > 0)
    .map(([key, value]) => [key.trim(), value] as const)
    .sort(([left], [right]) => left.localeCompare(right))
  return normalized.length ? normalized.map(([key, value]) => `${key}:${value}`).join(',') : undefined
}

export const buildCardSearchQuery = (form: Readonly<SearchForm>): LogicalCardSearchQuery => {
  const query: LogicalCardSearchQuery = {}
  const put = (alias: keyof LogicalCardSearchQuery, value: string | undefined) => { if (value !== undefined) query[alias] = value }
  const putComparison = (alias: keyof LogicalCardSearchQuery, value: Readonly<NumericCondition>) => put(alias, comparison(value))
  const putFiltered = (modifier: keyof LogicalCardSearchQuery, alias: keyof LogicalCardSearchQuery, value: Readonly<FilteredNumericCondition>, alwaysShowValue = false) => {
    const base = comparison(value)
    if (!isSearchFilter(value.filterType)) return
    if (value.filterType !== 'all') put(modifier, value.filterType)
    if (value.filterType === 'exclude' && !alwaysShowValue) return
    if (base) put(alias, base)
  }
  const putSlots = (modifier: keyof LogicalCardSearchQuery, alias: keyof LogicalCardSearchQuery, value: Readonly<SlotCondition>, allowed: ReadonlySet<string>) => {
    const base = pairs(value, allowed)
    if (!base) return
    if (isLogicalMatch(value.match) && value.match !== 'or') put(modifier, value.match)
    put(alias, base)
  }

  put('nm', text(form.name)); put('cc', form.cardCategory || undefined)
  put('el', collection(form.elements, ELEMENT_VALUES)); put('ct', collection(form.cardTypes, CARD_TYPE_VALUES)); put('kw', text(form.keyword))
  put('pd', collection(form.products, PRODUCT_VALUES)); put('fa', collection(form.factions, FACTION_VALUES)); put('bl', collection(form.blocks, BLOCK_VALUES))
  if (isUnitApplicable(form.cardCategory)) {
    putFiltered('lvm', 'lv', form.level, true); putFiltered('hem', 'he', form.heroPoint)
    putComparison('at', form.attack); putComparison('df', form.defense)
    put('mt', collection(form.moveTypes, MOVE_TYPE_VALUES)); put('ra', collection(form.races, RACE_VALUES))
    putSlots('ism', 'is', form.abilityItemSlots, ITEM_SLOT_VALUES); putSlots('ssm', 'ss', form.abilitySpellSlots, SPELL_SLOT_VALUES)
    putFiltered('itm', 'it', form.initiative); putFiltered('chm', 'ch', form.charge)
    putFiltered('dem', 'de', form.defender); put('re', collection(form.resistances, RESISTANCE_VALUES))
  }
  if (isEquipmentApplicable(form.cardCategory)) {
    putComparison('aat', form.additionalAttack); putComparison('adf', form.additionalDefense)
    putSlots('aism', 'ais', form.additionalAbilityItemSlots, ITEM_SLOT_VALUES); putSlots('assm', 'ass', form.additionalAbilitySpellSlots, SPELL_SLOT_VALUES)
    putFiltered('aitm', 'ait', form.additionalInitiative); putFiltered('achm', 'ach', form.additionalCharge)
    putFiltered('adem', 'ade', form.additionalDefender); put('are', collection(form.additionalResistances, RESISTANCE_VALUES))
  }
  if (isLandApplicable(form.cardCategory)) {
    putComparison('lm', form.limit); if (form.landCategory !== 'all') put('lc', form.landCategory)
  }
  putSlots('cism', 'cis', form.costItemSlots, ITEM_SLOT_VALUES); putSlots('cssm', 'css', form.costSpellSlots, SPELL_SLOT_VALUES)
  putSlots('coem', 'coe', form.costOtherEntities, OTHER_SLOT_VALUES); put('eft', collection(form.effectTypes, EFFECT_TYPE_VALUES))
  put('eat', collection(form.effectActivationTypes, EFFECT_ACTIVATION_TYPE_VALUES)); put('eac', collection(form.effectActivationCategories, EFFECT_ACTIVATION_CATEGORY_VALUES))
  put('etx', text(form.effectText)); put('rt', collection(form.rarities, RARITY_VALUES)); put('il', collection(form.illustrators, ILLUSTRATOR_VALUES))
  put('rl', text(form.referenceLabel))
  return query
}
