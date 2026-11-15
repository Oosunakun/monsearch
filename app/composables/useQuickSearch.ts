import { useAnalytics } from './useAnalytics'
import type { QuickSearchOption, QuickSearchState, QuickSearchTarget } from '~~/app/types/ui/layout'
import { buildQuickSearchQuery } from '~~/app/utils/search/quickSearchQueryBuilder'
import type { Router } from 'vue-router'

const createInitialQuickSearchState = (): QuickSearchState => ({
  selectedCardPool: 'open',
  selectedSearchType: 'name',
  searchText: ''
})

export const useQuickSearch = (router: Pick<Router, 'push'> = useRouter()) => {

  const analytics = useAnalytics()
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
    const token = analytics.submit('quick', query)
    try {
      await router.push(Object.keys(query).length > 0
        ? { path: '/cards', query }
        : { path: '/cards' })
    } finally { analytics.finishSubmit(token) }
  }

  return {
    quickSearchState,
    cardPools,
    searchTypes,
    runQuickSearch
  }
}
