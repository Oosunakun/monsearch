import { mount } from '@vue/test-utils'
import { useRuntimeConfig } from '#imports'
import { describe, expect, it } from 'vitest'
import NavigationFooter from './NavigationFooter.vue'

describe('ドロワー下部のビルド情報', () => {
  it('2行表示しrailへの切替で非表示にする', async () => {
    const info = useRuntimeConfig().public.buildInfo
    const previous = { ...info }
    Object.assign(info, { version: 'v1.0.0', commitSha: 'd7a6bcd' + 'a'.repeat(33), builtAtUtc: '2026-11-18T14:41:04.000Z' })
    const wrapper = mount(NavigationFooter, { props: { rail: false } })
    expect(wrapper.findAll('.build-info > div').map(row => row.text())).toEqual([
      'v1.0.0 (d7a6bcd)', 'Build: 2026-11-18 23:41:04 JST',
    ])
    expect(wrapper.get('.build-info-release').classes()).toContain('text-medium-emphasis')
    expect(wrapper.get('.build-info-build').classes()).toContain('text-disabled')
    await wrapper.setProps({ rail: true })
    expect(wrapper.find('.build-info').exists()).toBe(false)
    wrapper.unmount()
    Object.assign(info, previous)
  })
})
