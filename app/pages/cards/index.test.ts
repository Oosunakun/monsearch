import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick, reactive } from 'vue'
import type { LocationQuery } from 'vue-router'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import CardsPage from './index.vue'
import ResultControls from '~~/app/components/cards/result/controls/ResultControls.vue'
import ResultList from '~~/app/components/cards/result/layout/ResultList.vue'
import { displayCard } from '~~/tests/fixtures/cardSearch/cards'
import type { CardSearchResultPage } from '~~/server/types/cardSearch'

const analytics = vi.hoisted(() => ({ submit: vi.fn(), finishSubmit: vi.fn(), results: vi.fn() }))
const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn() }))
vi.mock('~~/app/composables/useAnalytics', () => ({ useAnalytics: () => analytics }))

const searchState = {
  page: ref(1), perPage: ref(20), sort: ref('id'), order: ref('asc'),
  result: ref<CardSearchResultPage>(), status: ref('success'), retry: vi.fn(),
}
const routeState = reactive({ fullPath: '/cards?nm=initial', query: { nm: '同名検証カード' } as LocationQuery })
vi.mock('vue-router', async importOriginal => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => routeState,
}))
mockNuxtImport('useCardSearch', () => () => searchState)
mockNuxtImport('navigateTo', () => navigateTo)
vi.mock('vuetify', () => ({ useDisplay: () => ({ mobile: ref(false) }) }))

const mountPage = (stubResultControls = true) => mount(CardsPage, { global: { stubs: {
  ContentMaxWidthContainer: { template: '<div><slot /></div>' },
  SectionCardShell: { template: '<div><slot name="header" /><slot /></div>' },
  SectionHeader: true, ResultControls: stubResultControls, ResultSummary: true,
  ResultDisplaySettings: true, ItemHeaderStat: true, ItemBody: true,
  ItemEffect: true, ItemMeta: true, CardTextureBackground: true,
  SkeletonLoader: { template: '<div class="loading">loading</div>' },
  ErrorState: { template: '<div class="error"><slot name="actions" /></div>' },
  VEmptyState: { props: ['title'], template: '<div>{{ title }}</div>' },
  VChip: { template: '<span class="v-chip"><slot /></span>' },
  VPagination: true, VDivider: true, VBtn: { template: '<button><slot /></button>' },
} } })

it('「条件を編集」で種族・タイプと他の検索条件を詳細検索へ渡す', async () => {
  const originalQuery = routeState.query
  const query = { att: 'ドラゴン', cc: 'unit', kw: '飛行' }
  routeState.query = query
  navigateTo.mockClear()
  const wrapper = mountPage(false)

  try {
    const button = wrapper.getComponent(ResultControls).get('button')
    expect(button.text()).toBe('条件を編集')
    await button.trigger('click')

    expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ path: '/cards/search', query })
  } finally {
    wrapper.unmount()
    routeState.query = originalQuery
  }
})

it.each<LocationQuery>([{ it: 'gte:2', nm: '保持する条件' }, { he: 'eq:0', nm: '保持する条件' }])(
  '「条件を編集」でComparison単独のQueryをそのまま渡す (%j)',
  async (query) => {
    const originalQuery = routeState.query
    routeState.query = query
    navigateTo.mockClear()
    const wrapper = mountPage(false)
    try {
      await wrapper.getComponent(ResultControls).get('button').trigger('click')
      expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ path: '/cards/search', query })
    } finally {
      wrapper.unmount()
      routeState.query = originalQuery
    }
  },
)

describe('cards result pageの描画', () => {
  beforeEach(() => {
    searchState.status.value = 'success'
    const card = displayCard()
    searchState.result.value = {
      items: [{ ...card, deck_restriction_count: 0 }], totalCount: 1, page: 1,
      perPage: 20, totalPages: 1, sort: { key: 'id', order: 'asc' }, categoryBreakdown: [],
    }
    searchState.retry.mockClear()
  })

  it('結果更新で実カードとChipを更新し、0件では空表示に切り替える', async () => {
    const wrapper = mountPage()
    expect(wrapper.find('.card-search-result-item').exists()).toBe(true)
    expect(wrapper.find('.restriction-label-box').text()).toBe('禁止')
    const card = searchState.result.value!.items[0]!
    searchState.result.value!.items = [{ ...card, card_id: 'next-card', name: '更新カード', deck_restriction_count: 1 }]
    await nextTick()
    expect(wrapper.text()).toContain('更新カード')
    expect(wrapper.find('.restriction-label-box').text()).toBe('1枚制限')
    searchState.result.value = { ...searchState.result.value!, items: [], totalCount: 0, totalPages: 1 }
    await nextTick()
    expect(wrapper.text()).toContain('該当するカードはありません')
    expect(wrapper.find('.card-search-result-item').exists()).toBe(false)
    expect(wrapper.find('.restriction-label-box').exists()).toBe(false)
    wrapper.unmount()
  })

  it('loadingとerrorでは結果を表示せず再試行を維持する', async () => {
    searchState.status.value = 'pending'
    const wrapper = mountPage()
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.card-search-result-item').exists()).toBe(false)
    searchState.status.value = 'error'
    await nextTick()
    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.loading').exists()).toBe(false)
    await wrapper.find('button').trigger('click')
    expect(searchState.retry).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})

describe('P4-08 ページ送り後のスクロール', () => {
  beforeEach(() => {
    searchState.page.value = 1
    searchState.perPage.value = 20
    searchState.sort.value = 'id'
    searchState.order.value = 'asc'
    searchState.status.value = 'success'
    routeState.query = { nm: '同名検証カード' }
    searchState.result.value = {
      items: [{ ...displayCard(), deck_restriction_count: null }], totalCount: 60,
      page: 1, perPage: 20, totalPages: 3, sort: { key: 'id', order: 'asc' }, categoryBreakdown: [],
    }
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  const request = (wrapper: ReturnType<typeof mountPage>, page: number) => {
    const list = wrapper.getComponent(ResultList)
    list.vm.$emit('update:currentPage', page)
    list.vm.$emit('pageScrollRequest', page)
  }
  const complete = async (page: number) => {
    searchState.result.value = { ...searchState.result.value!, page }
    await nextTick()
    expect(window.scrollTo).not.toHaveBeenCalled()
    searchState.status.value = 'success'
    await nextTick()
  }

  it('pending中は移動せず、successで一覧が戻ってから1回移動する', async () => {
    const wrapper = mountPage()
    try {
      expect(window.scrollTo).not.toHaveBeenCalled()
      request(wrapper, 2)
      searchState.status.value = 'pending'
      await nextTick()
      expect(wrapper.findComponent(ResultList).exists()).toBe(false)
      expect(window.scrollTo).not.toHaveBeenCalled()
      await complete(2)
      expect(wrapper.findComponent(ResultList).exists()).toBe(true)
      expect(window.scrollTo).toHaveBeenCalledOnce()
      searchState.result.value = { ...searchState.result.value! }
      await nextTick()
      expect(window.scrollTo).toHaveBeenCalledOnce()
    } finally { wrapper.unmount() }
  })

  it('連続操作は最新の要求だけを処理する', async () => {
    const wrapper = mountPage()
    try {
      request(wrapper, 2)
      request(wrapper, 3)
      searchState.status.value = 'pending'
      await nextTick()
      await complete(2)
      expect(window.scrollTo).not.toHaveBeenCalled()
      searchState.result.value = { ...searchState.result.value!, page: 3 }
      await nextTick()
      expect(window.scrollTo).toHaveBeenCalledOnce()
    } finally { wrapper.unmount() }
  })

  it.each(['query', 'sort', 'order', 'perPage', 'directPage', 'error', 'empty', 'unmount'])('%sで古い要求を破棄する', async change => {
    const wrapper = mountPage()
    try {
      request(wrapper, 2)
      searchState.status.value = 'pending'
      await nextTick()
      if (change === 'query') routeState.query = { kw: '変更条件' }
      if (change === 'sort') searchState.sort.value = 'atk'
      if (change === 'order') searchState.order.value = 'desc'
      if (change === 'perPage') searchState.perPage.value = 50
      if (change === 'directPage') { searchState.page.value = 3; searchState.page.value = 2 }
      if (change === 'error') searchState.status.value = 'error'
      if (change === 'unmount') wrapper.unmount()
      if (change === 'empty') {
        searchState.result.value = { ...searchState.result.value!, items: [], totalCount: 0, page: 2 }
        searchState.status.value = 'success'
        await nextTick()
      }
      await complete(2)
      expect(window.scrollTo).not.toHaveBeenCalled()
    } finally { if (change !== 'unmount') wrapper.unmount() }
  })

  it('スクロール要求のないページ更新や条件変更では移動しない', async () => {
    const wrapper = mountPage()
    try {
      wrapper.getComponent(ResultList).vm.$emit('update:currentPage', 2)
      searchState.status.value = 'pending'
      await nextTick()
      await complete(2)
      searchState.sort.value = 'atk'
      searchState.page.value = 1
      searchState.status.value = 'pending'
      await nextTick()
      await complete(1)
      expect(window.scrollTo).not.toHaveBeenCalled()
    } finally { wrapper.unmount() }
  })
})

describe('cards result page', () => {
  const source = readFileSync(resolve('app/pages/cards/index.vue'), 'utf8')
  it('API responseだけで結果を描画する', () => {
    expect(source).toContain('useCardSearch(routeQuery)')
    expect(source).toContain(':cards="result.items"')
    expect(source).not.toContain('mockFinderCards')
    expect(source).not.toContain('cards.json')
  })
  it('loading・empty・error・successを相互排他的に表示する', () => {
    expect(source).toContain("status === 'idle' || status === 'pending'")
    expect(source).toContain("status === 'error'")
    expect(source).toContain('result.totalCount === 0')
    expect(source).toContain('@click="retry"')
  })
})


describe('結果確定とAnalyticsの接点', () => {
  beforeEach(() => {
    analytics.results.mockClear()
    routeState.fullPath = '/cards?nm=A'
    routeState.query = { nm: 'A' }
    searchState.status.value = 'pending'
    searchState.result.value = {
      items: [], totalCount: 0, page: 1, perPage: 20, totalPages: 1,
      sort: { key: 'id', order: 'asc' }, categoryBreakdown: [],
    }
  })
  it('残存result・errorを送らず、retry成功で現在条件と全件数を通知する', async () => {
    const wrapper = mountPage()
    expect(analytics.results).not.toHaveBeenCalled()
    searchState.status.value = 'error'; await nextTick()
    expect(analytics.results).not.toHaveBeenCalled()
    routeState.fullPath = '/cards?nm=B'; routeState.query = { nm: 'B' }
    searchState.status.value = 'pending'; await nextTick()
    searchState.result.value = { ...searchState.result.value!, totalCount: 42 }
    await nextTick()
    expect(analytics.results).not.toHaveBeenCalled()
    searchState.status.value = 'success'; await nextTick()
    expect(analytics.results).toHaveBeenCalledExactlyOnceWith('/cards?nm=B', 42)
    wrapper.unmount()
  })
  it('条件が変わった古いpendingのsuccessは送らない', async () => {
    const wrapper = mountPage()
    routeState.fullPath = '/cards?nm=B'; routeState.query = { nm: 'B' }
    searchState.status.value = 'success'; await nextTick()
    expect(analytics.results).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
