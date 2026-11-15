import { mount, flushPromises } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { VSelect, VTextField } from 'vuetify/components'
import CardRulingList from './CardRulingList.vue'
import CardRulingExpansionItem from './CardRulingExpansionItem.vue'
import type { CardRulingItem } from '~~/app/types/ui/rules'

mockNuxtImport('useHydrated', () => () => ({ isMounted: ref(true) }))

const items: CardRulingItem[] = [
  { id: 'same', type: 'text_individual', post_date: '', source_name: 'source', cards: [{ name: 'Alpha' }], notice: '個別Alpha', change_text: 'individual text' },
  { id: 'same', type: 'errata', post_date: '', source_name: 'source', cards: [{ name: 'Beta' }], effective_date: '', revision_reason: '訂正Beta', errata_text: 'errata text' },
  { id: 'third', type: 'text_individual', post_date: '', source_name: 'source', cards: [{ name: 'Gamma' }], notice: '個別Gamma', change_text: 'other text' },
]

const wrappers: ReturnType<typeof mount>[] = []
const settle = async () => { await nextTick(); await flushPromises() }
const render = async () => {
  const wrapper = mount(CardRulingList, { props: { items: [...items] }, global: { plugins: [createVuetify({ components })] } })
  wrappers.push(wrapper)
  await settle()
  return wrapper
}
const selectType = async (wrapper: Awaited<ReturnType<typeof render>>, value: string) => {
  wrapper.findComponent(VSelect).vm.$emit('update:modelValue', value)
  await settle()
}
const keyword = async (wrapper: Awaited<ReturnType<typeof render>>, value: string | null) => {
  wrapper.findComponent(VTextField).vm.$emit('update:modelValue', value)
  await settle()
}
const displayed = (wrapper: Awaited<ReturnType<typeof render>>) => wrapper.findAllComponents(CardRulingExpansionItem).map(item => `${item.props('item').type}:${item.props('item').cards?.[0]?.name}`)

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.restoreAllMocks()
})

describe('カード裁定一覧の回帰', () => {
  it('同じIDの異なる種別を更新後も正しく表示し重複キー警告を出さない', async () => {
    const warn = vi.spyOn(console, 'warn')
    const wrapper = await render()
    expect(displayed(wrapper)).toEqual(['text_individual:Alpha', 'errata:Beta', 'text_individual:Gamma'])
    expect(wrapper.text()).toContain('個別Alpha')
    expect(wrapper.text()).toContain('訂正Beta')
    await wrapper.setProps({ items: [items[1]!, items[0]!, items[2]!] })
    await settle()
    expect(displayed(wrapper)).toEqual(['errata:Beta', 'text_individual:Alpha', 'text_individual:Gamma'])
    await selectType(wrapper, 'errata')
    expect(displayed(wrapper)).toEqual(['errata:Beta'])
    await selectType(wrapper, 'all')
    expect(displayed(wrapper)).toEqual(['errata:Beta', 'text_individual:Alpha', 'text_individual:Gamma'])
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/duplicate keys|duplicated keys/i)
  })

  it('キーワードのnullクリアで種別を維持して一覧へ戻る', async () => {
    const wrapper = await render()
    await selectType(wrapper, 'text_individual')
    await keyword(wrapper, 'Alpha')
    expect(displayed(wrapper)).toEqual(['text_individual:Alpha'])
    expect(wrapper.text()).toContain('1件 / 全3件')
    await keyword(wrapper, null)
    expect(displayed(wrapper)).toEqual(['text_individual:Alpha', 'text_individual:Gamma'])
    expect(wrapper.text()).toContain('2件 / 全3件')
    expect(wrapper.findComponent(VSelect).props('modelValue')).toBe('text_individual')
  })

  it('0件からクリア・種別変更・リセットで復帰する', async () => {
    const wrapper = await render()
    await keyword(wrapper, '存在しない語')
    expect(displayed(wrapper)).toEqual([])
    expect(wrapper.text()).toContain('該当するカード裁定がありません')
    expect(wrapper.text()).toContain('0件 / 全3件')
    await keyword(wrapper, null)
    expect(displayed(wrapper)).toHaveLength(3)
    await selectType(wrapper, 'errata')
    expect(displayed(wrapper)).toEqual(['errata:Beta'])
    const reset = wrapper.findAll('button').find(button => button.text().includes('リセット'))
    expect(reset).toBeDefined()
    await reset!.trigger('click')
    await settle()
    expect(displayed(wrapper)).toHaveLength(3)
    expect(wrapper.findComponent(VSelect).props('modelValue')).toBe('all')
    expect(wrapper.text()).toContain('3件 / 全3件')
  })
})
