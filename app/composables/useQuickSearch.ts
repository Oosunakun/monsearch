import type { QuickSearchOption, QuickSearchState } from '~~/app/types/ui/layout'

const createInitialQuickSearchState = (): QuickSearchState => ({
  selectedCardPool: 'open',
  selectedSearchType: 'name',
  searchText: ''
})

export const useQuickSearch = () => {
  const router = useRouter()

  const quickSearchState = ref<QuickSearchState>(createInitialQuickSearchState())

  const cardPools: QuickSearchOption[] = [
    { title: 'オープン', value: 'open' },
    { title: 'ネオスタン', value: 'neo-stand' }
  ]

  const searchTypes: QuickSearchOption[] = [
    { title: 'カード名', value: 'name' },
    { title: '種族・タイプ', value: 'race-type' },
    { title: 'キーワード', value: 'keyword' }
  ]

  const runQuickSearch = async () => {
    await router.push({
      path: '/cards',
      query: {
        pool: quickSearchState.value.selectedCardPool,
        type: quickSearchState.value.selectedSearchType,
        q: quickSearchState.value.searchText.trim()
      }
    })
  }

  return {
    quickSearchState,
    cardPools,
    searchTypes,
    runQuickSearch
  }
}
