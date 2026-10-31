import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { LocationQuery } from 'vue-router'
import { historicalSources as getSourceCards } from '~~/tests/fixtures/cardSearch/sources'
import { useCardSearch } from './useCardSearch'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS, CARD_SEARCH_PER_PAGE, type SourceCard, type CardSearchSortKey, type CardSearchSortOrder } from '~~/shared/cardSearch/types'
import { expectedIds } from '~~/specs/015-search-result-sorting/verification/sort-expectations'

const { readyCallbacks, loadMock } = vi.hoisted(() => ({
  readyCallbacks: [] as Array<() => void>, loadMock: vi.fn(),
}))
mockNuxtImport('onNuxtReady', () => (callback: () => void) => { readyCallbacks.push(callback) })
vi.mock('~~/app/utils/cardSearchDataset', () => ({ loadCardSearchDataset: loadMock }))
const deferred = () => {
  let resolve!: (value: readonly SourceCard[]) => void
  let reject!: (cause: Error) => void
  const promise = new Promise<readonly SourceCard[]>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const wrappers: Array<ReturnType<typeof mount>> = []
const setupSearch = (initial: LocationQuery = {}) => {
  const query = ref<LocationQuery>(initial)
  let search!: ReturnType<typeof useCardSearch>
  const wrapper = mount(defineComponent({ setup() { search = useCardSearch(query); return () => h('div') } }))
  wrappers.push(wrapper)
  return { query, search, wrapper }
}
const becomeReady = async () => {
  for (const callback of readyCallbacks.splice(0)) callback()
  await nextTick(); await flushPromises()
}

describe('useCardSearch CSR lifecycle', () => {
  beforeEach(() => {
    readyCallbacks.length = 0
    loadMock.mockReset().mockResolvedValue(getSourceCards())
  })
  afterEach(() => { for (const wrapper of wrappers.splice(0)) wrapper.unmount() })

  it('6キー×2方向、ページ復帰・件数保持・JSON追加取得0・API fallbackなし', async () => {
    const actual = await vi.importActual<typeof import('~~/app/utils/cardSearchDataset')>('~~/app/utils/cardSearchDataset')
    loadMock.mockImplementation(actual.loadCardSearchDataset)
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ version: 'test', generated_at: 'test', cards: getSourceCards().map(row => row.card) })))
    const api = vi.spyOn(globalThis, '$fetch')
    try {
      const { search } = setupSearch({ sort: 'atk', order: 'desc' })
      await becomeReady()
      expect(search.result.value?.sort).toEqual({ key: 'id', order: 'asc' })
      const settle = async () => { await nextTick(); await flushPromises() }
      for (const key of CARD_SEARCH_SORT_KEYS) for (const order of CARD_SEARCH_SORT_ORDERS) {
        search.sort.value = key; search.order.value = order
        await settle()
        expect(search.result.value?.sort).toEqual({ key, order })
        for (const perPage of CARD_SEARCH_PER_PAGE) {
          search.page.value = 2; await settle()
          search.perPage.value = perPage; await settle()
          // 同じ件数の再選択ではwatchが起動しない。
          if (search.page.value !== 1) { search.perPage.value = perPage === 20 ? 50 : 20; await settle(); search.perPage.value = perPage; await settle() }
          expect(search.page.value).toBe(1)
          expect(search.sort.value).toBe(key); expect(search.order.value).toBe(order)
          expect(search.result.value?.items.map(card => card.card_id)).toEqual(expectedIds(key, order).slice(0, perPage))
          search.page.value = 2; await settle()
          expect(search.result.value?.items.map(card => card.card_id)).toEqual(expectedIds(key, order).slice(perPage, perPage * 2))
          search.order.value = order === 'asc' ? 'desc' : 'asc'; await settle()
          expect(search.page.value).toBe(1); expect(search.perPage.value).toBe(perPage)
          search.page.value = 2; await settle()
          search.sort.value = key === 'id' ? 'level' : 'id'; await settle()
          expect(search.page.value).toBe(1); expect(search.perPage.value).toBe(perPage)
          search.sort.value = key; search.order.value = order; await settle()
        }
      }
      expect(fetch).toHaveBeenCalledExactlyOnceWith('/data/cards.json', { cache: 'no-cache' })
      expect(api).not.toHaveBeenCalled()
    } finally { fetch.mockRestore(); api.mockRestore() }
  })

  it('無効key/orderは有効な他方を維持して個別補正し、結果をstateへ反映する', async () => {
    const { search } = setupSearch()
    await becomeReady()
    search.sort.value = 'invalid' as CardSearchSortKey; search.order.value = 'desc'
    await nextTick(); await flushPromises()
    expect(search.result.value?.sort).toEqual({ key: 'id', order: 'desc' })
    expect(search.sort.value).toBe('id'); expect(search.order.value).toBe('desc')
    search.sort.value = 'defense'; search.order.value = 'invalid' as CardSearchSortOrder
    await nextTick(); await flushPromises()
    expect(search.result.value?.sort).toEqual({ key: 'defense', order: 'asc' })
    expect(search.sort.value).toBe('defense'); expect(search.order.value).toBe('asc')
  })

  it('server setupではデータ取得も検索も開始しない', async () => {
    let search!: ReturnType<typeof useCardSearch>
    await renderToString(createSSRApp(defineComponent({
      setup() { search = useCardSearch(ref({ kw: 'ダメージ' })); return () => h('div', search.status.value) },
    })))
    await flushPromises()
    expect(search.status.value).toBe('idle')
    expect(loadMock).not.toHaveBeenCalled()
  })
  it('ready後の最新queryだけで検索し、同内容通知を抑止する', async () => {
    const { query, search } = setupSearch()
    query.value = { kw: 'ダメージ' }
    await nextTick()
    expect(loadMock).not.toHaveBeenCalled()
    await becomeReady()
    expect(loadMock).toHaveBeenCalledTimes(1)
    expect(search.result.value?.totalCount).toBe(149)
    query.value = { kw: 'ダメージ' }
    await nextTick()
    expect(loadMock).toHaveBeenCalledTimes(1)
  })
  it('同内容key順違いは抑止し、A→B→Aと履歴復元は検索する', async () => {
    const { query, search } = setupSearch({ kw: 'ダメージ', att: '' })
    await becomeReady()
    const initial = structuredClone(JSON.parse(JSON.stringify(search.result.value)))
    query.value = { att: '', kw: 'ダメージ' }
    await nextTick()
    expect(loadMock).toHaveBeenCalledTimes(1)
    query.value = { kw: '存在しない検索語CSR' }
    await nextTick(); await flushPromises()
    expect(search.result.value?.totalCount).toBe(0)
    query.value = { kw: 'ダメージ', att: '' }
    await nextTick(); await flushPromises()
    expect(search.result.value).toEqual(initial)
    expect(loadMock).toHaveBeenCalledTimes(3)
  })
  it('queryなしも初回1回、page/sort/order/perPage変更と補正を維持する', async () => {
    const { search } = setupSearch()
    await becomeReady()
    expect(search.result.value?.totalCount).toBe(482)
    search.page.value = 2
    await nextTick(); await flushPromises()
    expect(search.page.value).toBe(2)
    search.sort.value = 'atk'; search.order.value = 'desc'; search.perPage.value = 50
    await nextTick(); await flushPromises()
    expect(search.page.value).toBe(1)
    expect(search.result.value?.sort).toEqual({ key: 'atk', order: 'desc' })
    expect(search.result.value?.items).toHaveLength(50)
    search.page.value = 99
    await nextTick(); await flushPromises()
    expect(search.page.value).toBe(10)
    expect(search.status.value).toBe('success')
    expect(loadMock).toHaveBeenCalledTimes(4)
    await search.retry()
    expect(search.page.value).toBe(10)
    expect(loadMock).toHaveBeenCalledTimes(5)
  })
  it('配列query/nullをtransportと同じ意味で扱う', async () => {
    const { query, search } = setupSearch({ kw: ['存在しない検索語CSR', 'ダメージ'], att: null })
    await becomeReady()
    expect(search.result.value?.totalCount).toBe(149)
    query.value = { att: null, kw: ['存在しない検索語CSR', 'ダメージ'] }
    await nextTick()
    expect(loadMock).toHaveBeenCalledTimes(1)
    query.value = { kw: ['ダメージ', '存在しない検索語CSR'], att: null }
    await nextTick(); await flushPromises()
    expect(search.result.value?.totalCount).toBe(0)
  })
  it.each(['success', 'error'])('古いloadの%sが最新結果を上書きしない', async outcome => {
    const old = deferred(), current = deferred()
    loadMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: '存在しない検索語CSR' })
    await becomeReady()
    query.value = { kw: 'ダメージ' }
    await nextTick()
    current.resolve(getSourceCards())
    await flushPromises()
    if (outcome === 'success') old.resolve(getSourceCards())
    else old.reject(new Error('old failure'))
    await flushPromises()
    expect(search.result.value?.totalCount).toBe(149)
    expect(search.status.value).toBe('success')
    expect(search.error.value).toBeUndefined()
  })
  it('最新errorは古い成功で上書きされない', async () => {
    const old = deferred(), current = deferred()
    const failure = new Error('latest failure')
    loadMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    query.value = { kw: 'アーニャ' }
    await nextTick()
    current.reject(failure); await flushPromises()
    old.resolve(getSourceCards()); await flushPromises()
    expect(search.result.value).toBeUndefined()
    expect(search.status.value).toBe('error')
    expect(search.error.value).toBe(failure)
  })
  it('共有load待機中の古いqueryは検索自体をskipする', async () => {
    const pending = deferred()
    loadMock.mockReturnValue(pending.promise)
    const { query, search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    query.value = { kw: '存在しない検索語CSR' }
    await nextTick()
    const read = vi.fn(() => getSourceCards()[0]!.card)
    pending.resolve([{ sourceIndex: 0, get card() { return read() } }])
    await flushPromises()
    expect(search.result.value?.totalCount).toBe(0)
    expect(read).toHaveBeenCalledTimes(1)
  })
  it('watch flush前にqueryが変わっても古い結果を反映しない', async () => {
    const old = deferred(), current = deferred()
    loadMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: 'アーニャ' })
    await becomeReady()
    old.resolve(getSourceCards()); query.value = { kw: 'ダメージ' }
    await nextTick()
    expect(search.result.value).toBeUndefined()
    current.resolve(getSourceCards()); await flushPromises()
    expect(search.result.value?.totalCount).toBe(149)
  })
  it('ready前に離脱した場合取得しない', async () => {
    const { wrapper, search } = setupSearch()
    wrapper.unmount(); await becomeReady()
    expect(loadMock).not.toHaveBeenCalled()
    expect(search.status.value).toBe('idle')
  })
  it.each(['success', 'error'])('離脱後loadの%sで検索/状態更新しない', async outcome => {
    const pending = deferred()
    loadMock.mockReturnValueOnce(pending.promise)
    const { wrapper, search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady(); wrapper.unmount()
    const read = vi.fn(() => getSourceCards()[0]!.card)
    if (outcome === 'success') pending.resolve([{ sourceIndex: 0, get card() { return read() } }])
    else pending.reject(new Error('unmounted failure'))
    await flushPromises()
    expect(read).not.toHaveBeenCalled()
    expect(search.result.value).toBeUndefined()
    expect(search.status.value).toBe('pending')
    await search.refresh()
    expect(loadMock).toHaveBeenCalledTimes(1)
  })
  it('retry/refreshは同条件でも再検索し、失敗後回復する', async () => {
    loadMock.mockRejectedValueOnce(new Error('failure'))
    const { search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    expect(search.status.value).toBe('error')
    await search.retry()
    expect(search.status.value).toBe('success')
    expect(search.result.value?.totalCount).toBe(149)
    await search.refresh()
    expect(loadMock).toHaveBeenCalledTimes(3)
  })
})
