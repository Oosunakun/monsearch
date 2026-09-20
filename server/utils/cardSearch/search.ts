import type { SearchForm, NumericCondition, FilteredNumericCondition, SlotCondition } from '~~/app/types/ui/search'
import type { Card, Ability, Effect } from '~~/types/cards/finderCards'

const compare = (actual: number | null | undefined, condition: NumericCondition) => actual !== null && actual !== undefined && (condition.value === null
  || (condition.operator === 'gte' ? actual >= condition.value : condition.operator === 'lte' ? actual <= condition.value : actual === condition.value))
const includesAny = (wanted: readonly string[], actual: readonly string[]) => {
  const normalized = actual.map(value => value.toLocaleLowerCase())
  return !wanted.length || wanted.some(value => {
    const expected = value.toLocaleLowerCase()
    return normalized.some(candidate => candidate === expected || candidate.endsWith(expected))
  })
}
const isFilteredActive = (condition: FilteredNumericCondition) => condition.filterType !== 'all' || condition.value !== null
const matchesFiltered = (actual: number | null | undefined, condition: FilteredNumericCondition) => {
  if (condition.filterType === 'exclude') return actual === null || actual === undefined
  return actual !== null && actual !== undefined && (condition.value === null || compare(actual, condition))
}
const slotsMatch = (ability: Ability | null | undefined, condition: SlotCondition, category: string) => {
  const entries = Object.entries(condition.slots)
  const rows = (ability?.ability_slots ?? []).filter(slot => slot.ability_slot_category_code === category)
  if (condition.match === 'none') return !rows.some(slot => slot.slot_count > 0)
  if (!entries.length) return true
  const checks = entries.map(([key, count]) => rows.some(slot => {
    const typeCode = slot.ability_slot_type_code.toLowerCase()
    const expectedCode = `${category}${key}`.toLowerCase()
    return (typeCode === key.toLowerCase() || typeCode === expectedCode) && slot.slot_count >= count
  }))
  return condition.match === 'and' ? checks.every(Boolean) : checks.some(Boolean)
}
const resistancesMatch = (ability: Ability | null | undefined, wanted: readonly string[]) => includesAny(wanted, (ability?.affinities ?? []).filter(x => x.affinity.affinity_category_code === 'Resistance').map(x => x.affinity.affinity_id.toLowerCase()))
const effectValues = (effects: readonly Effect[], field: keyof Effect) => effects.map(effect => String(effect[field]).toLowerCase())
const textIncludes = (actual: string, wanted: string) => !wanted || actual.toLocaleLowerCase().includes(wanted.toLocaleLowerCase())

export const matchesCardSearch = (card: Card, criteria: SearchForm): boolean => {
  const category = card.search_support.is_token ? 'token' : card.card_category_code.toLowerCase() === 'item' ? `item-${card.item?.item_category_code.toLowerCase()}` : card.card_category_code.toLowerCase()
  if (criteria.cardCategory && category !== criteria.cardCategory) return false
  if (!textIncludes(card.name, criteria.name) || !textIncludes(card.reference_label, criteria.referenceLabel)) return false
  if (criteria.keyword && !textIncludes(card.search_support.full_text ?? JSON.stringify(card), criteria.keyword)) return false
  const elements = [...(card.unit?.elements ?? []), ...(card.spell?.elements ?? [])].map(x => x.element_code.toLowerCase())
  if (!includesAny(criteria.elements, elements)) return false
  if (!includesAny(criteria.cardTypes, card.card_types.flatMap(x => [x.card_type_id, x.card_type_name]).map(x => x.toLowerCase()))) return false
  if (!includesAny(criteria.products, [card.product.product_id])) return false
  if (!includesAny(criteria.factions, card.factions.flatMap(x => [x.faction_id, x.faction_name]).map(x => x.toLowerCase()))) return false
  if (!includesAny(criteria.blocks, card.blocks.flatMap(x => [x.block_code, x.block_name]).map(x => x.toLowerCase()))) return false
  if (!includesAny(criteria.rarities, [card.rarity_code]) || !includesAny(criteria.illustrators, [card.illustrator_id])) return false

  const unit = card.unit
  if (isFilteredActive(criteria.level) && (!unit || (criteria.level.filterType === 'include' && !unit.is_instant_summon) || (criteria.level.filterType === 'exclude' && unit.is_instant_summon) || !compare(unit.level, criteria.level))) return false
  if (isFilteredActive(criteria.heroPoint) && (!unit || (criteria.heroPoint.filterType === 'include' && !unit.is_hero) || (criteria.heroPoint.filterType === 'exclude' && unit.is_hero) || (criteria.heroPoint.filterType !== 'exclude' && criteria.heroPoint.value !== null && !compare(unit.hero_point, criteria.heroPoint)))) return false
  if (criteria.attack.value !== null && (!unit || !compare(unit.attack, criteria.attack))) return false
  if (criteria.defense.value !== null && (!unit || !compare(unit.defense, criteria.defense))) return false
  if (!includesAny(criteria.moveTypes, unit ? [unit.move_type_code.toLowerCase()] : [])) return false
  if (!includesAny(criteria.races, (unit?.races ?? []).flatMap(x => [x.race_id, x.race_name]).map(x => x.toLowerCase()))) return false
  if ((criteria.abilityItemSlots.match === 'none' && !unit) || (criteria.abilitySpellSlots.match === 'none' && !unit)
    || !slotsMatch(unit?.ability, criteria.abilityItemSlots, 'Item') || !slotsMatch(unit?.ability, criteria.abilitySpellSlots, 'Spell')) return false
  if (isFilteredActive(criteria.initiative) && (!matchesFiltered(unit?.ability?.initiative, criteria.initiative))) return false
  if (isFilteredActive(criteria.charge) && (!matchesFiltered(unit?.ability?.charge, criteria.charge))) return false
  if (isFilteredActive(criteria.defender) && (!matchesFiltered(unit?.ability?.defender, criteria.defender))) return false
  if (!resistancesMatch(unit?.ability, criteria.resistances)) return false

  const equip = card.item?.equip
  if (criteria.additionalAttack.value !== null && (!equip || !compare(equip.attack, criteria.additionalAttack))) return false
  if (criteria.additionalDefense.value !== null && (!equip || !compare(equip.defense, criteria.additionalDefense))) return false
  if ((criteria.additionalAbilityItemSlots.match === 'none' && !equip) || (criteria.additionalAbilitySpellSlots.match === 'none' && !equip)
    || !slotsMatch(equip?.ability, criteria.additionalAbilityItemSlots, 'Item') || !slotsMatch(equip?.ability, criteria.additionalAbilitySpellSlots, 'Spell')) return false
  if (isFilteredActive(criteria.additionalInitiative) && (!matchesFiltered(equip?.ability?.initiative, criteria.additionalInitiative))) return false
  if (isFilteredActive(criteria.additionalCharge) && (!matchesFiltered(equip?.ability?.charge, criteria.additionalCharge))) return false
  if (isFilteredActive(criteria.additionalDefender) && (!matchesFiltered(equip?.ability?.defender, criteria.additionalDefender))) return false
  if (!resistancesMatch(equip?.ability, criteria.additionalResistances)) return false
  if (criteria.limit.value !== null && (!card.land || !compare(card.land.land_limit, criteria.limit))) return false
  if (criteria.landCategory && criteria.landCategory !== 'all' && ![card.land?.land_category_code.toLowerCase(), card.land?.land_category_name.toLowerCase()].includes(criteria.landCategory)) return false

  if (!includesAny(criteria.effectTypes, effectValues(card.effects, 'effect_type_code')) || !includesAny(criteria.effectActivationTypes, effectValues(card.effects, 'effect_activation_type_id')) || !includesAny(criteria.effectActivationCategories, effectValues(card.effects, 'effect_activation_category_code'))) return false
  if (criteria.effectText && !card.effects.some(effect => textIncludes(effect.effect_text, criteria.effectText))) return false
  return true
}

export const searchCards = (cards: readonly Card[], criteria: SearchForm): Card[] => cards.filter(card => matchesCardSearch(card, criteria))
