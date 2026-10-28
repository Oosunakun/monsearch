import type { LocationQuery } from 'vue-router'
import { nextTick, onScopeDispose, ref, watch } from 'vue'
import type { CardSearchPerPage, CardSearchResultPage, CardSearchSortKey, CardSearchSortOrder } from '~~/server/types/cardSearch'
import { loadCardSearchDataset } from '~~/app/utils/cardSearchDataset'
import { prepareCardSearch, runCardSearch } from '~~/shared/cardSearch/runner'
import { normalizeClientSearchQuery } from '~~/shared/cardSearch/clientQuery'
import type { ClientSearchQuery } from '~~/shared/cardSearch/clientQuery'

export const useCardSearch = (query: Readonly<Ref<LocationQuery>>) => {
  const page = ref(1)
  const perPage = ref<CardSearchPerPage>(20)
  const sort = ref<CardSearchSortKey>('id')
  const order = ref<CardSearchSortOrder>('asc')
  const result = ref<CardSearchResultPage>()
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<unknown>()
  let lastRequest: ClientSearchQuery | undefined
  const ready = ref(false)
  let disposed = false
  let generation = 0
  let lastRequestKey: string | undefined

  type ApiQuery = ClientSearchQuery
  const makeRequest = (): ApiQuery => ({ ...query.value, page: String(page.value), perPage: String(perPage.value), sort: sort.value, order: order.value })
  const requestKey = (request: ApiQuery) => JSON.stringify(Object.keys(request).sort().map(key =>
    [key, request[key] === undefined ? ['undefined'] : ['value', request[key]]]))
  const execute = async (request: ApiQuery = makeRequest()) => {
    if (!ready.value || disposed) return
    const currentGeneration = ++generation
    const intentKey = requestKey(makeRequest())
    const isCurrent = () => !disposed && currentGeneration === generation
    const matchesRequest = () => isCurrent() && requestKey(makeRequest()) === intentKey
    lastRequestKey = intentKey
    lastRequest = { ...request }
    status.value = 'pending'; error.value = undefined
    try {
      const sources = await loadCardSearchDataset()
      if (!matchesRequest()) return
      const response = runCardSearch(sources, prepareCardSearch(normalizeClientSearchQuery(request)))
      result.value = response
      page.value = response.page; perPage.value = response.perPage; sort.value = response.sort.key; order.value = response.sort.order
      // 検索による表示条件の補正を、新しいユーザー操作として再送しない。
      const responseKey = lastRequestKey = requestKey(makeRequest())
      await nextTick()
      if (isCurrent() && requestKey(makeRequest()) === responseKey) status.value = 'success'
    } catch (cause) {
      if (!matchesRequest()) return
      error.value = cause; status.value = 'error'
    }
  }
  const retry = () => execute(lastRequest ?? makeRequest())

  onScopeDispose(() => { disposed = true; generation++ })
  if (import.meta.client) onNuxtReady(() => {
    if (!disposed) ready.value = true
  })

  watch([query, page, perPage, sort, order, ready], (current, previous) => {
    if (!ready.value || disposed || requestKey(makeRequest()) === lastRequestKey) return
    const controlsChanged = previous && (current[2] !== previous[2] || current[3] !== previous[3] || current[4] !== previous[4])
    if (controlsChanged && page.value !== 1) { page.value = 1; return }
    void execute()
  }, { deep: true, immediate: true })

  return { page, perPage, sort, order, result, status, error, refresh: execute, retry }
}
