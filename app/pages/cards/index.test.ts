import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import CardsPage from './index.vue'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { projectCard } from '~~/server/utils/cardSearch/project'
import type { CardSearchResultPage } from '~~/server/types/cardSearch'

const searchState = {
  page: ref(1), perPage: ref(20), sort: ref('id'), order: ref('asc'),
  result: ref<CardSearchResultPage>(), status: ref('success'), retry: vi.fn(),
}
vi.mock('vue-router', async importOriginal => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({ query: { nm: '同名検証カード' } }),
}))
mockNuxtImport('useCardSearch', () => () => searchState)
vi.mock('vuetify', () => ({ useDisplay: () => ({ mobile: ref(false) }) }))

const mountPage = () => mount(CardsPage, { global: { stubs: {
  ContentMaxWidthContainer: { template: '<div><slot /></div>' },
  SectionCardShell: { template: '<div><slot name="header" /><slot /></div>' },
  SectionHeader: true, ResultControls: true, ResultSummary: true,
  ResultDisplaySettings: true, ItemHeaderStat: true, ItemBody: true,
  ItemEffect: true, ItemMeta: true, CardTextureBackground: true,
  SkeletonLoader: { template: '<div class="loading">loading</div>' },
  ErrorState: { template: '<div class="error"><slot name="actions" /></div>' },
  VEmptyState: { props: ['title'], template: '<div>{{ title }}</div>' },
  VChip: { template: '<span class="v-chip"><slot /></span>' },
  VPagination: true, VDivider: true, VBtn: { template: '<button><slot /></button>' },
} } })

describe('cards result pageの描画', () => {
  beforeEach(() => {
    searchState.status.value = 'success'
    const card = projectCard(getSourceCards()[0]!.card)!
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
