import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { VDataTable } from 'vuetify/components'
import HistoryTable from './HistoryTable.vue'
import type { HistoryRow } from './HistoryTable.vue'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

const headers = [
  { title: '日付', key: 'date' },
  { title: 'バージョン', key: 'version' },
  { title: '更新内容', key: 'update' },
]
const makeRows = (count: number): HistoryRow[] => Array.from({ length: count }, (_, index) => ({
  id: String(index + 1), date: '2026-11-15', version: 'v1.0.0',
  update: `更新内容${index + 1}`, zebra: index % 2 === 1,
}))
const wrappers: ReturnType<typeof mount>[] = []
const render = (count: number, mobile = false) => {
  const wrapper = mount(HistoryTable, {
    props: { headers, rows: makeRows(count) },
    global: { plugins: [createVuetify({ components, display: { mobileBreakpoint: mobile ? 10000 : 0 } })] },
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
})

describe('更新履歴テーブルの回帰', () => {
  it('mount前は固定高なしのtbody Skeletonを1組表示し、mount後に履歴へ切り替える', async () => {
    const wrapper = render(1)
    expect(wrapper.findComponent(SkeletonLoader).props()).toMatchObject({
      height: undefined, type: 'table-tbody@1', loading: true,
    })
    expect(wrapper.findAll('.v-skeleton-loader__table-tbody')).toHaveLength(1)
    expect(wrapper.findComponent(VDataTable).exists()).toBe(false)
    await nextTick()
    expect(wrapper.findComponent(SkeletonLoader).exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })

  it.each([false, true])('mobile=%sで固定高なし・全件表示・フッター非表示を維持する', async (mobile) => {
    const wrapper = render(1, mobile)
    await nextTick()
    const table = wrapper.findComponent(VDataTable)
    expect(table.props()).toMatchObject({
      height: undefined, fixedHeader: true, itemsPerPage: '-1',
      hideDefaultFooter: true, hideDefaultHeader: mobile,
    })
    expect(wrapper.get('.v-table__wrapper').element.getAttribute('style') ?? '').not.toContain('height:')
    expect(wrapper.find('thead').exists()).toBe(!mobile)
    expect(wrapper.findAll('tbody tr td')).toHaveLength(mobile ? 1 : 3)
    expect(wrapper.text()).toContain('更新内容1')
    expect(wrapper.find('.v-data-table-footer').exists()).toBe(false)
    await wrapper.setProps({ rows: makeRows(20) })
    expect(wrapper.findAll('tbody tr')).toHaveLength(20)
    expect(wrapper.text()).toContain('更新内容20')
  })
})
