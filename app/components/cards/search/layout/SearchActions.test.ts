import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import SearchActions from './SearchActions.vue'

describe('SearchActions', () => {
  it('keeps the search button first and provides one clear button with a shared accessible name', async () => {
    const onExecute = vi.fn()
    const onClear = vi.fn()
    const wrapper = await mountSuspended(SearchActions, { props: { onExecute, onClear } })

    try {
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(2)
      const [search, clear] = buttons
      expect(search!.text()).toBe('この条件で検索')
      expect(search!.classes()).toEqual(expect.arrayContaining([
        'bg-primary', 'v-btn--variant-flat', 'v-btn--size-large', 'font-weight-bold', 'px-12',
      ]))
      expect(clear!.attributes('type')).toBe('button')
      expect(clear!.attributes('aria-label')).toBe('すべての条件をクリア')
      expect(clear!.classes()).toContain('v-btn--variant-outlined')
      expect(clear!.get('.d-none.d-md-inline').text()).toBe('すべての条件をクリア')
      expect(clear!.get('.d-md-none').text()).toBe('クリア')
      expect(search!.element.tabIndex).toBe(0)
      expect(clear!.element.tabIndex).toBe(0)

      await clear!.trigger('click')
      expect(onClear).toHaveBeenCalledTimes(1)
      expect(onExecute).not.toHaveBeenCalled()

      await search!.trigger('click')
      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onClear).toHaveBeenCalledTimes(1)
    } finally {
      wrapper.unmount()
    }
  })
})
