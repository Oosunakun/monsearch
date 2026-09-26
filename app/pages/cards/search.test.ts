import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LocationQuery } from 'vue-router'
import SearchPage from './search.vue'
import SearchSlotSelector from '~~/app/components/cards/search/shared/SearchSlotSelector.vue'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { createRepresentativeSearchForm, representativeCardSearchQuery } from '~~/app/utils/search/cardSearchQueryTestFixtures'

const push = vi.fn()
const routeQuery = ref<LocationQuery>({})
let form = ref(createSearchForm())
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({ query: routeQuery.value }),
  useRouter: () => ({ push }),
}))
vi.mock('~~/app/composables/useCardSearchForm', () => ({
  useCardSearchForm: (initialForm: ReturnType<typeof createSearchForm>) => {
    form = ref(structuredClone(initialForm))
    return { form }
  },
}))

describe('card search page', () => {
  beforeEach(() => { push.mockReset(); routeQuery.value = {}; form.value = createSearchForm() })

  it('restores every representative field family from the route query', async () => {
    routeQuery.value = representativeCardSearchQuery
    await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    expect(form.value).toEqual(createRepresentativeSearchForm())
    expect(routeQuery.value).toEqual(representativeCardSearchQuery)
  })

  it('restores defaults for an empty route query', async () => {
    await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    expect(form.value).toEqual(createSearchForm())
  })

  it('navigates populated submissions with a logical query', async () => {
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    form.value.name = ' Dragon '
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: 'Dragon' } })
  })

  it('rebuilds a restored form after adding, changing, and removing conditions', async () => {
    routeQuery.value = { nm: 'Dragon', el: 'fire,water', at: 'eq:2', unknown: 'discarded' }
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    form.value.name = ''
    form.value.elements = ['water']
    form.value.attack = { operator: 'gte', value: 0 }
    await wrapper.findAll('button').at(-1)!.trigger('click')

    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { el: 'water', at: 'gte:0' } })
  })

  it('canonically round-trips an unchanged restored form', async () => {
    routeQuery.value = { el: ['water', 'fire,water'], nm: ' Dragon ' }
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: 'Dragon', el: 'fire,water' } })
  })

  it('keeps valid fields when malformed route conditions are present', async () => {
    routeQuery.value = { nm: '有効', at: 'broken', lv: 'lte:3', lvm: 'include', unknown: 'ignored' }
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    expect(form.value.name).toBe('有効')
    expect(form.value.attack).toEqual({ operator: 'gte', value: null })
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: '有効', lvm: 'include', lv: 'lte:3' } })
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
