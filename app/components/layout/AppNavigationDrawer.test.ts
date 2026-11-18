import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import AppNavigationDrawer from './AppNavigationDrawer.vue'
import NavigationFooter from './NavigationFooter.vue'

describe('ドロワーの有効rail', () => {
  it('mount後、PC railからmobileへの移行でFooterを表示対象に戻す', async () => {
    const wrapper = mount(AppNavigationDrawer, {
      props: { drawer: true, rail: false, isMobile: false, navItems: [], searchTypes: [],
        quickSearchState: { selectedCardPool: '', selectedSearchType: 'name', searchText: '' } },
      global: { stubs: {
        VNavigationDrawer: { template: '<aside><slot /><footer><slot name="append" /></footer></aside>' },
        NavigationFooter: true, NavigationList: true, QuickSearchBar: true, SearchMagnifyButton: true,
        VListItem: { template: '<div><slot /></div>' }, VBtn: true, VDivider: true,
      } },
    })
    expect(wrapper.findComponent(NavigationFooter).exists()).toBe(false)
    await nextTick()
    for (const [isMobile, rail, expected] of [[false, false, false], [false, true, true], [true, true, false], [true, false, false]] as const) {
      await wrapper.setProps({ isMobile, rail })
      expect(wrapper.findComponent(NavigationFooter).props('rail')).toBe(expected)
    }
    wrapper.unmount()
  })
})
