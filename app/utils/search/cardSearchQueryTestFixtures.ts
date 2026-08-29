import type { SearchForm } from '~~/app/types/ui/search'
import type { LocationQuery } from 'vue-router'
import { expect } from 'vitest'
import { createSearchForm } from './cardSearchFormFactory'

export const createFreshSearchForm = (): SearchForm => createSearchForm()

export const representativeCardSearchQuery: LocationQuery = {
  nm: '青い竜 🐉',
  cc: 'unit',
  el: 'water,fire',
  at: 'eq:0',
  lvm: 'include',
  lv: 'lte:5',
  ssm: 'and',
  ss: 'water:2,fire:1',
}

export const createRepresentativeSearchForm = (): SearchForm => {
  const form = createSearchForm()
  form.name = '青い竜 🐉'
  form.cardCategory = 'unit'
  form.elements = ['water', 'fire']
  form.attack = { operator: 'eq', value: 0 }
  form.level = { filterType: 'include', operator: 'lte', value: 5 }
  form.abilitySpellSlots = { match: 'and', slots: { water: 2, fire: 1 } }
  return form
}

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
