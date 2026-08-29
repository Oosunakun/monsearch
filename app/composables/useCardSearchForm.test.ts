import { describe, expect, it } from 'vitest'
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
})
