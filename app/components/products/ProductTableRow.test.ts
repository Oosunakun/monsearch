import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductTableRow from './ProductTableRow.vue'

const mobile = ref(false)
vi.mock('vuetify', () => ({ useDisplay: () => ({ mobile }) }))

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], required: true } },
  emits: ['navigate'],
  setup(props, { slots, emit }) {
    return () => h('a', {
      class: 'nuxt-link-stub',
      href: '#',
      onClick: () => emit('navigate', props.to),
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === 'Enter') emit('navigate', props.to)
      },
    }, slots.default?.())
  },
})

const mountRow = (searchValue = '22d7e') => mount(ProductTableRow, {
  props: {
    shortName: 'M20A', searchValue, productName: '太陽の金の竜姫',
    productNote: '20th', releaseDate: '2017-03-30', zebra: false,
  },
  global: {
    stubs: {
      ZebraTableRow: { template: '<table><tbody><tr><slot /></tr></tbody></table>' },
      NuxtLink: NuxtLinkStub,
      VChip: { template: '<span class="v-chip"><slot /></span>' },
    },
  },
})

describe('ProductTableRow', () => {
  beforeEach(() => { mobile.value = false })

  it.each([false, true])('desktop/mobile で pointer と keyboard が同じ location を開く (%s)', async isMobile => {
    mobile.value = isMobile
    const wrapper = mountRow()
    const link = wrapper.findComponent(NuxtLinkStub)
    const expected = { path: '/cards', query: { pd: '22d7e' } }

    await link.trigger('click')
    await link.trigger('keydown', { key: 'Enter' })
    expect(link.props('to')).toEqual(expected)
    expect(link.emitted('navigate')).toEqual([[expected], [expected]])
  })

  it.each([false, true])('無効値では名称を表示するが link を作らない (%s)', isMobile => {
    mobile.value = isMobile
    const wrapper = mountRow('unknown')
    expect(wrapper.text()).toContain('太陽の金の竜姫')
    expect(wrapper.findComponent(NuxtLinkStub).exists()).toBe(false)
  })

  it('備考・発売日・略称・行余白を link に含めない', () => {
    const wrapper = mountRow()
    const link = wrapper.findComponent(NuxtLinkStub)
    expect(link.text()).toBe('太陽の金の竜姫')
    expect(link.text()).not.toContain('20th')
    expect(link.text()).not.toContain('2017-03-30')
    expect(link.text()).not.toContain('M20A')
  })
})
