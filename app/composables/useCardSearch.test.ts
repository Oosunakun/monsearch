import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { LocationQuery } from 'vue-router'
import type { SourceCard } from '~~/shared/cardSearch/types'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { useCardSearch } from './useCardSearch'

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
