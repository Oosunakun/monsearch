import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import ExternalLinkCard from './ExternalLinkCard.vue'
import { mockAboutContactItems } from '~~/app/utils/mockData/about'
import { mockAboutLinkItems } from '~~/app/utils/mockData/links'

const mountCard = (props: { title: string; subtitle: string; href: string; icon?: string; iconSrc?: string; iconSize?: number }) => mount(ExternalLinkCard, {
  props,
  global: { stubs: {
    VCard: defineComponent({ template: '<a><slot /></a>' }),
    VIcon: defineComponent({ props: ['icon'], template: '<span :data-icon="icon" />' }),
  } },
})

describe('ExternalLinkCard', () => {
  it.each(mockAboutContactItems)('公式画像と既存リンク・文字ラベルを保持する: $title', item => {
    const wrapper = mountCard(item)
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe(item.href)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain(item.title)
    expect(link.text()).toContain(item.subtitle)
    expect(wrapper.get('img').attributes('src')).toBe(item.iconSrc)
    expect(wrapper.get('img').attributes('alt')).toBe('')
    expect(wrapper.get('.brand-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('[data-icon]').map(icon => icon.attributes('data-icon'))).toEqual(['mdi-open-in-new'])
    wrapper.unmount()
  })

  it.each(mockAboutLinkItems)('Linksの通常MDIとリンクを保持する: $title', item => {
    const wrapper = mountCard(item)
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('a').attributes('href')).toBe(item.href)
    expect(wrapper.findAll('[data-icon]').map(icon => icon.attributes('data-icon'))).toEqual([item.icon, 'mdi-open-in-new'])
    wrapper.unmount()
  })

  it('アイコン未指定時は既存のmdi-webを使う', () => {
    const wrapper = mountCard({ title: 'サイト', subtitle: '説明', href: 'https://example.com' })
    expect(wrapper.get('[data-icon]').attributes('data-icon')).toBe('mdi-web')
    wrapper.unmount()
  })
})
