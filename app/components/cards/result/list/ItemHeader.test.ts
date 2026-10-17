import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ItemHeader from './ItemHeader.vue'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { projectCard } from '~~/server/utils/cardSearch/project'

const card = () => projectCard(getSourceCards()[0]!.card)!
const global = {
  stubs: {
    ItemHeaderStat: true,
    VChip: { template: '<span class="v-chip"><slot /></span>' },
  },
}

describe('ItemHeaderの枚数制限Chip', () => {
  it.each([[0, '禁止'], [1, '1枚制限'], [2, '2枚制限']] as const)('%sを%sで表示する', (count, label) => {
    const source = { ...card(), deck_restriction_count: count }
    const wrapper = mount(ItemHeader, { props: { card: source }, global })
    expect(wrapper.find('.v-chip').text()).toBe(label)
    expect(wrapper.text()).toContain(source.name)
    wrapper.unmount()
  })

  it.each([3, 4, null])('%sではChipと代替文言を表示しない', count => {
    const source = { ...card(), deck_restriction_count: count }
    const wrapper = mount(ItemHeader, { props: { card: source }, global })
    expect(wrapper.find('.v-chip').exists()).toBe(false)
    expect(wrapper.text()).toContain(source.name)
    expect(wrapper.text()).not.toMatch(/禁止|枚制限|不明|無制限/)
    wrapper.unmount()
  })

  it('props更新でChipを変更・消去する', async () => {
    const source = card()
    const wrapper = mount(ItemHeader, { props: { card: { ...source, deck_restriction_count: 0 } }, global })
    expect(wrapper.find('.v-chip').text()).toBe('禁止')
    await wrapper.setProps({ card: { ...source, deck_restriction_count: 2 } })
    expect(wrapper.find('.v-chip').text()).toBe('2枚制限')
    await wrapper.setProps({ card: { ...source, deck_restriction_count: null } })
    expect(wrapper.find('.v-chip').exists()).toBe(false)
    wrapper.unmount()
  })
})
