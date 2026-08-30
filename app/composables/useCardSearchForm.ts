import type { SearchForm } from '~/types/ui/search'
import { createSearchForm } from '~/utils/search/cardSearchFormFactory'

export const useCardSearchForm = (initialForm: SearchForm = createSearchForm()) => {
  const form = ref<SearchForm>(structuredClone(initialForm))

  const resetForm = () => {
    form.value = createSearchForm()
  }

  return {
    form,
    resetForm,
  }
}
