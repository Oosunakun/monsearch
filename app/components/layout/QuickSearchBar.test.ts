import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useQuickSearch } from '~~/app/composables/useQuickSearch'
import QuickSearchBar from './QuickSearchBar.vue'

const analytics = vi.hoisted(() => ({ submit: vi.fn(() => 1), finishSubmit: vi.fn() }))
vi.mock('~~/app/composables/useAnalytics', () => ({ useAnalytics: () => analytics }))

const push = vi.fn(async () => undefined)
const ancestorKeydown = vi.fn()
const wrappers: Array<Awaited<ReturnType<typeof mountSuspended>>> = []

async function mountQuickSearch(layout: 'horizontal' | 'vertical') {
  const host = defineComponent({
    setup() {
      const { quickSearchState, cardPools, searchTypes, runQuickSearch } = useQuickSearch({ push })
      return () => h('div', { onKeydown: ancestorKeydown }, [
        h(QuickSearchBar, {
          layout,
          modelValue: quickSearchState.value,
          cardPools,
          searchTypes,
          'onUpdate:modelValue': value => { quickSearchState.value = value },
          onSubmit: runQuickSearch,
        }),
      ])
    },
  })
  const wrapper = await mountSuspended(host, { global: { stubs: { VMenu: true } } })
  wrappers.push(wrapper)
  return wrapper
}

function enter(target: Element, init: KeyboardEventInit = {}, keyCode?: number) {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init })
  if (keyCode !== undefined) Object.defineProperty(event, 'keyCode', { value: keyCode })
  target.dispatchEvent(event)
  return event
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
})

describe('QuickSearchBar keyboard submission', () => {
  it.each(['horizontal', 'vertical'] as const)('submits confirmed input once in the %s layout', async layout => {
    const wrapper = await mountQuickSearch(layout)
    const input = wrapper.get('input[placeholder="簡易検索..."]')
    await input.setValue('へんかん')

    const composing = enter(input.element, { isComposing: true })
    const imeKey = enter(input.element, { isComposing: false }, 229)
    const repeated = enter(input.element, { repeat: true })
    expect(composing.defaultPrevented).toBe(false)
    expect(imeKey.defaultPrevented).toBe(false)
    expect(repeated.defaultPrevented).toBe(false)
    expect(ancestorKeydown.mock.calls.map(([event]) => event)).toEqual([composing, imeKey, repeated])
    expect(push).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()

    await input.setValue('  変換済み  ')
    const confirmed = enter(input.element)
    await nextTick()

    expect(confirmed.defaultPrevented).toBe(true)
    expect(ancestorKeydown).toHaveBeenCalledTimes(3)
    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query: { nm: '変換済み' } })
    expect(analytics.submit).toHaveBeenCalledExactlyOnceWith('quick', { nm: '変換済み' })
    expect(analytics.finishSubmit).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('respects an Enter already canceled by the input', async () => {
    const wrapper = await mountQuickSearch('horizontal')
    const input = wrapper.get('input[placeholder="簡易検索..."]')
    input.element.addEventListener('keydown', event => event.preventDefault(), { once: true })

    const event = enter(input.element)

    expect(ancestorKeydown).toHaveBeenCalledExactlyOnceWith(event)
    expect(push).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()
  })

  it('leaves the nested select and search button to handle their own Enter', async () => {
    const wrapper = await mountQuickSearch('horizontal')
    const select = wrapper.get('.search-type-select input')
    const searchButton = wrapper.get('.v-field__append-inner button')
    await wrapper.get('input[placeholder="簡易検索..."]').setValue('ドラゴン')

    enter(select.element)
    const buttonKey = enter(searchButton.element)
    expect(buttonKey.defaultPrevented).toBe(false)
    expect(push).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()

    await searchButton.trigger('click')

    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query: { nm: 'ドラゴン' } })
    expect(analytics.submit).toHaveBeenCalledExactlyOnceWith('quick', { nm: 'ドラゴン' })
    expect(analytics.finishSubmit).toHaveBeenCalledExactlyOnceWith(1)
  })
})
