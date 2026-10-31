import type { FinderCards } from '~~/types/cards/finderCards'
import type { SearchOption, NumericOption } from '~~/app/types/ui/searchOption'
import latest from '~~/app/utils/mockData/items/cards.json'
import * as items from '~~/app/utils/constants/search/items'
import { mockProductSources } from '~~/app/utils/mockData/indexPage'
import { mockRestrictionAvailableProductSources } from '~~/app/utils/mockData/restrictions'
import { makeCard, textEffect } from '../fixtures/cardSearch/cards'

const uuidNames = ['cardTypeItems', 'productItems', 'factionItems', 'raceItems', 'illustratorItems', 'effectActivationTypeItems', 'resistanceItems'] as const
const numericNames = ['additionalCombatItems', 'chargeItems', 'combatItems', 'defenderItems', 'heroPointItems', 'initiativeItems', 'levelItems', 'limitItems']
export interface LatestMasterBundle {
  file: FinderCards
  options: Record<string, SearchOption[]>
  numeric: Record<string, NumericOption[]>
  words: Record<string, SearchOption[]>
  rows: { home: typeof mockProductSources, restrictions: typeof mockRestrictionAvailableProductSources }
}
export interface UpdateScenario {
  scenarioId: string
  operation: 'add' | 'change' | 'delete'
  targetDataset: string
  basis: string
  invariants: string[]
  linkedUpdates: string[]
  preparation: string[]
  beforeTarget: unknown[]
  input: LatestMasterBundle
  original: LatestMasterBundle
}

export const originalBundle = (): LatestMasterBundle => {
  const options: Record<string, SearchOption[]> = {}
  const numeric: Record<string, NumericOption[]> = {}
  const words: Record<string, SearchOption[]> = {}
  for (const [name, values] of Object.entries(items)) {
    if (uuidNames.some(key => key === name)) options[name] = structuredClone(values) as SearchOption[]
    else if (numericNames.includes(name) || values.some(value => typeof value.value === 'number')) numeric[name] = structuredClone(values) as NumericOption[]
    else words[name] = structuredClone(values) as SearchOption[]
  }
  return { file: structuredClone(latest) as unknown as FinderCards, options, numeric, words,
    rows: { home: structuredClone(mockProductSources), restrictions: structuredClone(mockRestrictionAvailableProductSources) } }
}

export const makeScenarios = (original: LatestMasterBundle = originalBundle()): UpdateScenario[] => {
  const result: UpdateScenario[] = []
  const freshCard = (input: LatestMasterBundle) => {
    let counter = 1
    const ids = new Set(input.file.cards.map(card => card.card_id))
    while (ids.has(`f0000000-0000-7000-8000-${String(counter).padStart(12, '0')}`)) counter++
    return makeCard({ card_id: `f0000000-0000-7000-8000-${String(counter).padStart(12, '0')}` })
  }
  const add = (targetDataset: string, operation: UpdateScenario['operation'], update: (input: LatestMasterBundle) => void, suffix = '') => {
    const input = structuredClone(original)
    const preparation: string[] = []
    // 最新側の最後の行が削除されても、変更/削除の正例を暗黙に要求しない。
    // 対象が空なら明示的なテスト用seedを置き、その準備と操作前集合を記録する。
    if (targetDataset === 'cards' && operation !== 'add' && input.file.cards.length === 0) {
      input.file.cards.push(makeCard()); preparation.push('空cardsへ固定の操作対象を準備')
    }
    if (targetDataset === 'cards' && operation === 'change' && !input.file.cards.some(card => card.unit)) {
      input.file.cards.push(freshCard(input)); preparation.push('unitなし入力に数値操作用の固定Cardを準備')
    }
    if (input.options[targetDataset]?.length === 0 && operation !== 'add') {
      input.options[targetDataset]!.push({ value: '00000', label: '操作対象', color: '#fff' }); preparation.push('空UUID集合へ固定の操作対象を準備')
    }
    if (input.numeric[targetDataset]?.length === 0 && operation !== 'add') {
      input.numeric[targetDataset]!.push({ value: 0, label: '操作対象' }); preparation.push('空数値集合へ固定の操作対象を準備')
    }
    const screen = targetDataset === 'homeRows' ? 'home' : targetDataset === 'restrictionsRows' ? 'restrictions' : undefined
    if (screen) {
      if (input.options.productItems!.length === 0) {
        input.options.productItems!.push({ value: '00000', label: '操作用商品' }); preparation.push('行操作の有効参照先を準備')
      }
      if (operation !== 'add' && input.rows[screen].length === 0) {
        input.rows[screen].push({ id: 'r24-seed', searchValue: input.options.productItems![0]!.value, shortName: '', productName: '操作行', productNote: '', releaseDate: '' }); preparation.push('空商品行へ固定の操作対象を準備')
      }
    }
    const target = targetDataset === 'cards' ? input.file.cards : screen ? input.rows[screen] : input.options[targetDataset] ?? input.numeric[targetDataset] ?? input.words[targetDataset] ?? []
    const beforeTarget = structuredClone(target)
    update(input)
    result.push({ scenarioId: `${targetDataset}/${operation}${suffix}`, targetDataset, operation, input, original, preparation, beforeTarget,
      basis: 'specs/016-decouple-search-test-data/contracts/search-test-data.md §5 / HD-C08 B',
      invariants: ['固定DTO/Oracle不変', '最新入力が更新を反映', '元入力非破壊'], linkedUpdates: targetDataset === 'productItems' ? ['公開商品行の対応更新/削除'] : [] })
  }
  add('cards', 'add', b => { b.file.cards.push(freshCard(b)) })
  add('cards', 'change', b => {
    const card = b.file.cards[0]!
    card.name += ' 更新'
    if (card.effects.length === 0) card.effects.push(structuredClone(textEffect))
    card.effects[0]!.effect_text += '\nR24更新。'
    card.search_support.full_text += ' r24更新'
    const unit = b.file.cards.find(row => row.unit)?.unit
    if (unit) unit.attack++
  })
  add('cards', 'delete', b => { b.file.cards.splice(0, 1) })
  add('cards', 'delete', b => { b.file.cards = [] }, '/last-positive')
  for (const name of uuidNames) {
    const occupied = new Set(original.options[name]!.map(option => option.value))
    let candidate = 0
    while (occupied.has(candidate.toString(16).padStart(5, '0'))) candidate++
    const unused = candidate.toString(16).padStart(5, '0')
    add(name, 'add', b => { b.options[name]!.push({ value: unused, label: '追加候補', color: '#fff' }) })
    add(name, 'change', b => { b.options[name]!.reverse(); if (b.options[name]![0]) b.options[name]![0]!.label += ' 更新' })
    add(name, 'delete', b => {
      const removed = b.options[name]!.shift()
      if (name === 'productItems' && removed) {
        b.rows.home = b.rows.home.filter(row => row.searchValue !== removed.value)
        b.rows.restrictions = b.rows.restrictions.filter(row => row.searchValue !== removed.value)
      }
    })
  }
  for (const name of Object.keys(original.numeric)) {
    add(name, 'add', b => { b.numeric[name]!.push({ label: '追加候補', value: Math.max(0, ...b.numeric[name]!.map(option => option.value)) + 1 }) })
    add(name, 'change', b => { b.numeric[name]!.reverse(); if (b.numeric[name]![0]) b.numeric[name]![0]!.label += ' 更新' })
    add(name, 'delete', b => { b.numeric[name]!.pop() })
  }
  for (const screen of ['home', 'restrictions'] as const) {
    add(`${screen}Rows`, 'add', b => {
      let id = 'r24-new'
      while (b.rows[screen].some(row => row.id === id)) id += '-new'
      b.rows[screen].push({ id, searchValue: b.options.productItems![0]!.value, shortName: '', productName: '追加行', productNote: '', releaseDate: '' })
    })
    add(`${screen}Rows`, 'change', b => { if (b.rows[screen][0]) b.rows[screen][0]!.productName += ' 更新' })
    add(`${screen}Rows`, 'delete', b => { b.rows[screen].pop() })
  }
  for (const name of Object.keys(original.words)) {
    add(name, 'change', b => { b.words[name]!.reverse(); if (b.words[name]![0]) b.words[name]![0]!.label += ' 更新' })
  }
  return result
}
