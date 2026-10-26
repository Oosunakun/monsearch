import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { LocationQuery } from 'vue-router'
import type { CardSearchResultPage } from '~~/server/types/cardSearch'
import { useCardSearch } from './useCardSearch'

const { readyCallbacks, fetchMock } = vi.hoisted(() => ({
  readyCallbacks: [] as Array<() => void>, fetchMock: vi.fn(),
}))
mockNuxtImport('onNuxtReady', () => (callback: () => void) => { readyCallbacks.push(callback) })
mockNuxtImport('$fetch', () => fetchMock)

const response = (totalCount = 149, page = 1, perPage: 20 | 50 | 100 = 20): CardSearchResultPage => ({
  items: [], totalCount, page, perPage, totalPages: Math.max(1, Math.ceil(totalCount / perPage)),
  sort: { key: 'id', order: 'asc' }, categoryBreakdown: [],
})
const deferred = () => {
  let resolve!: (value: CardSearchResultPage) => void
  let reject!: (cause: Error) => void
  const promise = new Promise<CardSearchResultPage>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const wrappers: Array<ReturnType<typeof mount>> = []
const setupSearch = (initial: LocationQuery = {}) => {
  const query = ref<LocationQuery>(initial)
  let search!: ReturnType<typeof useCardSearch>
  const wrapper = mount(defineComponent({
    setup() { search = useCardSearch(query); return () => h('div') },
  }))
  wrappers.push(wrapper)
  return { query, search, wrapper }
}
const becomeReady = async () => {
  for (const callback of readyCallbacks.splice(0)) callback()
  await nextTick()
  await flushPromises()
}

describe('useCardSearchの取得lifecycle', () => {
  beforeEach(() => {
    readyCallbacks.length = 0
    fetchMock.mockReset().mockResolvedValue(response())
  })
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  })

  it('server setupではreadyを待たずHTMLを返しAPIを開始しない', async () => {
    let search!: ReturnType<typeof useCardSearch>
    await renderToString(createSSRApp(defineComponent({
      setup() { search = useCardSearch(ref({ kw: 'ダメージ' })); return () => h('div', search.status.value) },
    })))
    await flushPromises()
    expect(search.status.value).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('query復元前は0件、ready後の最新queryで1件だけ取得する', async () => {
    const { query, search } = setupSearch()
    query.value = { kw: 'ダメージ' }
    await nextTick()
    expect(fetchMock).not.toHaveBeenCalled()
    await becomeReady()
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/cards', {
      query: { kw: 'ダメージ', page: '1', perPage: '20', sort: 'id', order: 'asc' },
    })
    expect(search.result.value?.totalCount).toBe(149)
    query.value = { kw: 'ダメージ' }
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('同じ内容のkey順違いは抑止し、A→B→Aは再検索する', async () => {
    const { query } = setupSearch({ kw: 'A', att: 'ドラゴン' })
    await becomeReady()
    query.value = { att: 'ドラゴン', kw: 'A' }
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    query.value = { kw: 'B', att: 'ドラゴン' }
    await nextTick()
    query.value = { kw: 'A', att: 'ドラゴン' }
    await nextTick()
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls.map(call => call[1].query.kw)).toEqual(['A', 'B', 'A'])
  })

  it('queryなし初回もready後に1件だけ取得する', async () => {
    const { query } = setupSearch()
    await becomeReady()
    query.value = {}
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]![1].query).toEqual({ page: '1', perPage: '20', sort: 'id', order: 'asc' })
  })

  it('配列queryの値・順序・nullを保持する', async () => {
    const { query } = setupSearch({ att: ['ドラゴン', '火'], kw: null })
    await becomeReady()
    query.value = { kw: null, att: ['ドラゴン', '火'] }
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    query.value = { att: ['火', 'ドラゴン'], kw: null }
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]![1].query.att).toEqual(['火', 'ドラゴン'])
  })

  it('page変更と表示条件のpage resetを維持し、API補正では再取得しない', async () => {
    fetchMock.mockImplementation((_url, options) => Promise.resolve({
      ...response(149, Math.min(Number(options.query.page), Math.ceil(149 / Number(options.query.perPage))), Number(options.query.perPage) as 20 | 50 | 100),
      sort: { key: options.query.sort, order: options.query.order },
    }))
    const { search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    search.page.value = 2
    await nextTick(); await flushPromises()
    expect(search.page.value).toBe(2)
    search.sort.value = 'atk'; search.order.value = 'desc'; search.perPage.value = 50
    await nextTick(); await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2]![1].query).toMatchObject({ page: '1', perPage: '50', sort: 'atk', order: 'desc' })
    search.page.value = 99
    await nextTick(); await flushPromises()
    expect(search.page.value).toBe(3)
    expect(search.status.value).toBe('success')
    expect(fetchMock).toHaveBeenCalledTimes(4)
    await search.retry()
    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(fetchMock.mock.calls[4]![1].query.page).toBe('99')
    expect(search.page.value).toBe(3)
    expect(search.status.value).toBe('success')
  })

  it.each(['success', 'error'])('古い%sが最新応答を上書きしない', async outcome => {
    const old = deferred(), current = deferred()
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: 'A' })
    await becomeReady()
    query.value = { kw: 'B' }
    await nextTick()
    current.resolve(response(53))
    await flushPromises()
    if (outcome === 'success') old.resolve(response(482, 2, 50))
    else old.reject(new Error('old failure'))
    await flushPromises()
    expect(search.result.value?.totalCount).toBe(53)
    expect(search.page.value).toBe(1)
    expect(search.perPage.value).toBe(20)
    expect(search.status.value).toBe('success')
    expect(search.error.value).toBeUndefined()
  })

  it('最新の失敗状態も古い成功で上書きしない', async () => {
    const old = deferred(), current = deferred()
    const failure = new Error('latest failure')
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: 'A' })
    await becomeReady()
    query.value = { kw: 'B' }
    await nextTick()
    current.reject(failure)
    await flushPromises()
    old.resolve(response(482, 2, 50))
    await flushPromises()
    expect(search.result.value).toBeUndefined()
    expect(search.status.value).toBe('error')
    expect(search.error.value).toBe(failure)
    expect(search.page.value).toBe(1)
  })

  it('watch flush前にqueryが変わっても古い応答をcommitしない', async () => {
    const old = deferred(), current = deferred()
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const { query, search } = setupSearch({ kw: 'A' })
    await becomeReady()
    old.resolve(response(482))
    query.value = { kw: 'B' }
    await nextTick()
    expect(search.result.value).toBeUndefined()
    current.resolve(response(149))
    await flushPromises()
    expect(search.result.value?.totalCount).toBe(149)
  })

  it('ready前にunmountした場合、遅延callbackから取得しない', async () => {
    const { wrapper, search } = setupSearch({ kw: 'ダメージ' })
    wrapper.unmount()
    await becomeReady()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(search.status.value).toBe('idle')
  })

  it.each(['success', 'error'])('unmount後の%sで状態を更新しない', async outcome => {
    const pending = deferred()
    fetchMock.mockReturnValueOnce(pending.promise)
    const { wrapper, search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    wrapper.unmount()
    if (outcome === 'success') pending.resolve(response())
    else pending.reject(new Error('unmounted failure'))
    await flushPromises()
    expect(search.result.value).toBeUndefined()
    expect(search.status.value).toBe('pending')
    await search.refresh()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retryとrefreshは同条件でも明示的に再取得できる', async () => {
    fetchMock.mockRejectedValueOnce(new Error('current failure'))
    const { search } = setupSearch({ kw: 'ダメージ' })
    await becomeReady()
    expect(search.status.value).toBe('error')
    await search.retry()
    expect(search.status.value).toBe('success')
    await search.refresh()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[1]![1]).toEqual(fetchMock.mock.calls[0]![1])
  })
})
