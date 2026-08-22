import { describe, expect, it } from 'vitest'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { cloneSearchForm, createFreshSearchForm, createPopulatedSearchForm } from './cardSearchQueryTestFixtures'

describe('buildCardSearchQuery', () => {
  it('builds canonical values without mutating the form', () => {
    const form = createPopulatedSearchForm(); const snapshot = cloneSearchForm(form)
    expect(buildCardSearchQuery(form)).toEqual({ nm: 'Blue Dragon', cc: 'unit', el: 'fire,water', at: 'gte:0' })
    expect(form).toEqual(snapshot)
  })

  it('serializes compounds, adapters, and stable mapping order', () => {
    const form = createFreshSearchForm()
    form.level = { filterType: 'include', operator: 'lte', value: 5 }
    form.defence = { operator: 'eq', value: 2 }
    form.additionalDefence = { operator: 'gte', value: 1 }
    form.abilitySpellSlots = { match: 'and', slots: { water: 2, fire: 1 } }
    expect(buildCardSearchQuery(form)).toEqual({ lvm: 'include', lv: 'lte:5', df: 'eq:2', ssm: 'and', ss: 'fire:1,water:2', adf: 'gte:1' })
  })

  it('omits defaults, invalid and partial state while retaining zero', () => {
    const form = createFreshSearchForm()
    form.name = '  '; form.attack.value = Number.NaN; form.defence.value = 0
    form.level.filterType = 'include'; form.abilityItemSlots.match = 'and'
    form.costItemSlots.slots = { blank: 0, negative: -1, invalid: Number.POSITIVE_INFINITY }
    expect(buildCardSearchQuery(form)).toEqual({ df: 'gte:0' })
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
