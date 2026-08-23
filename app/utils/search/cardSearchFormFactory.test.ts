import { describe, expect, it } from 'vitest'
import { createSearchForm, defaultNumericCondition } from './cardSearchFormFactory'

describe('createSearchForm', () => {
  it('initializes defense fields as independent numeric conditions', () => {
    const form = createSearchForm()

    expect(form.defense).toEqual(defaultNumericCondition)
    expect(form.additionalDefense).toEqual(defaultNumericCondition)
    expect(form.defense).not.toBe(form.additionalDefense)
  })
})
