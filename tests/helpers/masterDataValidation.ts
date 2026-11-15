import { normalizeCatalogText } from '~~/shared/cardSearch/normalizeCatalogText'

export interface ValidationIssue {
  dataset: string
  recordId: string
  fieldPath: string
  ruleId: string
  reason: string
  basis: string
}
export interface ValidationReport { issues: ValidationIssue[], recordCount: number, emptyCatalogCount: number }
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0
const report = (): ValidationReport => ({ issues: [], recordCount: 0, emptyCatalogCount: 0 })
const issue = (result: ValidationReport, dataset: string, recordId: string, fieldPath: string, ruleId: string, reason: string) => {
  result.issues.push({ dataset, recordId, fieldPath, ruleId, reason, basis: `specs/016-decouple-search-test-data/contracts/search-test-data.md ${ruleId}` })
}

export const validateCards = (input: unknown): ValidationReport => {
  const result = report()
  const add = (id: string, field: string, rule: string, why: string) => issue(result, 'cards.json', id, field, rule, why)
  if (!record(input) || typeof input.version !== 'string' || typeof input.generated_at !== 'string' || !Array.isArray(input.cards)) {
    add('root', '$', 'C01', 'version/generated_at/cardsの構造不正')
    return result
  }
  const ids = new Set<string>()
  result.recordCount = input.cards.length
  input.cards.forEach((card: unknown, index: number) => {
    const prefix = `cards[${index}]`
    const id = record(card) && typeof card.card_id === 'string' ? card.card_id : String(index)
    if (!record(card)) { add(id, prefix, 'C02', 'Cardがobjectでない'); return }
    for (const field of ['card_id', 'reference_label', 'name', 'card_category_code', 'card_category_name']) {
      if (typeof card[field] !== 'string' || !card[field]) add(id, `${prefix}.${field}`, 'C02', '必須string欠損')
    }
    if (ids.has(id)) add(id, `${prefix}.card_id`, 'C03', '重複card_id')
    ids.add(id)
    if (!record(card.product) || typeof card.product.product_name !== 'string' || !card.product.product_name) add(id, `${prefix}.product.product_name`, 'C02', '商品名欠損')
    if (!record(card.product) || typeof card.product.product_id !== 'string') add(id, `${prefix}.product.product_id`, 'C03', '商品IDの型不正')
    if (typeof card.illustrator_id !== 'string') add(id, `${prefix}.illustrator_id`, 'C03', '作者IDの型不正')
    const checkRows = (rows: unknown, field: string, strings: string[]) => {
      if (!Array.isArray(rows)) { add(id, field, 'C02', '配列欠損'); return }
      rows.forEach((row: unknown, i: number) => {
        if (!record(row)) { add(id, `${field}[${i}]`, 'C02', '配列要素がobjectでない'); return }
        for (const key of strings) if (typeof row[key] !== 'string') add(id, `${field}[${i}].${key}`, key.endsWith('_id') ? 'C03' : 'C02', '文字列field欠損/型不正')
      })
    }
    checkRows(card.card_types, `${prefix}.card_types`, ['card_type_id', 'card_type_name'])
    checkRows(card.factions, `${prefix}.factions`, ['faction_id', 'faction_name'])
    checkRows(card.blocks, `${prefix}.blocks`, ['block_code', 'block_name'])
    for (const key of ['card_types', 'blocks', 'factions', 'tags', 'errata']) {
      if (!Array.isArray(card[key])) add(id, `${prefix}.${key}`, 'C02', '配列欠損')
    }
    for (const key of ['unit', 'spell', 'item', 'land', 'ritual', 'summoner']) {
      if (card[key] !== null && !record(card[key])) add(id, `${prefix}.${key}`, 'C02', '詳細の型不正')
    }
    const checkAbility = (ability: unknown, field: string) => {
      if (ability === null) return
      if (!record(ability)) { add(id, field, 'C02', 'ability型不正'); return }
      for (const key of ['initiative', 'charge', 'defender']) if (ability[key] !== null && typeof ability[key] !== 'number') add(id, `${field}.${key}`, 'C02', '能力値型不正')
      for (const key of ['ability_slots', 'affinities']) if (!Array.isArray(ability[key])) add(id, `${field}.${key}`, 'C02', '能力配列欠損')
      checkRows(ability.ability_slots, `${field}.ability_slots`, ['ability_slot_type_code', 'ability_slot_type_name', 'ability_slot_category_code'])
      if (Array.isArray(ability.ability_slots)) ability.ability_slots.forEach((slot: unknown, i: number) => {
        if (record(slot) && typeof slot.slot_count !== 'number') add(id, `${field}.ability_slots[${i}].slot_count`, 'C02', '枠数量の型不正')
      })
      if (Array.isArray(ability.affinities)) ability.affinities.forEach((entry: unknown, i: number) => {
        if (!record(entry) || !record(entry.affinity) || typeof entry.affinity.affinity_id !== 'string') add(id, `${field}.affinities[${i}].affinity`, 'C03', '相性IDの型不正')
      })
    }
    if (record(card.unit)) {
      for (const key of ['level', 'attack', 'defense', 'hero_point']) if (card.unit[key] !== null && typeof card.unit[key] !== 'number') add(id, `${prefix}.unit.${key}`, 'C02', '数値型不正')
      for (const key of ['elements', 'races']) if (!Array.isArray(card.unit[key])) add(id, `${prefix}.unit.${key}`, 'C02', '配列欠損')
      checkRows(card.unit.elements, `${prefix}.unit.elements`, ['element_code', 'element_name'])
      checkRows(card.unit.races, `${prefix}.unit.races`, ['race_id', 'race_name'])
      checkAbility(card.unit.ability, `${prefix}.unit.ability`)
    }
    if (record(card.item) && record(card.item.equip)) checkAbility(card.item.equip.ability, `${prefix}.item.equip.ability`)
    if (record(card.spell) && !Array.isArray(card.spell.elements)) add(id, `${prefix}.spell.elements`, 'C02', '属性配列欠損')
    if (!record(card.search_support)) add(id, `${prefix}.search_support`, 'C04', 'catalog親欠損')
    else {
      for (const key of ['full_text', 'archetype_text']) {
        const value = card.search_support[key]
        if (typeof value !== 'string' || normalizeCatalogText(value) !== value) add(id, `${prefix}.search_support.${key}`, 'C04', '正規化済みstringでない')
        if (value === '') result.emptyCatalogCount++
      }
      if (typeof card.search_support.is_token !== 'boolean') add(id, `${prefix}.search_support.is_token`, 'C04', 'booleanでない')
    }
    if (!Array.isArray(card.effects)) { add(id, `${prefix}.effects`, 'C05', 'effectsが配列でない'); return }
    card.effects.forEach((effect: unknown, ei: number) => {
      const ep = `${prefix}.effects[${ei}]`
      if (!record(effect)) { add(id, ep, 'C05', 'Effectがobjectでない'); return }
      for (const field of ['effect_name', 'effect_type_name', 'effect_type_code', 'effect_activation_type_name', 'effect_activation_category_code', 'effect_activation_timing_name', 'effect_cost_text', 'effect_target_name', 'effect_text']) {
        if (effect[field] !== null && typeof effect[field] !== 'string') add(id, `${ep}.${field}`, 'C05', '効果fieldの型不正')
      }
      const cost = effect.search_cost
      if (cost == null) {
        if (effect.effect_cost_text) add(id, `${ep}.search_cost`, 'C06', '非空コストの構造化値欠損')
        return
      }
      if (!record(cost) || !Array.isArray(cost.alternatives) || typeof cost.has_other_cost !== 'boolean') { add(id, `${ep}.search_cost`, 'C06', 'cost構造不正'); return }
      cost.alternatives.forEach((alt: unknown, ai: number) => {
        const ap = `${ep}.search_cost.alternatives[${ai}]`
        if (!record(alt) || !Array.isArray(alt.costs)) { add(id, ap, 'C06', 'alternative構造不正'); return }
        alt.costs.forEach((part: unknown, ci: number) => {
          const cp = `${ap}.costs[${ci}]`
          if (!record(part)) { add(id, cp, 'C06', 'component構造不正'); return }
          const allowed: Record<string, string[]> = { item: ['multi', 'consume', 'bullet'], spell: ['fire', 'water', 'earth', 'air', 'holy', 'curse', 'multi', 'any'], other: ['trash', 'hand', 'deck', 'power'] }
          if (typeof part.type !== 'string' || typeof part.value !== 'string' || !allowed[part.type]?.includes(part.value)) add(id, cp, 'C06', 'component語彙不正')
          const exact = positive(part.quantity) && part.min === undefined && part.max === undefined
          const range = part.quantity === undefined && positive(part.min) && positive(part.max) && part.min <= part.max
          if (!exact && !range) add(id, cp, 'C06', '数量またはrange不正')
        })
      })
    })
  })
  return result
}

export const validateOptions = (options: unknown, uuid: boolean, dataset = 'options'): ValidationReport => {
  const result = report()
  if (!Array.isArray(options)) { issue(result, dataset, 'root', '$', 'C07', '選択肢は配列'); return result }
  result.recordCount = options.length
  options.forEach((option: unknown, i: number) => {
    if (!record(option) || typeof option.label !== 'string' || typeof option.value !== 'string' || (option.color !== undefined && typeof option.color !== 'string')
      || (uuid && !/^[0-9a-f]{5}$/i.test(option.value))) issue(result, dataset, String(i), `[${i}]`, 'C07', 'SearchOption/UUID形式不正')
  })
  return result
}

export const validateProductRows = (rows: unknown, options: unknown, dataset = 'productRows'): ValidationReport => {
  const result = report()
  const values = new Set(Array.isArray(options) ? options.filter(record).map(option => option.value) : [])
  if (!Array.isArray(rows)) { issue(result, dataset, 'root', '$', 'C08', '行は配列'); return result }
  result.recordCount = rows.length
  const ids = new Set<string>()
  rows.forEach((row: unknown, i: number) => {
    const id = record(row) && typeof row.id === 'string' ? row.id : String(i)
    if (!record(row) || typeof row.id !== 'string' || ids.has(row.id)) issue(result, dataset, id, `[${i}].id`, 'C08', '行IDの欠損/重複')
    ids.add(id)
    if (!record(row) || typeof row.searchValue !== 'string' || !values.has(row.searchValue)) issue(result, dataset, id, `[${i}].searchValue`, 'C08', '商品参照切れ')
  })
  return result
}
