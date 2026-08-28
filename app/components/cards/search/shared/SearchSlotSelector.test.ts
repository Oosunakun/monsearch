import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import SearchSlotSelector from './SearchSlotSelector.vue'

const items = [
  { label: '火', value: 'fire', color: 'red' },
] as const

describe('SearchSlotSelector', () => {
  it('選択数を slots model へ通知する', async () => {
    const updateSlots = vi.fn()
    const wrapper = await mountSuspended(SearchSlotSelector, {
      props: {
        label: 'スロットを選択',
        items,
        slots: {},
        match: 'or',
        'onUpdate:slots': updateSlots,
      },
      global: {
        stubs: {
          VDialog: { template: '<div><slot /></div>' },
        },
      },
    })

    const incrementButton = wrapper.findAllComponents({ name: 'VBtn' })
      .find(button => button.props('icon') === 'mdi-plus')
    expect(incrementButton).toBeDefined()
    await incrementButton!.trigger('click')

    expect(updateSlots).toHaveBeenCalledWith({ fire: 1 })
  })

  it('論理条件を match model へ通知する', async () => {
    const updateMatch = vi.fn()
    const wrapper = await mountSuspended(SearchSlotSelector, {
      props: {
        label: 'スロットを選択',
        items,
        slots: {},
        match: 'or',
        'onUpdate:match': updateMatch,
      },
      global: { stubs: { teleport: true } },
    })

    const andButton = wrapper.findAllComponents({ name: 'VBtn' })
      .find(button => button.props('value') === 'and')
    expect(andButton).toBeDefined()
    await andButton!.trigger('click')

    expect(updateMatch).toHaveBeenCalledWith('and')
  })
})
