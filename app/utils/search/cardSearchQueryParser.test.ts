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
    const form = parseCardSearchQuery({ nm: ['first', 'last'], lv: ['bad', 'lte:3'], el: ['fire', 'water,fire'], ss: ['fire:1,bad', 'fire:2,water:nope'], unknown: 'ignored' })
    expect(form.name).toBe('last'); expect(form.level.value).toBe(3)
    expect(form.elements).toEqual(['fire', 'water']); expect(form.abilitySpellSlots.slots).toEqual({ fire: 2 })
  })

  it('canonically rebuilds non-canonical input', () => {
    expect(buildCardSearchQuery(parseCardSearchQuery({ el: ['water', 'fire,water'], lv: 'eq:0', lvm: 'all' })))
      .toEqual({ el: 'fire,water', lv: 'eq:0' })
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
    expect(form.level).toEqual({ filterType: 'all', operator: 'gte', value: null })
    expect(form.abilitySpellSlots.slots).toEqual({ fire: 3, water: 2 })
  })

  it('canonical pd の再読込で product 1件だけを復元し、ほかは defaults にする', () => {
    const expected = createSearchForm()
    expected.products = ['91122d7e']
    expect(parseCardSearchQuery({ pd: '91122d7e' })).toEqual(expected)
  })
})
