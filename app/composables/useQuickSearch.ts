import type { QuickSearchOption, QuickSearchState, QuickSearchTarget } from '~~/app/types/ui/layout'
import { buildQuickSearchQuery } from '~~/app/utils/search/quickSearchQueryBuilder'
import type { Router } from 'vue-router'

const createInitialQuickSearchState = (): QuickSearchState => ({
  selectedCardPool: 'open',
  selectedSearchType: 'name',
  searchText: ''
})

export const useQuickSearch = (router: Pick<Router, 'push'> = useRouter()) => {

  const quickSearchState = ref<QuickSearchState>(createInitialQuickSearchState())

  const cardPools: QuickSearchOption[] = [
    { title: 'オープン', value: 'open' },
    { title: 'ネオスタン', value: 'neo-stand' }
  ]

  const searchTypes: QuickSearchOption<QuickSearchTarget>[] = [
    { title: 'カード名', value: 'name' },
    { title: '種族・タイプ', value: 'race-type' },
    { title: 'キーワード', value: 'keyword' }
  ]

  const runQuickSearch = async () => {
    const query = buildQuickSearchQuery(quickSearchState.value)
    await router.push(Object.keys(query).length > 0
      ? { path: '/cards', query }
      : { path: '/cards' })
  }

  return {
    quickSearchState,
    cardPools,
    searchTypes,
    runQuickSearch
  }
}
