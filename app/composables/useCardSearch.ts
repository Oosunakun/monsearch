import type { LocationQuery } from 'vue-router'
import type { CardSearchPerPage, CardSearchResultPage, CardSearchSortKey, CardSearchSortOrder } from '~~/server/types/cardSearch'

export const useCardSearch = (query: Readonly<Ref<LocationQuery>>) => {
  const page = ref(1)
  const perPage = ref<CardSearchPerPage>(20)
  const sort = ref<CardSearchSortKey>('id')
  const order = ref<CardSearchSortOrder>('asc')
  const result = ref<CardSearchResultPage>()
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<unknown>()
  let lastRequest: Record<string, string | string[] | null | undefined> | undefined
  let applyingResponse = false

  type ApiQuery = Record<string, string | string[] | null | undefined>
  const makeRequest = (): ApiQuery => ({ ...query.value, page: String(page.value), perPage: String(perPage.value), sort: sort.value, order: order.value })
  const execute = async (request: ApiQuery = makeRequest()) => {
    lastRequest = { ...request }
    status.value = 'pending'; error.value = undefined
    try {
      const response = await $fetch<CardSearchResultPage>('/api/cards', { query: request })
      result.value = response
      applyingResponse = true
      page.value = response.page; perPage.value = response.perPage; sort.value = response.sort.key; order.value = response.sort.order
      await nextTick()
      applyingResponse = false
      status.value = 'success'
    } catch (cause) { error.value = cause; status.value = 'error' }
  }
  const retry = () => execute(lastRequest ?? makeRequest())

  watch([query, page, perPage, sort, order], (current, previous) => {
    if (applyingResponse) return
    const controlsChanged = previous && (current[2] !== previous[2] || current[3] !== previous[3] || current[4] !== previous[4])
    if (controlsChanged && page.value !== 1) { page.value = 1; return }
    void execute()
  }, { deep: true, immediate: true })

  return { page, perPage, sort, order, result, status, error, refresh: execute, retry }
}
