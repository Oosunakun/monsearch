import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import ResultList from './ResultList.vue'
import ResultItem from './ResultItem.vue'
import { historicalSources as getSourceCards } from '~~/tests/fixtures/cardSearch/sources'
import { displayCard } from '~~/tests/fixtures/cardSearch/cards'
import { useCardSearch } from '~~/app/composables/useCardSearch'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS } from '~~/shared/cardSearch/types'
import type { CardSearchSortKey, CardSearchSortOrder } from '~~/shared/cardSearch/types'
import { expectedIds } from '~~/specs/015-search-result-sorting/verification/sort-expectations'
import { LAYOUT_HEADER } from '~~/app/types/ui/layout'

const mobile = ref(false)
vi.mock('vuetify', async importOriginal => ({ ...await importOriginal<typeof import('vuetify')>(), useDisplay: () => ({ mobile }) }))
const { callbacks } = vi.hoisted(() => ({ callbacks: [] as Array<() => void> }))
mockNuxtImport('onNuxtReady', () => (callback: () => void) => { callbacks.push(callback) })
vi.mock('~~/app/utils/cardSearchDataset', () => ({ loadCardSearchDataset: async () => getSourceCards() }))

const settle = async () => { await nextTick(); await flushPromises() }
const titles = ['カードNo', 'レベル', '攻撃力', '防御力', 'イニシアチブ', '出現頻度']
const clickText = async (selector: string, text: string) => {
  const find = () => [...document.querySelectorAll<HTMLElement>(selector)].find(node => node.textContent?.replace(/mdi-[\w-]+/g, '').trim() === text)
  await vi.waitFor(() => expect(find(), `${selector}: ${text}; candidates=${[...document.querySelectorAll(selector)].map(node => node.textContent?.trim()).join('|')}`).toBeDefined(), { timeout: 2000, interval: 20 })
  const node = find()
  node!.click()
  await settle()
}

describe('P4-08 ページ送りのスクロール要求', () => {
  const mountList = () => mount(ResultList, {
    props: { cards: [], totalCount: 60, currentPage: 1, totalPages: 3 },
    global: { plugins: [createVuetify({ components })], stubs: { ResultDisplaySettings: true } },
  })

  it.each([false, true])('mobile=%sで前後操作・PCの番号選択は各1回通知し、端の操作は無効になる', async isMobile => {
    mobile.value = isMobile
    const wrapper = mountList()
    const button = (direction: 'prev' | 'next') => isMobile
      ? wrapper.findAll('button').find(node => node.text() === (direction === 'prev' ? '前へ' : '次へ'))!
      : wrapper.get(`.v-pagination__${direction} button`)
    try {
      expect(button('prev').attributes('disabled')).toBeDefined()
      await button('prev').trigger('click')
      expect(wrapper.emitted('pageScrollRequest')).toBeUndefined()
      await button('next').trigger('click')
      expect(wrapper.emitted('update:currentPage')?.at(-1)).toEqual([2])
      expect(wrapper.emitted('pageScrollRequest')).toEqual([[2]])
      await wrapper.setProps({ currentPage: 2 })
      await button('prev').trigger('click')
      expect(wrapper.emitted('pageScrollRequest')).toEqual([[2], [1]])
      await wrapper.setProps({ currentPage: 3 })
      expect(button('next').attributes('disabled')).toBeDefined()
      await button('next').trigger('click')
      expect(wrapper.emitted('pageScrollRequest')).toHaveLength(2)
      if (!isMobile) {
        await wrapper.get('button[aria-label="Go to page 2"]').trigger('click')
        expect(wrapper.emitted('update:currentPage')?.at(-1)).toEqual([2])
        expect(wrapper.emitted('pageScrollRequest')).toEqual([[2], [1], [2]])
        await wrapper.setProps({ currentPage: 2 })
        await wrapper.get('.v-pagination__item--is-active button').trigger('click')
        expect(wrapper.emitted('pageScrollRequest')).toHaveLength(3)
      }
    } finally { wrapper.unmount() }
  })

  it('同じページ・範囲外・整数以外のページでは更新も要求も通知しない', async () => {
    mobile.value = false
    const wrapper = mountList()
    try {
      const pagination = wrapper.getComponent(components.VPagination)
      for (const page of [1, 0, -1, 4, 1.5, NaN, Infinity]) {
        pagination.vm.$emit('update:modelValue', page)
        await nextTick()
      }
      expect(wrapper.emitted('update:currentPage')).toBeUndefined()
      expect(wrapper.emitted('pageScrollRequest')).toBeUndefined()
    } finally { wrapper.unmount() }
  })

  it('既存のヘッダー補正・余白・負座標補正を維持する', () => {
    mobile.value = false
    const wrapper = mountList()
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const position = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500)
    const rect = vi.spyOn(wrapper.get('.result-list-panel').element, 'getBoundingClientRect')
      .mockReturnValue({ top: 120 } as DOMRect)
    try {
      wrapper.vm.scrollToTop()
      expect(scroll).toHaveBeenLastCalledWith({ top: 120 + 500 - LAYOUT_HEADER.HEIGHT - 10, behavior: 'smooth' })
      position.mockReturnValue(0)
      rect.mockReturnValue({ top: 0 } as DOMRect)
      wrapper.vm.scrollToTop()
      expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
    } finally { wrapper.unmount(); scroll.mockRestore(); position.mockRestore(); rect.mockRestore() }
  })
})

describe('015 PC/モバイル実controlsとCSR結果の統合', () => {
  // happy-domにないブラウザーAPIを補い、Vuetifyのoverlay自体は実物を使う。
  beforeAll(() => vi.stubGlobal('visualViewport', Object.assign(new EventTarget(), {
    width: 1280, height: 900, offsetTop: 0, offsetLeft: 0, pageTop: 0, pageLeft: 0, scale: 1,
  })))
  afterAll(() => vi.unstubAllGlobals())
  it.each([false, true])('mobile=%sで6項目・両方向・ページ・件数・補正表示を操作する', async isMobile => {
    mobile.value = isMobile
    let search!: ReturnType<typeof useCardSearch>
    const wrapper = mount(defineComponent({
      setup() {
        search = useCardSearch(ref({}))
        return () => h(ResultList, {
          cards: search.result.value?.items ?? [], totalCount: search.result.value?.totalCount ?? 0,
          currentPage: search.page.value, totalPages: search.result.value?.totalPages ?? 1,
          sortItem: search.sort.value, sortOrder: search.order.value, limitPerPage: search.perPage.value,
          'onUpdate:currentPage': value => { search.page.value = value },
          'onUpdate:sortItem': value => { search.sort.value = value as CardSearchSortKey },
          'onUpdate:sortOrder': value => { search.order.value = value as CardSearchSortOrder },
          'onUpdate:limitPerPage': value => { search.perPage.value = value as 20 | 50 | 100 },
        })
      },
    }), {
      attachTo: document.body,
      global: { plugins: [createVuetify({ components })], stubs: { ResultItem: true } },
    })
    const open = async () => {
      // Vuetify useActivatorの50ms reopenLockを待ってから再操作する。
      await new Promise(resolve => setTimeout(resolve, 60))
      if (isMobile) await clickText('button', '表示条件')
      else await clickText('button', titles[CARD_SEARCH_SORT_KEYS.indexOf(search.sort.value)]!)
      await vi.waitFor(() => {
        if (isMobile) {
          const selections = [...document.querySelectorAll('.v-bottom-sheet .v-select__selection')].map(node => node.textContent?.replace(/mdi-[\w-]+/g, '').trim())
          expect(selections).toContain(titles[CARD_SEARCH_SORT_KEYS.indexOf(search.sort.value)])
          expect(selections).toContain(search.order.value === 'asc' ? '昇順' : '降順')
        } else {
          const selections = [...document.querySelectorAll('.v-overlay--active .selected-item')].map(node => node.textContent?.replace(/mdi-[\w-]+/g, '').trim())
          expect(selections).toContain(titles[CARD_SEARCH_SORT_KEYS.indexOf(search.sort.value)])
          expect(selections).toContain(search.order.value === 'asc' ? '昇順' : '降順')
        }
      })
    }
    const choose = async (index: number, title: string) => {
      if (isMobile) {
        const selects = document.querySelectorAll<HTMLElement>('.v-bottom-sheet .v-select .v-field')
        expect(selects.length).toBe(3)
        selects[index]!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true })); await settle()
      }
      await clickText('.v-overlay--active .v-list-item-title', title)
    }
    const apply = async () => { if (isMobile) await clickText('button', '適用') }
    const nextPage = async () => {
      if (isMobile) await clickText('button', '次へ')
      else {
        const button = wrapper.find('button[aria-label="Go to page 2"]')
        expect(button.exists()).toBe(true)
        await button.trigger('click'); await settle()
      }
      expect(search.page.value).toBe(2)
    }
    const check = () => {
      const key = search.sort.value, order = search.order.value, perPage = search.perPage.value, page = search.page.value
      expect(search.result.value?.items.map(card => card.card_id)).toEqual(expectedIds(key, order).slice((page - 1) * perPage, page * perPage))
      expect(wrapper.text()).toContain(`${(page - 1) * perPage + 1} ～ ${Math.min(page * perPage, 482)} 件を表示`)
    }
    try {
      for (const callback of callbacks.splice(0)) callback()
      await settle()
      expect(search.result.value?.sort).toEqual({ key: 'id', order: 'asc' })
      for (const [index, key] of CARD_SEARCH_SORT_KEYS.entries()) {
        await open()
        if (isMobile) {
          document.querySelector<HTMLElement>('.v-bottom-sheet .v-select .v-field')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true })); await settle()
        }
        const options = [...document.querySelectorAll('.v-overlay--active .v-list-item-title')].map(node => node.textContent?.trim()).filter(text => titles.includes(text!))
        expect(options).toEqual(titles)
        await clickText('.v-overlay--active .v-list-item-title', titles[index]!)
        await apply()
        expect(search.sort.value).toBe(key)
        expect(search.page.value).toBe(1)
        for (const order of CARD_SEARCH_SORT_ORDERS) {
          await open(); await choose(1, order === 'asc' ? '昇順' : '降順'); await apply()
          expect(search.order.value).toBe(order)
          check()
          await nextPage(); check()
          await open(); await choose(1, order === 'asc' ? '降順' : '昇順'); await apply()
          expect(search.page.value).toBe(1); expect(search.perPage.value).toBe(20)
          check()
        }
        // 2ページ目から別項目へ変更する操作は次のループで行う。
        await nextPage()
      }
      for (const perPage of [50, 100, 20] as const) {
        if (search.page.value !== 2) await nextPage()
        if (isMobile) { await open(); await choose(2, `${perPage}件表示`); await apply() }
        else { await new Promise(resolve => setTimeout(resolve, 60)); await clickText('button', `${search.perPage.value}件`); await clickText('.v-overlay--active .v-list-item-title', `${perPage}件`) }
        expect(search.page.value).toBe(1)
        expect(search.sort.value).toBe('rarity'); expect(search.order.value).toBe('asc')
        check()
      }
      search.sort.value = 'invalid' as CardSearchSortKey; search.order.value = 'desc'; await settle()
      expect(search.sort.value).toBe('id'); expect(search.order.value).toBe('desc')
      await open()
      if (isMobile) expect(document.querySelector('.v-bottom-sheet .v-select')?.textContent).toContain('カードNo')
      else expect(document.querySelector('.v-overlay--active .selected-item')?.textContent).toContain('カードNo')
      if (isMobile) await apply()
      else await choose(0, 'カードNo')
      search.sort.value = 'defense'; search.order.value = 'invalid' as CardSearchSortOrder; await settle()
      expect(search.sort.value).toBe('defense'); expect(search.order.value).toBe('asc')
      await open() // 補正後の項目と方向の選択表示も実controlsで照合する。
    } finally { wrapper.unmount(); await settle() }
  }, 60000)
})

describe('ResultListのカードとChipの対応', () => {
  it.each([false, true])('PC/モバイル=%sで順序・ページ相当の差替えに追従する', async isMobile => {
    mobile.value = isMobile
    const source = displayCard()
    const cards = [0, 1, 2, null].map((count, index) => ({
      ...source, card_id: `card-${index}`, name: '同名検証カード', deck_restriction_count: count,
    }))
    const wrapper = mount(ResultList, {
      props: { cards, totalCount: 4, currentPage: 1, totalPages: 2 },
      global: { stubs: {
        ResultDisplaySettings: true, ItemHeaderStat: true, ItemBody: true,
        ItemEffect: true, ItemMeta: true, CardTextureBackground: true,
        VChip: { template: '<span class="v-chip"><slot /></span>' },
        VPagination: true, VDivider: true, VBtn: { template: '<button><slot /></button>' },
      } },
    })
    const check = (expected: typeof cards) => {
      const items = wrapper.findAllComponents(ResultItem)
      expect(items).toHaveLength(expected.length)
      items.forEach((item, index) => {
        const card = expected[index]!
        expect(item.props('card').card_id).toBe(card.card_id)
        expect(item.text()).toContain(card.name)
        const chip = item.find('.restriction-label-box')
        if (card.deck_restriction_count === null) expect(chip.exists()).toBe(false)
        else expect(chip.text()).toBe(card.deck_restriction_count === 0 ? '禁止' : `${card.deck_restriction_count}枚制限`)
      })
    }
    check(cards)
    const reversed = [...cards].reverse()
    await wrapper.setProps({ cards: reversed })
    check(reversed)
    const nextPage = [cards[3]!, cards[0]!]
    await wrapper.setProps({ cards: nextPage })
    check(nextPage)
    wrapper.unmount()
  })
})
