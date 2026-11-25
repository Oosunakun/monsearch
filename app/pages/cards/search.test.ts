import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref, watch } from 'vue'
import type { LocationQuery } from 'vue-router'
import SearchPage from './search.vue'
import SearchSlotSelector from '~~/app/components/cards/search/shared/SearchSlotSelector.vue'
import SearchValueWithOperator from '~~/app/components/cards/search/shared/SearchValueWithOperator.vue'
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import SearchActions from '~~/app/components/cards/search/layout/SearchActions.vue'
import SearchFormBasic from '~~/app/components/cards/search/layout/SearchFormBasic.vue'
import SearchFieldArchetypeText from '~~/app/components/cards/search/basic/SearchFieldArchetypeText.vue'
import SearchFieldCardCategory from '~~/app/components/cards/search/basic/SearchFieldCardCategory.vue'
import SearchFieldElement from '~~/app/components/cards/search/basic/SearchFieldElement.vue'
import SearchFieldName from '~~/app/components/cards/search/basic/SearchFieldName.vue'
import SearchFieldKeyword from '~~/app/components/cards/search/basic/SearchFieldKeyword.vue'
import SearchFieldAdditionalAttack from '~~/app/components/cards/search/equipment/SearchFieldAdditionalAttack.vue'
import SearchFieldAdditionalCharge from '~~/app/components/cards/search/equipment/SearchFieldAdditionalCharge.vue'
import SearchFieldLimit from '~~/app/components/cards/search/land/SearchFieldLimit.vue'
import SearchFieldReferenceLabel from '~~/app/components/cards/search/other/SearchFieldReferenceLabel.vue'
import SearchFieldAbilitySlotSpell from '~~/app/components/cards/search/unit/SearchFieldAbilitySlotSpell.vue'
import SearchFieldCharge from '~~/app/components/cards/search/unit/SearchFieldCharge.vue'
import SearchFieldHero from '~~/app/components/cards/search/unit/SearchFieldHero.vue'
import SearchFieldInitiative from '~~/app/components/cards/search/unit/SearchFieldInitiative.vue'
import SearchFieldLevel from '~~/app/components/cards/search/unit/SearchFieldLevel.vue'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { createRepresentativeSearchForm, representativeCardSearchQuery } from '~~/app/utils/search/cardSearchQueryTestFixtures'

const { readyCallbacks } = vi.hoisted(() => ({ readyCallbacks: [] as Array<() => void> }))
mockNuxtImport('onNuxtReady', () => (callback: () => void) => { readyCallbacks.push(callback) })
const analytics = vi.hoisted(() => ({ submit: vi.fn(() => 1), finishSubmit: vi.fn(), results: vi.fn() }))
vi.mock('~~/app/composables/useAnalytics', () => ({ useAnalytics: () => analytics }))
const push = vi.fn()
const replace = vi.fn()
const routeQuery = ref<LocationQuery>({})
const routePath = ref('/cards/search')
let form = ref(createSearchForm())
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({ get query() { return routeQuery.value }, get path() { return routePath.value } }),
  useRouter: () => ({ push, replace }),
}))
vi.mock('~~/app/composables/useCardSearchForm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/app/composables/useCardSearchForm')>()
  return {
    ...actual,
    useCardSearchForm: (...args: Parameters<typeof actual.useCardSearchForm>) => {
      const state = actual.useCardSearchForm(...args)
      form = state.form
      return state
    },
  }
})

describe('card search page', () => {
  const wrappers: Array<Awaited<ReturnType<typeof mountSuspended>>> = []
  const mountSearch = async (hydrating = true, stubSlotOverlays = false) => {
    const slotOverlay = { template: '<div><slot /></div>' }
    useNuxtApp().isHydrating = hydrating
    const wrapper = await mountSuspended(SearchPage, {
      global: {
        stubs: {
          teleport: true,
          ...(stubSlotOverlays ? { VDialog: slotOverlay, VBottomSheet: slotOverlay } : {}),
        },
      },
    })
    wrappers.push(wrapper)
    return wrapper
  }
  const getSearchButton = (wrapper: Awaited<ReturnType<typeof mountSearch>>) => {
    const button = wrapper.getComponent(SearchActions).findAll('button')
      .find(button => button.text() === 'この条件で検索')
    if (!button) throw new Error('「この条件で検索」ボタンが見つかりません')
    return button
  }
  const getClearButton = (wrapper: Awaited<ReturnType<typeof mountSearch>>) =>
    wrapper.getComponent(SearchActions).get('button[aria-label="すべての条件をクリア"]')
  const becomeReady = async () => {
    for (const callback of readyCallbacks.splice(0)) callback()
    await nextTick()
  }
  beforeEach(() => {
    analytics.submit.mockClear(); analytics.finishSubmit.mockClear()
    replace.mockReset()
    push.mockReset(); routeQuery.value = {}; routePath.value = '/cards/search'; form.value = createSearchForm()
    readyCallbacks.length = 0
    useNuxtApp().isHydrating = false
  })
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    useNuxtApp().isHydrating = false
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  for (const [field, modifier, component] of [
    ['charge', 'chm', SearchFieldCharge],
    ['additionalCharge', 'achm', SearchFieldAdditionalCharge],
    ['heroPoint', 'hem', SearchFieldHero],
  ] as const) {
    const timeout = field === 'charge' ? 15_000 : undefined
    it(`${field} の数値と演算子をModifier・分類切替後も保持する`, { timeout }, async () => {
      const wrapper = await mountSearch(false)
      const control = wrapper.getComponent(component)
      const select = (label: string) => control.findAll('button').find(button => button.text() === label)!.trigger('click')

      await select('あり')
      const comparison = control.getComponent(SearchValueWithOperator)
      await comparison.findAll('button').find(button => button.text() === '一致')!.trigger('click')
      await comparison.findAll('button').find(button => button.text() === '2')!.trigger('click')

      await select('すべて')
      expect(control.findComponent(SearchValueWithOperator).exists()).toBe(false)
      expect(form.value[field]).toEqual({ filterType: 'all', operator: 'eq', value: 2 })
      await getSearchButton(wrapper).trigger('click')
      expect(push).toHaveBeenLastCalledWith({ path: '/cards' })
      await select('あり')
      expect(control.getComponent(SearchValueWithOperator).props()).toMatchObject({ operator: 'eq', modelValue: 2 })

      await select('なし')
      expect(control.findComponent(SearchValueWithOperator).exists()).toBe(false)
      expect(form.value[field]).toEqual({ filterType: 'exclude', operator: 'eq', value: 2 })
      await getSearchButton(wrapper).trigger('click')
      expect(push).toHaveBeenLastCalledWith({ path: '/cards', query: { [modifier]: 'exclude' } })
      await select('あり')

      const section: unknown = control.element.closest('.is-collapsible')
      if (!(section instanceof HTMLElement)) throw new Error(`${field}のセクションが見つかりません`)
      const categories = wrapper.getComponent(SearchFieldCardCategory).findAll('.v-chip')
      await categories.find(chip => chip.text() === '召喚術師')!.trigger('click')
      expect(section.style.display).toBe('none')
      expect(form.value[field]).toEqual({ filterType: 'include', operator: 'eq', value: 2 })
      await categories.find(chip => chip.text() === 'トークン')!.trigger('click')
      expect(form.value.cardCategory).toBe('token')
      expect(section.style.display).not.toBe('none')
      expect(control.getComponent(SearchValueWithOperator).props()).toMatchObject({ operator: 'eq', modelValue: 2 })

      await getClearButton(wrapper).trigger('click')
      expect(form.value[field]).toEqual(createSearchForm()[field])
    })
  }

  it('レベルのComparisonは即時召喚Modifierに関わらず表示・送信する', async () => {
    routeQuery.value = { lv: 'gte:2' }
    const wrapper = await mountSearch(false)
    const level = wrapper.getComponent(SearchFieldLevel)
    expect(level.getComponent(SearchValueWithOperator).props('modelValue')).toBe(2)
    await level.findAll('button').find(button => button.text() === '即時不可')!.trigger('click')
    expect(level.getComponent(SearchValueWithOperator).props('modelValue')).toBe(2)
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenLastCalledWith({ path: '/cards', query: { lvm: 'exclude', lv: 'gte:2' } })
  })

  describe.each([
    ['initiative', 'itm', 'it', 'gte', 2, SearchFieldInitiative],
    ['heroPoint', 'hem', 'he', 'eq', 0, SearchFieldHero],
  ] as const)('%s のComparison単独URL', (field, modifier, alias, operator, value, component) => {
    it.each([false, true])('SPA初期化・直アクセスから編集して再検索する (hydrating=%s)', async (hydrating) => {
      const comparison = `${operator}:${value}`
      const query = { [alias]: comparison, nm: '保持する条件' }
      if (!hydrating) routeQuery.value = query
      const wrapper = await mountSearch(hydrating)
      if (hydrating) {
        expect(form.value[field]).toEqual(createSearchForm()[field])
        routeQuery.value = query
        await becomeReady()
      }

      const control = wrapper.getComponent(component)
      expect(control.findAll('button').find(button => button.text() === 'すべて')!.classes()).toContain('v-btn--active')
      expect(control.findComponent(SearchValueWithOperator).exists()).toBe(false)
      expect(form.value[field]).toEqual({ filterType: 'all', operator, value })
      await getSearchButton(wrapper).trigger('click')
      expect(push).toHaveBeenLastCalledWith({ path: '/cards', query: { nm: '保持する条件' } })

      await control.findAll('button').find(button => button.text() === 'あり')!.trigger('click')
      expect(control.getComponent(SearchValueWithOperator).props()).toMatchObject({ operator, modelValue: value })
      await getSearchButton(wrapper).trigger('click')
      expect(push).toHaveBeenLastCalledWith({
        path: '/cards', query: { nm: '保持する条件', [modifier]: 'include', [alias]: comparison },
      })
      expect(routeQuery.value).toEqual(query)
    })
  })

  it('clears all sections, including numeric and slot inputs hidden before the clear', async () => {
    routeQuery.value = {
      ...representativeCardSearchQuery,
      cc: 'token', pd: '22d7e', aat: 'eq:2', lc: 'ritual', etx: '飛行', rl: '参照ラベル',
    }
    const wrapper = await mountSearch(false)
    const name = wrapper.getComponent(SearchFieldName).get('input')
    const fire = wrapper.getComponent(SearchFieldElement).get<HTMLInputElement>('input[value="fire"]')
    const charge = wrapper.getComponent(SearchFieldCharge)
    const slots = wrapper.getComponent(SearchFieldAbilitySlotSpell).getComponent(SearchSlotSelector)
    const categorySections = [
      { label: 'ユニット', field: charge.element },
      { label: '装備品', field: wrapper.getComponent(SearchFieldAdditionalAttack).element },
      { label: '地形', field: wrapper.getComponent(SearchFieldLimit).element },
    ].map(({ label, field }) => {
      // DOMに接続されていないマウントでも、v-show が付けるインラインスタイルは確認できる。
      const section: unknown = field.closest('.is-collapsible')
      if (!(section instanceof HTMLElement)) throw new Error(`${label}のセクションが見つかりません`)
      return { label, section }
    })

    await name.setValue('編集中')
    await fire.setValue(false)
    expect(form.value.elements).toEqual(['water'])

    await charge.findAll('button').find(button => button.text() === 'あり')!.trigger('click')
    const comparison = charge.getComponent(SearchValueWithOperator)
    await comparison.findAll('button').find(button => button.text() === '一致')!.trigger('click')
    await comparison.findAll('button').find(button => button.text() === '2')!.trigger('click')
    await charge.findAll('button').find(button => button.text() === 'なし')!.trigger('click')
    expect(charge.findComponent(SearchValueWithOperator).exists()).toBe(false)
    expect(form.value.charge).toEqual({ filterType: 'exclude', operator: 'eq', value: 2 })

    expect(form.value.abilitySpellSlots).toEqual({ match: 'and', slots: { water: 2, fire: 1 } })
    const fireSlot = slots.findAll('.active-chip').find(chip => chip.text().startsWith('火'))
    expect(fireSlot).toBeDefined()
    await fireSlot!.get('.v-chip__close').trigger('click')
    expect(form.value.abilitySpellSlots.slots).toEqual({ water: 2 })
    await slots.findAll('button').find(button => button.text() === 'なし')!.trigger('click')
    expect(form.value.abilitySpellSlots).toEqual({ match: 'none', slots: { water: 2 } })
    expect(slots.find('.active-chip').exists()).toBe(false)

    await wrapper.getComponent(SearchFieldCardCategory).findAll('.v-chip')
      .find(chip => chip.text() === '召喚術師')!.trigger('click')
    expect(form.value.cardCategory).toBe('summoner')
    for (const { label, section } of categorySections) {
      expect(section.style.display, `${label}は分類選択後に非表示`).toBe('none')
    }
    expect(form.value).toMatchObject({
      name: '編集中', products: ['22d7e'], attack: { operator: 'eq', value: 0 },
      additionalAttack: { operator: 'eq', value: 2 }, landCategory: 'ritual',
      effectText: '飛行', referenceLabel: '参照ラベル',
    })

    const confirm = vi.fn(() => false)
    vi.stubGlobal('confirm', confirm)
    await getClearButton(wrapper).trigger('click')

    expect(confirm).not.toHaveBeenCalled()
    expect(form.value).toEqual(createSearchForm())
    expect(name.element.value).toBe('')
    expect(wrapper.getComponent(SearchFieldElement).get<HTMLInputElement>('input[value="water"]').element.checked).toBe(false)
    for (const { label, section } of categorySections) {
      expect(section.style.display, `${label}はクリア後に再表示`).not.toBe('none')
    }
    expect(slots.props('match')).toBe('or')
    expect(slots.props('slots')).toEqual({})
    expect(slots.find('.active-chip').exists()).toBe(false)

    await charge.findAll('button').find(button => button.text() === 'あり')!.trigger('click')
    expect(charge.getComponent(SearchValueWithOperator).props()).toMatchObject({ operator: 'gte', modelValue: null })
    expect(charge.find('.btn-active').exists()).toBe(false)
  })

  it.each<{ query: LocationQuery; expected: Partial<ReturnType<typeof createSearchForm>> }>([
    { query: { cc: 'summoner', kw: 'アーニャ', att: ' サモナー ' }, expected: { cardCategory: 'summoner', keyword: 'アーニャ', archetypeText: 'サモナー' } },
    { query: { cc: 'unit' }, expected: { cardCategory: 'unit', keyword: '' } },
  ])('restores deferred query $query after ready with real child components', async ({ query, expected }) => {
    const wrapper = await mountSearch()
    const input = wrapper.getComponent(SearchFieldArchetypeText).get('input')
    expect(form.value).toEqual(createSearchForm())
    expect(readyCallbacks).toHaveLength(1)
    routeQuery.value = query
    await nextTick()
    expect(form.value).toEqual(createSearchForm())
    expect(input.element.value).toBe('')
    await becomeReady()
    expect(form.value).toMatchObject(expected)
    expect(input.element.value).toBe(expected.archetypeText ?? '')
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

  it.each([false, true])('keeps an explicit clear before ready and allows URL restoration on a new mount (hydrating: %s)', async (hydratingAgain) => {
    const wrapper = await mountSearch()
    const name = wrapper.getComponent(SearchFieldName).get('input')
    expect(form.value).toEqual(createSearchForm())
    await getClearButton(wrapper).trigger('click')

    const query = { ...representativeCardSearchQuery, unknown: 'ignored', aat: 'invalid' }
    routeQuery.value = query
    await becomeReady()

    expect(form.value).toEqual(createSearchForm())
    expect(name.element.value).toBe('')
    expect(routeQuery.value).toEqual(query)
    expect(push).not.toHaveBeenCalled()

    wrapper.unmount()
    wrappers.pop()
    if (hydratingAgain) routeQuery.value = {}
    const reopened = await mountSearch(hydratingAgain)
    routeQuery.value = query
    await becomeReady()

    expect(form.value).toEqual(createRepresentativeSearchForm())
    expect(reopened.getComponent(SearchFieldName).get('input').element.value).toBe('青い竜 🐉')
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

  it('preserves archetype input entered before deferred restoration', async () => {
    const wrapper = await mountSearch()
    const input = wrapper.getComponent(SearchFieldArchetypeText).get('input')
    await input.setValue('ドラゴン')
    routeQuery.value = { att: 'スピリット' }
    await becomeReady()

    expect(input.element.value).toBe('ドラゴン')
    expect(form.value.archetypeText).toBe('ドラゴン')
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

  it('shows the restored archetype on SPA entry and keeps it when resubmitted unchanged', async () => {
    const query = { att: 'ドラゴン', cc: 'unit', kw: '飛行' }
    routeQuery.value = query
    const wrapper = await mountSearch(false)

    expect(wrapper.getComponent(SearchFieldArchetypeText).get('input').element.value).toBe('ドラゴン')
    await getSearchButton(wrapper).trigger('click')

    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query })
  })

  it('submits edits to the restored query through the existing builder', async () => {
    const wrapper = await mountSearch()
    routeQuery.value = { cc: 'summoner', kw: 'アーニャ' }
    await becomeReady()
    form.value.keyword = 'ダメージ'
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { cc: 'summoner', kw: 'ダメージ' } })
  })

  it.each<{ initialQuery: LocationQuery; inputValue: string; expectedQuery: LocationQuery }>([
    { initialQuery: {}, inputValue: 'ドラゴン', expectedQuery: { att: 'ドラゴン' } },
    { initialQuery: { att: 'ドラゴン' }, inputValue: ' スピリット ', expectedQuery: { att: 'スピリット' } },
    { initialQuery: { att: 'ドラゴン' }, inputValue: '　 ', expectedQuery: {} },
  ])('submits archetype input $inputValue with the other search conditions', async ({ initialQuery, inputValue, expectedQuery }) => {
    const otherConditions = { cc: 'unit', kw: '飛行' }
    routeQuery.value = { ...otherConditions, ...initialQuery }
    const wrapper = await mountSearch(false)
    await wrapper.getComponent(SearchFieldArchetypeText).get('input').setValue(inputValue)
    expect(push).not.toHaveBeenCalled()

    await getSearchButton(wrapper).trigger('click')

    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query: { ...otherConditions, ...expectedQuery } })
  })

  it('clears only the restored archetype and omits it on the next search', async () => {
    const otherConditions = { cc: 'unit', kw: '飛行' }
    routeQuery.value = { ...otherConditions, att: 'ドラゴン' }
    const wrapper = await mountSearch(false)
    const field = wrapper.getComponent(SearchFieldArchetypeText)
    const clear = field.get('button')
    expect(clear.element.disabled).toBe(false)

    await clear.trigger('click')

    expect(field.get('input').element.value).toBe('')
    expect(clear.element.disabled).toBe(true)
    expect(wrapper.getComponent(SearchFieldKeyword).get('input').element.value).toBe('飛行')
    expect(push).not.toHaveBeenCalled()

    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query: otherConditions })
  })

  it.each([
    ['nm', SearchFieldName],
    ['kw', SearchFieldKeyword],
    ['rl', SearchFieldReferenceLabel],
    ['att', SearchFieldArchetypeText],
  ] as const)('submits the latest input as %s with existing conditions once', async (alias, field) => {
    routeQuery.value = { cc: 'unit', el: 'fire' }
    const wrapper = await mountSearch(false)
    const input = wrapper.getComponent(field).get('input')
    const ancestorKeydown = vi.fn()
    wrapper.element.addEventListener('keydown', ancestorKeydown)
    await input.setValue('  確定済み  ')

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.element.dispatchEvent(enter)
    await nextTick()

    const query = { cc: 'unit', el: 'fire', [alias]: '確定済み' }
    expect(enter.defaultPrevented).toBe(true)
    expect(ancestorKeydown).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/cards', query })
    expect(analytics.submit).toHaveBeenCalledExactlyOnceWith('advanced', query)
    expect(analytics.finishSubmit).toHaveBeenCalledExactlyOnceWith(1)
  })

  it.each([
    ['IME composition', SearchFieldName, { key: 'Enter', isComposing: true }],
    ['legacy IME code', SearchFieldKeyword, { key: 'Enter', isComposing: false }, 229],
    ['a repeated Enter', SearchFieldReferenceLabel, { key: 'Enter', repeat: true }],
    ['Space', SearchFieldReferenceLabel, { key: ' ' }],
    ['IME composition in archetype input', SearchFieldArchetypeText, { key: 'Enter', isComposing: true }],
    ['legacy IME code in archetype input', SearchFieldArchetypeText, { key: 'Enter', isComposing: false }, 229],
    ['a repeated Enter in archetype input', SearchFieldArchetypeText, { key: 'Enter', repeat: true }],
  ] as const)('leaves %s available for its original behavior', async (_case, field, init, keyCode?: number) => {
    const wrapper = await mountSearch(false)
    const input = wrapper.getComponent(field).get('input')
    const ancestorKeydown = vi.fn()
    wrapper.element.addEventListener('keydown', ancestorKeydown)
    const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true })
    if (keyCode !== undefined) Object.defineProperty(event, 'keyCode', { value: keyCode })

    input.element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(ancestorKeydown).toHaveBeenCalledExactlyOnceWith(event)
    expect(push).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()
  })

  it('does not submit Enter from a card text field or a category chip', async () => {
    const wrapper = await mountSearch(false)
    await wrapper.get('input[placeholder="カードテキストを入力..."]').trigger('keydown', { key: 'Enter' })
    await wrapper.get('.v-chip').trigger('keydown', { key: 'Enter' })

    expect(push).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()
  })

  it('restores every representative field family from the route query', async () => {
    routeQuery.value = representativeCardSearchQuery
    await mountSearch(false)
    expect(form.value).toEqual(createRepresentativeSearchForm())
    expect(routeQuery.value).toEqual(representativeCardSearchQuery)
  })

  it('restores defaults for an empty route query and shows the archetype input after card type', async () => {
    const wrapper = await mountSearch(false)
    expect(form.value).toEqual(createSearchForm())

    const basic = wrapper.getComponent(SearchFormBasic)
    expect(basic.findAllComponents(SearchRow).map(row => row.props('label'))).toEqual([
      'カード名', 'カード分類', '属性', 'タイプ', '種族・タイプ', 'キーワード',
    ])
    const field = basic.getComponent(SearchFieldArchetypeText)
    const input = field.get('input')
    expect(input.attributes('aria-label')).toBe('種族・タイプ')
    expect(input.attributes('placeholder')).toBe('種族・タイプを入力...')
    expect(input.element.value).toBe('')
    expect(field.get('button').element.disabled).toBe(true)
  })

  it('navigates populated submissions with a logical query', async () => {
    const wrapper = await mountSearch(false)
    form.value.name = ' Dragon '
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: 'Dragon' } })
    expect(analytics.submit).toHaveBeenCalledWith('advanced', { nm: 'Dragon' })
    expect(analytics.finishSubmit).toHaveBeenCalledWith(1)
  })

  it('rebuilds a restored form after adding, changing, and removing conditions', async () => {
    routeQuery.value = { nm: 'Dragon', el: 'fire,water', at: 'eq:2', unknown: 'discarded' }
    const wrapper = await mountSearch(false)
    form.value.name = ''
    form.value.elements = ['water']
    form.value.attack = { operator: 'gte', value: 0 }
    await getSearchButton(wrapper).trigger('click')

    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { el: 'water', at: 'gte:0' } })
  })

  it('canonically round-trips an unchanged restored form', async () => {
    routeQuery.value = { el: ['water', 'fire,water'], nm: ' Dragon ' }
    const wrapper = await mountSearch(false)
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: 'Dragon', el: 'fire,water' } })
  })

  it('keeps valid fields when malformed route conditions are present', async () => {
    routeQuery.value = { nm: '有効', at: 'broken', lv: 'lte:3', lvm: 'include', unknown: 'ignored' }
    const wrapper = await mountSearch(false)
    expect(form.value.name).toBe('有効')
    expect(form.value.attack).toEqual({ operator: 'gte', value: null })
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { nm: '有効', lvm: 'include', lv: 'lte:3' } })
  })

  it('navigates an empty submission to bare /cards', async () => {
    const wrapper = await mountSearch(false)
    await getSearchButton(wrapper).trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/cards' })
  })

  it.each(['', '再入力'])('only searches after an explicit submit with the post-clear input %j', async (input) => {
    const query = { nm: '復元された条件', cc: 'unit', at: 'eq:0' }
    routeQuery.value = query
    const wrapper = await mountSearch(false)
    const location = window.location.href
    const historyLength = window.history.length
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const clear = getClearButton(wrapper)
    await clear.trigger('click')
    await clear.trigger('click')

    expect(form.value).toEqual(createSearchForm())
    if (input) await wrapper.getComponent(SearchFieldName).get('input').setValue(input)

    expect(routePath.value).toBe('/cards/search')
    expect(routeQuery.value).toEqual(query)
    expect(window.location.href).toBe(location)
    expect(window.history.length).toBe(historyLength)
    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(analytics.submit).not.toHaveBeenCalled()
    expect(analytics.finishSubmit).not.toHaveBeenCalled()

    await getSearchButton(wrapper).trigger('click')

    expect(push).toHaveBeenCalledExactlyOnceWith(input ? { path: '/cards', query: { nm: input } } : { path: '/cards' })
    expect(analytics.submit).toHaveBeenCalledExactlyOnceWith('advanced', input ? { nm: input } : {})
    expect(analytics.finishSubmit).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('navigates UI-selected slots with their logical query alias', async () => {
    const wrapper = await mountSearch(false, true)
    const slotSelector = wrapper.findComponent(SearchSlotSelector)
    const incrementButton = slotSelector.findAllComponents({ name: 'VBtn' })
      .find(button => button.props('icon') === 'mdi-plus')
    expect(incrementButton).toBeDefined()
    await incrementButton!.trigger('click')
    await getSearchButton(wrapper).trigger('click')

    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { is: 'multi:1' } })
  })
})

vi.mock('~~/app/utils/constants/search/options/itemSlot', async importOriginal => ({ ...(await importOriginal<Record<string, unknown>>()), ITEM_SLOT_OPTIONS: [{ label: 'アイテム', value: 'multi', color: '#fff' }] }))
