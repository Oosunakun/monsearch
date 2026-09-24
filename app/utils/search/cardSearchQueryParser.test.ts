import { describe, expect, it } from 'vitest'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { parseCardSearchQuery } from './cardSearchQueryParser'
import { createSearchForm } from './cardSearchFormFactory'

describe('parseCardSearchQuery', () => {
  it('restores defaults and all value families', () => {
    const form = parseCardSearchQuery({ nm: ' dragon ', cc: 'unit', el: ['water,fire', 'fire'], lvm: 'include', lv: 'eq:0', df: 'lte:4', adf: 'gte:2', ssm: 'and', ss: 'water:2,fire:1' })
    expect(form.name).toBe('dragon'); expect(form.cardCategory).toBe('unit')
    expect(form.elements).toEqual(['water', 'fire']); expect(form.level).toEqual({ filterType: 'include', operator: 'eq', value: 0 })
    expect(form.defense).toEqual({ operator: 'lte', value: 4 }); expect(form.additionalDefense).toEqual({ operator: 'gte', value: 2 })
    expect(form.abilitySpellSlots).toEqual({ match: 'and', slots: { water: 2, fire: 1 } })
    expect(form.landCategory).toBe('all')
  })

  it('uses last-wins and merge rules and recovers around malformed values', () => {
    const form = parseCardSearchQuery({ nm: ['first', 'last'], att: ['first archetype', 'last archetype'], lv: ['bad', 'lte:3'], el: ['fire', 'water,fire'], ss: ['fire:1,bad', 'fire:2,water:nope'], unknown: 'ignored' })
    expect(form.name).toBe('last'); expect(form.level.value).toBe(3)
    expect(form.archetypeText).toBe('last archetype')
    expect(form.elements).toEqual(['fire', 'water']); expect(form.abilitySpellSlots.slots).toEqual({ fire: 2 })
  })

  it('canonically rebuilds non-canonical input', () => {
    expect(buildCardSearchQuery(parseCardSearchQuery({ el: ['water', 'fire,water'], lv: 'eq:0', lvm: 'all' })))
      .toEqual({ el: 'fire,water', lv: 'eq:0' })
  })

  it('restores standalone and excluded initiative modifiers while canonicalizing them', () => {
    const form = parseCardSearchQuery({ itm: 'exclude', it: 'gte:2', aitm: 'include' })
    expect(form.initiative).toEqual({ filterType: 'exclude', operator: 'gte', value: 2 })
    expect(form.additionalInitiative.filterType).toBe('include')
    expect(buildCardSearchQuery(form)).toEqual({ itm: 'exclude', aitm: 'include' })
  })

  it.each([
    ['ism', 'is', 'abilityItemSlots'],
    ['ssm', 'ss', 'abilitySpellSlots'],
    ['aism', 'ais', 'additionalAbilityItemSlots'],
    ['assm', 'ass', 'additionalAbilitySpellSlots'],
  ] as const)('%s は Pairなしの none を復元して Pairを捨てる', (_modifier, alias, field) => {
    const form = parseCardSearchQuery({ [_modifier]: 'none', [alias]: 'fire:2' })
    expect(form[field]).toEqual({ match: 'none', slots: {} })
    expect(buildCardSearchQuery(form)).toEqual({ [_modifier]: 'none' })
  })

  it('restores and rebuilds effect cost Pair collections and none modifiers', () => {
    const form = parseCardSearchQuery({ cis: 'consume:2,bullet:1', cism: 'and', css: 'water:2,fire:1', cssm: 'or', coe: 'trash:3', coem: 'none' })
    expect(form.costItemSlots).toEqual({ match: 'and', slots: { consume: 2, bullet: 1 } })
    expect(form.costSpellSlots).toEqual({ match: 'or', slots: { water: 2, fire: 1 } })
    expect(form.costOtherEntities).toEqual({ match: 'none', slots: {} })
    expect(buildCardSearchQuery(form)).toEqual({ cism: 'and', cis: 'bullet:1,consume:2', css: 'fire:1,water:2', coem: 'none' })
  })

  it.each([
    ['is', 'multi', 'abilityItemSlots'],
    ['ss', 'fire', 'abilitySpellSlots'],
    ['ais', 'multi', 'additionalAbilityItemSlots'],
    ['ass', 'fire', 'additionalAbilitySpellSlots'],
    ['cis', 'consume', 'costItemSlots'],
    ['css', 'fire', 'costSpellSlots'],
    ['coe', 'power', 'costOtherEntities'],
  ] as const)('%s Pairは0・負数・小数・NaN・非数値・未知keyを除外する', (alias, key, conditionName) => {
    const form = parseCardSearchQuery({ [alias]: `${key}:0,${key}:-1,${key}:1.5,${key}:NaN,${key}:invalid,unknown:2` })
    const condition = form[conditionName]

    expect(condition.slots).toEqual({})
  })

  it('Pairなしの or / and は既定値へ戻る', () => {
    const form = parseCardSearchQuery({ ism: 'and', ssm: 'or' })
    expect(form.abilityItemSlots).toEqual({ match: 'or', slots: {} })
    expect(form.abilitySpellSlots).toEqual({ match: 'or', slots: {} })
    expect(buildCardSearchQuery(form)).toEqual({})
  })

  it('recovers valid fields independently from unknown, invalid, incomplete, and duplicate input', () => {
    const form = parseCardSearchQuery({
      nm: ['discarded', '有効 🐉'],
      at: 'invalid',
      lvm: 'include',
      lv: 'invalid',
      ss: ['fire:1,bad', 'water:2,fire:3'],
      unknown: 'ignored',
    })

    expect(form.name).toBe('有効 🐉')
    expect(form.attack).toEqual({ operator: 'gte', value: null })
    expect(form.level).toEqual({ filterType: 'include', operator: 'gte', value: null })
    expect(form.abilitySpellSlots.slots).toEqual({ fire: 3, water: 2 })
  })

  it('Short UUIDはmaster dataにない有効値もcanonical化して復元する', () => {
    const expected = createSearchForm()
    expected.products = ['22d7e', 'abcde']
    expect(parseCardSearchQuery({ pd: '22D7E,abcde,invalid,abcd' })).toEqual({ ...expected })
  })

  it.each(['ct', 'pd', 'fa', 'ra', 'il', 'eat', 're', 'are'] as const)('%s は有効値を保持し、不正値を除外する', alias => {
    const form = parseCardSearchQuery({ [alias]: 'ABCDE,fffff,1234,zzzzz,' })
    const field = { ct: 'cardTypes', pd: 'products', fa: 'factions', ra: 'races', il: 'illustrators', eat: 'effectActivationTypes', re: 'resistances', are: 'additionalResistances' }[alias] as keyof typeof form
    expect(form[field]).toEqual(['abcde', 'fffff'])
  })
})
