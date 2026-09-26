import { describe, expect, it } from 'vitest'
import { createSearchForm, defaultNumericCondition, defaultFilteredNumericCondition } from './cardSearchFormFactory'

describe('createSearchForm', () => {
  it('initializes defense fields as independent numeric conditions', () => {
    const form = createSearchForm()

    expect(form.defense).toEqual(defaultNumericCondition)
    expect(form.additionalDefense).toEqual(defaultNumericCondition)
    expect(form.defense).not.toBe(form.additionalDefense)
  })

  it('initializes initiative fields as filtered conditions with the all default', () => {
    const form = createSearchForm()
    expect(form.initiative).toEqual(defaultFilteredNumericCondition)
    expect(form.additionalInitiative).toEqual(defaultFilteredNumericCondition)
    expect(form.initiative).not.toBe(form.additionalInitiative)
  })
})
