import { describe, expect, it } from 'vitest'
import type { SearchForm } from '~~/app/types/ui/search'
import { createRepresentativeSearchForm } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { useCardSearchForm } from './useCardSearchForm'

describe('useCardSearchForm', () => {
  it('owns an independent copy of its initial form and resets to defaults', () => {
    const initialForm = createRepresentativeSearchForm()
    const { form, resetForm } = useCardSearchForm(initialForm)

    form.value.name = 'edited'
    expect(initialForm.name).toBe('青い竜 🐉')

    resetForm()
    expect(form.value).toEqual(createSearchForm())
  })

  it('resets all seven sections with fresh nested state on every clear', () => {
    const initialForm: SearchForm = {
      ...createRepresentativeSearchForm(),
      products: ['22d7e'],
      additionalAttack: { operator: 'eq', value: 2 },
      landCategory: 'ritual',
      costItemSlots: { match: 'none', slots: { multi: 2 } },
      referenceLabel: '参照ラベル',
    }
    const state = useCardSearchForm(initialForm)
    const { form, resetForm } = state
    const before = form.value

    resetForm()

    const cleared = form.value
    expect(state.form).toBe(form)
    expect(cleared).toEqual(createSearchForm())
    expect(cleared).not.toBe(before)
    expect(cleared.elements).not.toBe(before.elements)
    expect(cleared.attack).not.toBe(before.attack)
    expect(cleared.abilitySpellSlots).not.toBe(before.abilitySpellSlots)
    expect(cleared.abilitySpellSlots.slots).not.toBe(before.abilitySpellSlots.slots)
    expect(cleared.elements).not.toBe(cleared.cardTypes)
    expect(cleared.attack).not.toBe(cleared.additionalAttack)
    expect(cleared.abilitySpellSlots).not.toBe(cleared.costSpellSlots)
    expect(cleared.abilitySpellSlots.slots).not.toBe(cleared.costSpellSlots.slots)

    resetForm()
    expect(form.value).toEqual(createSearchForm())
    form.value.elements.push('fire')
    form.value.attack.value = 0
    form.value.abilitySpellSlots.slots.fire = 1

    expect(cleared).toEqual(createSearchForm())
    expect(before).toEqual(initialForm)
    expect(form.value.additionalAttack.value).toBeNull()
    expect(form.value.costSpellSlots.slots).toEqual({})
  })
})
