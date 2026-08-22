import type { SearchForm } from '~~/app/types/ui/search'
import { expect } from 'vitest'
import { createSearchForm } from './cardSearchFormFactory'

export const createFreshSearchForm = (): SearchForm => createSearchForm()

export const createPopulatedSearchForm = (): SearchForm => {
  const form = createSearchForm()
  form.name = ' Blue Dragon '
  form.cardCategory = 'unit'
  form.elements = ['water', 'fire', 'water']
  form.attack = { operator: 'gte', value: 0 }
  return form
}

export const cloneSearchForm = (form: SearchForm): SearchForm => structuredClone(form)
export const expectSearchFormUnchanged = (form: SearchForm, snapshot: SearchForm) => {
  expect(form).toEqual(snapshot)
}
