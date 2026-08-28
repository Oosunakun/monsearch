import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchPage from './search.vue'
import SearchSlotSelector from '~~/app/components/cards/search/shared/SearchSlotSelector.vue'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'

const push = vi.fn()
const form = ref(createSearchForm())
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRouter: () => ({ push }),
}))
vi.mock('~~/app/composables/useCardSearchForm', () => ({ useCardSearchForm: () => ({ form }) }))

describe('card search page', () => {
  beforeEach(() => { push.mockReset(); form.value = createSearchForm() })

  it('navigates populated submissions with a logical query', async () => {
    form.value.name = ' Dragon '
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: 'Dragon' } })
  })

  it('navigates an empty submission to bare /cards', async () => {
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards' })
  })

  it('navigates UI-selected slots with their logical query alias', async () => {
    const wrapper = await mountSuspended(SearchPage, {
      global: {
        stubs: {
          teleport: true,
          VDialog: { template: '<div><slot /></div>' },
        },
      },
    })
    const slotSelector = wrapper.findComponent(SearchSlotSelector)
    const incrementButton = slotSelector.findAllComponents({ name: 'VBtn' })
      .find(button => button.props('icon') === 'mdi-plus')
    expect(incrementButton).toBeDefined()
    await incrementButton!.trigger('click')
    await wrapper.findAll('button').at(-1)!.trigger('click')

    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { is: 'multi:1' } })
  })
})
