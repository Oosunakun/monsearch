import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref, watch } from 'vue'
import type { LocationQuery } from 'vue-router'
import SearchPage from './search.vue'
import SearchSlotSelector from '~~/app/components/cards/search/shared/SearchSlotSelector.vue'
import SearchFormBasic from '~~/app/components/cards/search/layout/SearchFormBasic.vue'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { createRepresentativeSearchForm, representativeCardSearchQuery } from '~~/app/utils/search/cardSearchQueryTestFixtures'

const { readyCallbacks } = vi.hoisted(() => ({ readyCallbacks: [] as Array<() => void> }))
mockNuxtImport('onNuxtReady', () => (callback: () => void) => { readyCallbacks.push(callback) })
const push = vi.fn()
const routeQuery = ref<LocationQuery>({})
const routePath = ref('/cards/search')
let form = ref(createSearchForm())
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({ get query() { return routeQuery.value }, get path() { return routePath.value } }),
  useRouter: () => ({ push }),
}))
vi.mock('~~/app/composables/useCardSearchForm', () => ({
  useCardSearchForm: (initialForm: ReturnType<typeof createSearchForm>) => {
    form = ref(structuredClone(initialForm))
    return { form }
  },
}))

describe('card search page', () => {
  const wrappers: Array<Awaited<ReturnType<typeof mountSuspended>>> = []
  const mountSearch = async (hydrating = true) => {
    useNuxtApp().isHydrating = hydrating
    const wrapper = await mountSuspended(SearchPage, { global: { stubs: { teleport: true } } })
    wrappers.push(wrapper)
    return wrapper
  }
  const becomeReady = async () => {
    for (const callback of readyCallbacks.splice(0)) callback()
    await nextTick()
  }
  beforeEach(() => {
    push.mockReset(); routeQuery.value = {}; routePath.value = '/cards/search'; form.value = createSearchForm()
    readyCallbacks.length = 0
    useNuxtApp().isHydrating = false
  })
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    useNuxtApp().isHydrating = false
  })

  it.each<{ query: LocationQuery; expected: Partial<ReturnType<typeof createSearchForm>> }>([
    { query: { cc: 'summoner', kw: 'アーニャ' }, expected: { cardCategory: 'summoner', keyword: 'アーニャ' } },
    { query: { cc: 'unit' }, expected: { cardCategory: 'unit', keyword: '' } },
  ])('restores deferred query $query after ready with real child components', async ({ query, expected }) => {
    await mountSearch()
    expect(form.value).toEqual(createSearchForm())
    expect(readyCallbacks).toHaveLength(1)
    routeQuery.value = query
    await nextTick()
    expect(form.value).toEqual(createSearchForm())
    await becomeReady()
    expect(form.value).toMatchObject(expected)
    expect(routeQuery.value).toEqual(query)
  })

  it('reads the latest query and restores representative fields at most once', async () => {
    await mountSearch()
    routeQuery.value = { cc: 'unit' }
    routeQuery.value = representativeCardSearchQuery
    const changes = vi.fn()
    const stop = watch(form, changes, { flush: 'sync' })
    const callback = readyCallbacks[0]!
    await becomeReady()
    expect(form.value).toEqual(createRepresentativeSearchForm())
    expect(changes).toHaveBeenCalledTimes(1)
    form.value.keyword = 'edited after ready'
    routeQuery.value = { ...representativeCardSearchQuery }
    callback()
    await nextTick()
    expect(form.value.keyword).toBe('edited after ready')
    expect(changes).toHaveBeenCalledTimes(1)
    stop()
  })

  it('keeps defaults when the deferred URL has no query', async () => {
    await mountSearch()
    await becomeReady()
    expect(form.value).toEqual(createSearchForm())
  })

  it('ignores equal initial model notifications from a child', async () => {
    const wrapper = await mountSearch()
    wrapper.findComponent(SearchFormBasic).vm.$emit('update:modelValue', structuredClone(createSearchForm()))
    await nextTick()
    routeQuery.value = { cc: 'unit' }
    await becomeReady()
    expect(form.value.cardCategory).toBe('unit')
  })

  it.each(['keyword', 'nested slots', 'edit then undo'])('preserves %s edits made before ready', async (kind) => {
    await mountSearch()
    if (kind === 'nested slots') form.value.abilityItemSlots.slots.multi = 1
    else {
      form.value.keyword = 'user input'
      if (kind === 'edit then undo') form.value.keyword = ''
    }
    const edited = JSON.parse(JSON.stringify(form.value))
    routeQuery.value = { cc: 'summoner', kw: 'アーニャ' }
    await becomeReady()
    expect(form.value).toEqual(edited)
  })

  it('does not restore after unmount', async () => {
    const wrapper = await mountSearch()
    const original = form.value
    wrapper.unmount()
    wrappers.pop()
    routeQuery.value = { cc: 'unit' }
    await becomeReady()
    expect(form.value).toBe(original)
  })

  it('does not restore after leaving the path, even if it returns before ready', async () => {
    await mountSearch()
    const original = form.value
    routePath.value = '/cards'
    routePath.value = '/cards/search'
    routeQuery.value = { cc: 'unit' }
    await becomeReady()
    expect(form.value).toBe(original)
  })

  it('initializes SPA entry immediately without scheduling a late reset', async () => {
    routeQuery.value = { cc: 'summoner', kw: 'アーニャ' }
    await mountSearch(false)
    expect(form.value).toMatchObject({ cardCategory: 'summoner', keyword: 'アーニャ' })
    expect(readyCallbacks).toHaveLength(0)
    form.value.keyword = 'user edit'
    routeQuery.value = { cc: 'unit' }
    await becomeReady()
    expect(form.value.keyword).toBe('user edit')
  })

  it('submits edits to the restored query through the existing builder', async () => {
    const wrapper = await mountSearch()
    routeQuery.value = { cc: 'summoner', kw: 'アーニャ' }
    await becomeReady()
    form.value.keyword = 'ダメージ'
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { cc: 'summoner', kw: 'ダメージ' } })
  })

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
