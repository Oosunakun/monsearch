import { describe, expect, it } from 'vitest'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { parseCardSearchQuery } from './cardSearchQueryParser'
import { cloneSearchForm, createFreshSearchForm, createPopulatedSearchForm } from './cardSearchQueryTestFixtures'

describe('buildCardSearchQuery', () => {
  it('kw/attの原表現・内部空白・改行・タブをURL round tripで維持する', () => {
    const form = createFreshSearchForm()
    const value = 'Ｍ２０Ａ－００１ AＢC ｶﾞ　ｱｰﾆｬ  AN\nALL\tEND'
    form.keyword = `  ${value}  `
    form.archetypeText = `\t${value}\n`
    const snapshot = cloneSearchForm(form)
    const query = buildCardSearchQuery(form)
    expect(query).toEqual({ kw: value, att: value })
    const encoded = new URLSearchParams(query).toString()
    const restored = parseCardSearchQuery(Object.fromEntries(new URLSearchParams(encoded)))
    expect(restored).toMatchObject({ keyword: value, archetypeText: value })
    expect(buildCardSearchQuery(restored)).toEqual(query)
    expect(form).toEqual(snapshot)
  })
  it('builds canonical values without mutating the form', () => {
    const form = createPopulatedSearchForm(); const snapshot = cloneSearchForm(form)
    expect(buildCardSearchQuery(form)).toEqual({ nm: 'Blue Dragon', cc: 'unit', el: 'fire,water', at: 'gte:0' })
    expect(form).toEqual(snapshot)
  })

  it('serializes archetype text as att and omits blank values', () => {
    const form = createFreshSearchForm()
    form.archetypeText = '  ドラゴン  '
    expect(buildCardSearchQuery(form)).toEqual({ att: 'ドラゴン' })
    form.archetypeText = '  '
    expect(buildCardSearchQuery(form)).toEqual({})
  })

  it('serializes all Short UUID fields canonically, including unknown valid values', () => {
    const form = createFreshSearchForm()
    form.cardTypes = ['ABCDE', 'abcde', 'fffff', 'invalid']
    form.products = ['22D7E', 'abcde']
    form.factions = ['0000F']
    form.races = ['1234', '12345']
    form.illustrators = ['FFFFF']
    form.effectActivationTypes = ['aBcDe']
    form.resistances = ['00000']
    form.additionalResistances = ['zzzzz']
    expect(buildCardSearchQuery(form)).toEqual({ ct: 'abcde,fffff', pd: '22d7e,abcde', fa: '0000f', ra: '12345', il: 'fffff', eat: 'abcde', re: '00000' })
  })

  it('serializes compounds, adapters, and stable mapping order', () => {
    const form = createFreshSearchForm()
    form.level = { filterType: 'include', operator: 'lte', value: 5 }
    form.defense = { operator: 'eq', value: 2 }
    form.additionalDefense = { operator: 'gte', value: 1 }
    form.abilitySpellSlots = { match: 'and', slots: { water: 2, fire: 1 } }
    expect(buildCardSearchQuery(form)).toEqual({ lvm: 'include', lv: 'lte:5', df: 'eq:2', ssm: 'and', ss: 'fire:1,water:2', adf: 'gte:1' })
  })

  it.each([
    ['ism', 'abilityItemSlots', 'ism'],
    ['ssm', 'abilitySpellSlots', 'ssm'],
    ['aism', 'additionalAbilityItemSlots', 'aism'],
    ['assm', 'additionalAbilitySpellSlots', 'assm'],
    ['cism', 'costItemSlots', 'cism'],
    ['cssm', 'costSpellSlots', 'cssm'],
    ['coem', 'costOtherEntities', 'coem'],
  ] as const)('%s は Pairなしでも none を出力する', (_name, field, modifier) => {
    const form = createFreshSearchForm()
    form[field] = { match: 'none', slots: {} }
    expect(buildCardSearchQuery(form)).toEqual({ [modifier]: 'none' })
  })

  it('none と Pair が併記された場合は Pair を canonical URL から除外する', () => {
    const form = createFreshSearchForm()
    form.abilitySpellSlots = { match: 'none', slots: { fire: 2 } }
    expect(buildCardSearchQuery(form)).toEqual({ ssm: 'none' })
  })

  it('effect cost Pair collections and modifiers use canonical URLs', () => {
    const form = createFreshSearchForm()
    form.costItemSlots = { match: 'and', slots: { bullet: 1, consume: 2 } }
    form.costSpellSlots = { match: 'or', slots: { fire: 1, water: 2 } }
    form.costOtherEntities = { match: 'none', slots: { trash: 3 } }
    expect(buildCardSearchQuery(form)).toEqual({ cism: 'and', cis: 'bullet:1,consume:2', css: 'fire:1,water:2', coem: 'none' })
  })

  it('Pairなしの or / and は未指定として省略する', () => {
    const form = createFreshSearchForm()
    form.abilityItemSlots = { match: 'and', slots: {} }
    form.abilitySpellSlots = { match: 'or', slots: {} }
    expect(buildCardSearchQuery(form)).toEqual({})
  })

  it('omits defaults, invalid and partial state while retaining zero', () => {
    const form = createFreshSearchForm()
    form.name = '  '; form.attack.value = Number.NaN; form.defense.value = 0
    form.level.filterType = 'include'; form.abilityItemSlots.match = 'and'
    form.abilitySpellSlots.slots = { fire: 1.5 }
    form.costItemSlots.slots = { blank: 0, negative: -1, invalid: Number.POSITIVE_INFINITY, consume: 1.5 }
    expect(buildCardSearchQuery(form)).toEqual({ lvm: 'include', df: 'gte:0' })
  })

  it.each([
    ['include without comparison', { filterType: 'include', operator: 'gte', value: null }, { itm: 'include' }],
    ['exclude without comparison', { filterType: 'exclude', operator: 'gte', value: null }, { itm: 'exclude' }],
    ['include with zero', { filterType: 'include', operator: 'eq', value: 0 }, { itm: 'include', it: 'eq:0' }],
    ['exclude suppresses comparison', { filterType: 'exclude', operator: 'gte', value: 2 }, { itm: 'exclude' }],
  ] as const)('%s', (_name, condition, expected) => {
    const form = createFreshSearchForm()
    form.initiative = condition
    expect(buildCardSearchQuery(form)).toEqual(expected)
  })

  it('keeps level comparison when instant summon filter is exclude', () => {
    const form = createFreshSearchForm()
    form.level = { filterType: 'exclude', operator: 'gte', value: 2 }
    expect(buildCardSearchQuery(form)).toEqual({
      lvm: 'exclude',
      lv: 'gte:2',
    })
  })

  it('serializes additional initiative with its dedicated modifier alias', () => {
    const form = createFreshSearchForm()
    form.additionalInitiative = { filterType: 'include', operator: 'gte', value: 0 }
    expect(buildCardSearchQuery(form)).toEqual({ aitm: 'include', ait: 'gte:0' })
  })

  it.each([
    ['spell', 'unit', (form: ReturnType<typeof createFreshSearchForm>) => { form.attack.value = 1 }],
    ['unit', 'equipment', (form: ReturnType<typeof createFreshSearchForm>) => { form.additionalAttack.value = 1 }],
    ['spell', 'land', (form: ReturnType<typeof createFreshSearchForm>) => { form.limit.value = 1 }],
  ] as const)('omits %s category-inapplicable %s state', (category, _group, populate) => {
    const form = createFreshSearchForm(); form.cardCategory = category; populate(form)
    expect(buildCardSearchQuery(form)).toEqual({ cc: category })
  })
})
