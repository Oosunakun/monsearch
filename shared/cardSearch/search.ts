import { normalizeCatalogText } from './normalizeCatalogText'
import type { SearchForm, NumericCondition, FilteredNumericCondition, SlotCondition } from '~~/app/types/ui/search'
import type { Card, Ability, Effect, SearchCostAlternative, SearchCostComponent, SearchCostType } from '~~/types/cards/finderCards'

const CARD_CATEGORY_NATURAL_KEY_TO_CODE: Readonly<Record<Exclude<SearchForm['cardCategory'], ''>, { cardCode: string, itemCode?: string }>> = {
  unit: { cardCode: 'Unit' },
  spell: { cardCode: 'Spell' },
  land: { cardCode: 'Land' },
  ritual: { cardCode: 'Ritual' },
  summoner: { cardCode: 'Summoner' },
  token: { cardCode: 'Token' },
  'item-consume': { cardCode: 'Item', itemCode: 'Consume' },
  'item-equip': { cardCode: 'Item', itemCode: 'Equip' },
  'item-bullet': { cardCode: 'Item', itemCode: 'Bullet' },
}

const ELEMENT_NATURAL_KEY_TO_CODE: Readonly<Record<string, string>> = {
  fire: 'Fire',
  water: 'Water',
  earth: 'Earth',
  air: 'Air',
  holy: 'Holy',
  curse: 'Curse',
}

const RARITY_NATURAL_KEY_TO_CODE: Readonly<Record<string, string>> = {
  circle: 'Basic',
  triangle: 'Common',
  rhombus: 'Uncommon',
  star: 'Rare',
  club: 'SuperRare',
  spade: 'Special',
  heart: 'Promotion',
  crescent: 'DragonJr',
  hexagram: 'Summoner',
}

const LAND_CATEGORY_NATURAL_KEY_TO_CODE = { none: 'None', ritual: 'Ritual' } as const

const compare = (actual: number | null | undefined, condition: NumericCondition) => actual !== null && actual !== undefined && (condition.value === null
  || (condition.operator === 'gte' ? actual >= condition.value : condition.operator === 'lte' ? actual <= condition.value : actual === condition.value))
const includesAny = (wanted: readonly string[], actual: readonly string[]) => {
  if (!wanted.length) return true
  const normalized = actual.map(value => value.toLocaleLowerCase())
  return wanted.some(value => {
    const expected = value.toLocaleLowerCase()
    return normalized.some(candidate => candidate === expected || candidate.endsWith(expected))
  })
}
const isFilteredActive = (condition: FilteredNumericCondition) => condition.filterType !== 'all' || condition.value !== null
const matchesNumericAbility = (actual: number | null | undefined, condition: FilteredNumericCondition, applicable: boolean) => {
  if (!isFilteredActive(condition)) return true
  if (condition.filterType !== 'all' && !applicable) return false
  if (condition.filterType === 'exclude') return actual === null || actual === undefined
  return actual !== null && actual !== undefined && (condition.value === null || compare(actual, condition))
}
const HALF_WIDTH_TO_FULL_WIDTH: readonly string[] = [
  '。', '「', '」', '、', '・', 'ヲ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ッ', 'ー',
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ン', '\u3099', '\u309A',
]
const COMPATIBILITY_WIDTH_MAP: Readonly<Record<number, string>> = {
  0xFFE0: '¢', 0xFFE1: '£', 0xFFE2: '¬', 0xFFE3: '¯', 0xFFE4: '¦', 0xFFE5: '¥', 0xFFE6: '₩',
  0xFFE8: '│', 0xFFE9: '←', 0xFFEA: '↑', 0xFFEB: '→', 0xFFEC: '↓', 0xFFED: '■', 0xFFEE: '○',
}
const isKana = (character: string) => {
  const codePoint = character.codePointAt(0)!
  return (codePoint >= 0x3041 && codePoint <= 0x3096)
    || (codePoint >= 0x309D && codePoint <= 0x309F)
    || (codePoint >= 0x30A1 && codePoint <= 0x30FA)
    || (codePoint >= 0x30FD && codePoint <= 0x30FF)
}
const composeKanaMarks = (value: string) => {
  const characters = Array.from(value)
  const composed: string[] = []
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index]!
    const next = characters[index + 1]
    if (isKana(character) && (next === '\u3099' || next === '\u309A')) {
      const pair = `${character}${next}`.normalize('NFC')
      composed.push(pair.length === 1 ? pair : character + next)
      index += 1
    } else {
      composed.push(character)
    }
  }
  return composed.join('')
}
const normalizeQdsText = (value: string) => composeKanaMarks(Array.from(value, character => {
  const codePoint = character.codePointAt(0)!
  const converted = codePoint === 0x3000
    ? ' '
    : codePoint >= 0xFF01 && codePoint <= 0xFF5E
      ? String.fromCodePoint(codePoint - 0xFEE0)
      : codePoint >= 0xFF61 && codePoint <= 0xFF9F
        ? HALF_WIDTH_TO_FULL_WIDTH[codePoint - 0xFF61]!
        : COMPATIBILITY_WIDTH_MAP[codePoint] ?? character
  const convertedCodePoint = converted.codePointAt(0)!
  return convertedCodePoint >= 0x41 && convertedCodePoint <= 0x5A
    ? String.fromCodePoint(convertedCodePoint + 0x20) : converted
}).join(''))
const normalizeEffectText = normalizeQdsText
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
const hasSlotCriteria = (condition: SlotCondition) => condition.match === 'none' || Object.keys(condition.slots).length > 0
const resistancesMatch = (ability: Ability | null | undefined, wanted: readonly string[]) => !wanted.length || includesAny(wanted, (ability?.affinities ?? []).filter(x => x.affinity.affinity_category_code === 'Resistance').map(x => x.affinity.affinity_id.toLowerCase()))
const textIncludes = (actual: string, wanted: string) => !wanted || actual.toLocaleLowerCase().includes(wanted.toLocaleLowerCase())
const effectTextIncludes = (actual: string, wanted: string) => !wanted || normalizeEffectText(actual).includes(normalizeEffectText(wanted))
const effectMatches = (effect: Effect, criteria: SearchForm) =>
  (!criteria.effectTypes.length || criteria.effectTypes.some(code => code === effect.effect_type_code))
  && (!criteria.effectActivationTypes.length || includesAny(criteria.effectActivationTypes, [String(effect.effect_activation_type_id).toLowerCase()]))
  && (!criteria.effectActivationCategories.length || criteria.effectActivationCategories.some(code => code === effect.effect_activation_category_code))
  && effectTextIncludes(effect.effect_text, criteria.effectText)

const COST_CONDITIONS = [
  { type: 'item', condition: 'costItemSlots', keys: new Set(['multi', 'consume', 'bullet']) },
  { type: 'spell', condition: 'costSpellSlots', keys: new Set(['fire', 'water', 'earth', 'air', 'holy', 'curse', 'multi']) },
  { type: 'other', condition: 'costOtherEntities', keys: new Set(['hand', 'deck', 'trash', 'power']) },
] as const

const componentCapacity = (component: SearchCostComponent, wanted: number) => {
  if (typeof component.quantity === 'number') return component.quantity >= wanted ? component.quantity : 0
  if (typeof component.max === 'number') return component.max >= wanted ? component.max : 0
  return 0
}

const alternativeMatchesCost = (alternative: SearchCostAlternative, type: SearchCostType, slots: Record<string, number>, match: 'or' | 'and') => {
  const entries = Object.entries(slots)
  if (!entries.length) return true
  const components = alternative.costs.filter(cost => cost.type === type)
  const explicitCapacity = (key: string) => components.filter(cost => cost.value === key).reduce((capacity, cost) => capacity + componentCapacity(cost, 1), 0)
  if (match === 'or') return entries.some(([key, amount]) => explicitCapacity(key) >= amount
    || (type === 'spell' && components.filter(cost => cost.value === 'any').reduce((capacity, cost) => capacity + componentCapacity(cost, 1), 0) >= amount))
  let anyCapacity = 0
  for (const [key, amount] of entries) {
    const explicit = explicitCapacity(key)
    if (explicit >= amount) continue
    if (type !== 'spell') return false
    anyCapacity += amount - explicit
  }
  if (!anyCapacity) return true
  const shared = components.filter(cost => cost.value === 'any').reduce((capacity, cost) => capacity + componentCapacity(cost, 1), 0)
  return shared >= anyCapacity
}

const hasKnownCostData = (effect: Effect) => effect.search_cost !== undefined && effect.search_cost !== null
const isKnownCostFree = (effect: Effect) => (effect.effect_cost_id === null || effect.effect_cost_id === '') && effect.effect_cost_text === '' && effect.search_cost === null
const prepareCostConditions = (criteria: SearchForm) => COST_CONDITIONS.map(({ type, condition, keys }) => ({ type, keys, value: criteria[condition] }))
    .map(entry => ({ ...entry, slots: Object.fromEntries(Object.entries(entry.value.slots).filter(([key, amount]) => entry.keys.has(key) && amount > 0)) }))
    .filter(({ value, slots }) => value.match === 'none' || Object.keys(slots).length > 0)
const costEffectMatches = (effect: Effect, active: ReturnType<typeof prepareCostConditions>) => {
  const searchCost = effect.search_cost
  if (!active.length) return true
  if (active.some(({ value }) => value.match === 'none')) {
    const knownFree = isKnownCostFree(effect)
    if (!knownFree && !hasKnownCostData(effect)) return false
    for (const { type, value } of active) {
      if (value.match !== 'none') continue
      if (knownFree) continue
      if (searchCost === undefined || searchCost === null) return false
      if (type === 'other' && searchCost.has_other_cost) return false
      if (searchCost.alternatives.some(alternative => alternative.costs.some(cost => cost.type === type))) return false
    }
  }
  if (isKnownCostFree(effect)) return active.every(({ value, slots }) => value.match === 'none' || !Object.keys(slots).length)
  if (searchCost === undefined || searchCost === null) return false
  return searchCost.alternatives.some(alternative => active.every(({ type, value, slots }) => value.match === 'none'
    || alternativeMatchesCost(alternative, type, slots, value.match === 'and' ? 'and' : 'or')))
}

export const createCardSearchMatcher = (criteria: SearchForm): ((card: Card) => boolean) => {
  const keyword = criteria.keyword ? normalizeCatalogText(criteria.keyword) : ''
  const archetypeText = criteria.archetypeText ? normalizeCatalogText(criteria.archetypeText) : ''
  const cardCategory = criteria.cardCategory ? CARD_CATEGORY_NATURAL_KEY_TO_CODE[criteria.cardCategory] : undefined
  const elementCodes = new Set(criteria.elements.map(value => ELEMENT_NATURAL_KEY_TO_CODE[value] ?? value))
  const rarityCodes = new Set(criteria.rarities.map(value => RARITY_NATURAL_KEY_TO_CODE[value] ?? value))
  const landCategoryCode = criteria.landCategory === 'all' ? undefined : LAND_CATEGORY_NATURAL_KEY_TO_CODE[criteria.landCategory]
  const hasAbilityItemSlots = hasSlotCriteria(criteria.abilityItemSlots)
  const hasAbilitySpellSlots = hasSlotCriteria(criteria.abilitySpellSlots)
  const hasAdditionalItemSlots = hasSlotCriteria(criteria.additionalAbilityItemSlots)
  const hasAdditionalSpellSlots = hasSlotCriteria(criteria.additionalAbilitySpellSlots)
  const hasEffectCriteria = criteria.effectTypes.length || criteria.effectActivationTypes.length || criteria.effectActivationCategories.length || criteria.effectText
  const hasCostCriteria = COST_CONDITIONS.some(({ condition }) => criteria[condition].match === 'none' || Object.values(criteria[condition].slots).some(value => value > 0))
  const costConditions = hasCostCriteria ? prepareCostConditions(criteria) : []
  return (card: Card): boolean => {
    const categoryCode = card.search_support?.is_token || card.card_category_code.toLowerCase() === 'token'
      ? 'Token'
      : card.card_category_code
    if (cardCategory) {
      if (categoryCode !== cardCategory.cardCode || (cardCategory.itemCode && card.item?.item_category_code !== cardCategory.itemCode)) return false
    }
    if (!textIncludes(card.name, criteria.name) || !textIncludes(card.reference_label, criteria.referenceLabel)) return false
    if (keyword && !card.search_support.full_text?.includes(keyword)) return false
    if (archetypeText && !card.search_support.archetype_text?.includes(archetypeText)) return false
    if (elementCodes.size && !card.unit?.elements?.some(element => elementCodes.has(element.element_code))
      && !card.spell?.elements?.some(element => elementCodes.has(element.element_code))) return false
    if (criteria.cardTypes.length && !includesAny(criteria.cardTypes, card.card_types.flatMap(x => [x.card_type_id, x.card_type_name]).map(x => x.toLowerCase()))) return false
    if (criteria.products.length && !includesAny(criteria.products, [card.product.product_id])) return false
    if (criteria.factions.length && !includesAny(criteria.factions, card.factions.flatMap(x => [x.faction_id, x.faction_name]).map(x => x.toLowerCase()))) return false
    if (criteria.blocks.length && !card.blocks.some(block => criteria.blocks.some(code => code === block.block_code))) return false
    if (rarityCodes.size && !rarityCodes.has(card.rarity_code)) return false
    if (criteria.illustrators.length && !includesAny(criteria.illustrators, [card.illustrator_id])) return false

    const unit = card.unit
    const unitAbilityApplicable = categoryCode === 'Token' ? unit != null : categoryCode === 'Unit'
    if (isFilteredActive(criteria.level) && (!unit || (criteria.level.filterType === 'include' && !unit.is_instant_summon) || (criteria.level.filterType === 'exclude' && unit.is_instant_summon) || !compare(unit.level, criteria.level))) return false
    if (isFilteredActive(criteria.heroPoint) && (!unit || (criteria.heroPoint.filterType === 'include' && !unit.is_hero) || (criteria.heroPoint.filterType === 'exclude' && unit.is_hero) || (criteria.heroPoint.filterType !== 'exclude' && criteria.heroPoint.value !== null && !compare(unit.hero_point, criteria.heroPoint)))) return false
    if (criteria.attack.value !== null && (!unit || !compare(unit.attack, criteria.attack))) return false
    if (criteria.defense.value !== null && (!unit || !compare(unit.defense, criteria.defense))) return false
    if (criteria.moveTypes.length && !criteria.moveTypes.some(code => code === unit?.move_type_code)) return false
    if (criteria.races.length && !includesAny(criteria.races, (unit?.races ?? []).flatMap(x => [x.race_id, x.race_name]).map(x => x.toLowerCase()))) return false
    if ((criteria.abilityItemSlots.match === 'none' && !unit) || (criteria.abilitySpellSlots.match === 'none' && !unit)
      || (hasAbilityItemSlots && !slotsMatch(unit?.ability, criteria.abilityItemSlots, 'Item')) || (hasAbilitySpellSlots && !slotsMatch(unit?.ability, criteria.abilitySpellSlots, 'Spell'))) return false
    if (!matchesNumericAbility(unit?.ability?.initiative, criteria.initiative, unitAbilityApplicable)) return false
    if (!matchesNumericAbility(unit?.ability?.charge, criteria.charge, unitAbilityApplicable)) return false
    if (!matchesNumericAbility(unit?.ability?.defender, criteria.defender, unitAbilityApplicable)) return false
    if (!resistancesMatch(unit?.ability, criteria.resistances)) return false

    const equip = card.item?.equip
    const equipmentAbilityApplicable = categoryCode === 'Token'
      ? equip != null
      : categoryCode === 'Item' && card.item?.item_category_code === 'Equip'
    if (criteria.additionalAttack.value !== null && (!equip || !compare(equip.attack, criteria.additionalAttack))) return false
    if (criteria.additionalDefense.value !== null && (!equip || !compare(equip.defense, criteria.additionalDefense))) return false
    if ((criteria.additionalAbilityItemSlots.match === 'none' && !equip) || (criteria.additionalAbilitySpellSlots.match === 'none' && !equip)
      || (hasAdditionalItemSlots && !slotsMatch(equip?.ability, criteria.additionalAbilityItemSlots, 'Item')) || (hasAdditionalSpellSlots && !slotsMatch(equip?.ability, criteria.additionalAbilitySpellSlots, 'Spell'))) return false
    if (!matchesNumericAbility(equip?.ability?.initiative, criteria.additionalInitiative, equipmentAbilityApplicable)) return false
    if (!matchesNumericAbility(equip?.ability?.charge, criteria.additionalCharge, equipmentAbilityApplicable)) return false
    if (!matchesNumericAbility(equip?.ability?.defender, criteria.additionalDefender, equipmentAbilityApplicable)) return false
    if (!resistancesMatch(equip?.ability, criteria.additionalResistances)) return false
    if (criteria.limit.value !== null && (!card.land || !compare(card.land.land_limit, criteria.limit))) return false
    if (landCategoryCode && card.land?.land_category_code !== landCategoryCode) return false

    if ((hasEffectCriteria || hasCostCriteria)
      && !card.effects.some(effect => (!hasEffectCriteria || effectMatches(effect, criteria)) && (!hasCostCriteria || costEffectMatches(effect, costConditions)))) return false
    return true
  }
}

export const matchesCardSearch = (card: Card, criteria: SearchForm): boolean => createCardSearchMatcher(criteria)(card)

export const searchCards = (cards: readonly Card[], criteria: SearchForm): Card[] => {
  const matches = createCardSearchMatcher(criteria)
  return cards.filter(matches)
}
