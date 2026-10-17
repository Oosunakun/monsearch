import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ItemHeaderName from './ItemHeaderName.vue'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { projectCard } from '~~/server/utils/cardSearch/project'

const card = () => projectCard(getSourceCards()[0]!.card)!

describe('ItemHeaderNameの枚数制限ラベル', () => {
  it.each([[0, '禁止'], [1, '1枚制限'], [2, '2枚制限']] as const)('%sを%sで表示する', (count, label) => {
    const source = { ...card(), deck_restriction_count: count }
    const wrapper = mount(ItemHeaderName, { props: { card: source } })
    expect(wrapper.find('.restriction-label-box').text()).toBe(label)
    expect(wrapper.text()).toContain(source.name)
    wrapper.unmount()
  })

  it.each([3, 4, null])('%sでは制限ラベルと代替文言を表示しない', count => {
    const source = { ...card(), deck_restriction_count: count }
    const wrapper = mount(ItemHeaderName, { props: { card: source } })
    expect(wrapper.find('.restriction-label-box').exists()).toBe(false)
    expect(wrapper.text()).toContain(source.name)
    expect(wrapper.text()).not.toMatch(/禁止|枚制限|不明|無制限/)
    wrapper.unmount()
  })

  it('props更新で制限ラベルを変更・消去する', async () => {
    const source = card()
    const wrapper = mount(ItemHeaderName, { props: { card: { ...source, deck_restriction_count: 0 } } })
    expect(wrapper.find('.restriction-label-box').text()).toBe('禁止')
    await wrapper.setProps({ card: { ...source, deck_restriction_count: 2 } })
    expect(wrapper.find('.restriction-label-box').text()).toBe('2枚制限')
    await wrapper.setProps({ card: { ...source, deck_restriction_count: null } })
    expect(wrapper.find('.restriction-label-box').exists()).toBe(false)
    wrapper.unmount()
  })

  it.each([
    [0, 'bg-red-accent-4'],
    [1, 'bg-yellow-darken-4'],
    [2, 'bg-yellow-darken-4'],
  ] as const)('%sの背景色が%sになる', (count, bgClass) => {
    const source = { ...card(), deck_restriction_count: count }
    const wrapper = mount(ItemHeaderName, { props: { card: source } })
    expect(wrapper.find('.restriction-label-box').classes()).toContain(bgClass)
    wrapper.unmount()
  })
})