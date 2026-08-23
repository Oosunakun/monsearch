import { describe, expect, it } from 'vitest'
import { buildCardSearchQuery } from './cardSearchQueryBuilder'
import { parseCardSearchQuery } from './cardSearchQueryParser'

describe('parseCardSearchQuery', () => {
  it('restores defaults and all value families', () => {
    const form = parseCardSearchQuery({ nm: ' dragon ', cc: 'unit', el: ['water,fire', 'fire'], lvm: 'include', lv: 'eq:0', ssm: 'and', ss: 'water:2,fire:1' })
    expect(form.name).toBe('dragon'); expect(form.cardCategory).toBe('unit')
    expect(form.elements).toEqual(['water', 'fire']); expect(form.level).toEqual({ filterType: 'include', operator: 'eq', value: 0 })
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
})
