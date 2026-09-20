import type { SearchForm, NumericCondition, FilteredNumericCondition, SlotCondition } from '~~/app/types/ui/search'
import type { Card, Ability, Effect } from '~~/types/cards/finderCards'

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
const normalizeEffectText = (value: string) => composeKanaMarks(Array.from(value, character => {
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
const textIncludes = (actual: string, wanted: string) => !wanted || actual.toLocaleLowerCase().includes(wanted.toLocaleLowerCase())
const effectTextIncludes = (actual: string, wanted: string) => !wanted || normalizeEffectText(actual).includes(normalizeEffectText(wanted))
const effectMatches = (effect: Effect, criteria: SearchForm) =>
  includesAny(criteria.effectTypes, [String(effect.effect_type_code).toLowerCase()])
  && includesAny(criteria.effectActivationTypes, [String(effect.effect_activation_type_id).toLowerCase()])
  && includesAny(criteria.effectActivationCategories, [String(effect.effect_activation_category_code).toLowerCase()])
  && effectTextIncludes(effect.effect_text, criteria.effectText)

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
  const rarityCodes = criteria.rarities.map(value => RARITY_NATURAL_KEY_TO_CODE[value] ?? value)
  if (!includesAny(rarityCodes, [card.rarity_code]) || !includesAny(criteria.illustrators, [card.illustrator_id])) return false

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

  if ((criteria.effectTypes.length || criteria.effectActivationTypes.length || criteria.effectActivationCategories.length || criteria.effectText)
    && !card.effects.some(effect => effectMatches(effect, criteria))) return false
  return true
}

export const searchCards = (cards: readonly Card[], criteria: SearchForm): Card[] => cards.filter(card => matchesCardSearch(card, criteria))
