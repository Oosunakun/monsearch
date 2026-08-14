import { 
  createSearchForm
} from '~/utils/search/cardSearchFormFactory'

export const useCardSearchForm = () => {
  const form = ref(createSearchForm())

  const resetForm = () => {
    form.value = createSearchForm()
  }

  return {
    form,
    resetForm,
  }
}