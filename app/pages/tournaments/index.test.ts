import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import TournamentPage from './index.vue'
import {
  TOURNAMENT_CALENDAR_URL
} from '~~/app/utils/mockData'

// Human承認URLを独立した固定値として保持する（正本Planから転記）。
const approvedUrl = 'https://calendar.google.com/calendar/embed?src=cWN1NzB1a3NrOGZlbTIxbHNjcGQ5Z3ZlM2NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=anJjbnM0dmdidGc1YmpmdmYydXF2dTZmY2NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23D50000&color=%237CB342&color=%23009688&showTitle=1&showNav=1&showTz=1&showCalendars=1&showTabs=1&title=%E3%83%A2%E3%83%B3%E3%82%B3%E3%83%AC%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB'

const mountPage = () => mount(TournamentPage, { global: { stubs: {
  ContentMaxWidthContainer: { template: '<main><slot /></main>' },
  SectionCardShell: { template: '<section><header><slot name="header" /></header><slot /></section>' },
  SectionHeader: { props: ['title'], template: '<h2>{{ title }}</h2>' },
  VCard: defineComponent({ template: '<a><slot /></a>' }),
  VIcon: defineComponent({ props: ['icon'], template: '<span :data-icon="icon" />' }),
} } })

describe('大会情報のカレンダー', () => {
  it('初期状態から承認URLのiframeを1つ表示し、再描画でも重複しない', async () => {
    const wrapper = mountPage()
    try {
      expect(TOURNAMENT_CALENDAR_URL).toBe(approvedUrl)
      expect(wrapper.findAll('iframe')).toHaveLength(1)
      const frame = wrapper.get('iframe')
      expect(frame.attributes('src')).toBe(approvedUrl)
      expect(frame.attributes('title')).toBe('モンコレスケジュール（Googleカレンダー）')
      expect(frame.attributes('referrerpolicy')).toBe('no-referrer')
      expect(wrapper.text()).not.toContain('カレンダーを表示')
      expect(wrapper.find('button').exists()).toBe(false)
      wrapper.vm.$forceUpdate()
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('iframe')).toHaveLength(1)
      expect(wrapper.get('iframe').element).toBe(frame.element)
    } finally { wrapper.unmount() }
  })

  it('制作者を上部に、同じURLの補助ボタンを下部に配置する', () => {
    const wrapper = mountPage()
    try {
      const content = wrapper.get('.tournament-content')
      const credit = content.get('.calendar-credit')
      expect(credit.text()).toBe('制作：かわまのひと 様')
      expect(credit.get('a').text()).toBe('かわまのひと')
      expect(credit.get('a').attributes('href')).toBe('https://twitter.com/kawamanohito')
      // 前説はなく、作者表記だけを残す。固定の子要素インデックスに依存しない。
      expect(content.findAll('p')).toHaveLength(1)
      const frame = content.get('iframe')
      expect(credit.element.compareDocumentPosition(frame.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      const link = content.get('a[target="_blank"]')
      expect(frame.element.compareDocumentPosition(link.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(link.text()).toBe('カレンダーを別タブで開く')
      expect(link.attributes('href')).toBe(approvedUrl)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
      expect(link.findAll('[data-icon]').map(icon => icon.attributes('data-icon')))
        .toEqual(['mdi-web', 'mdi-open-in-new'])
      expect(wrapper.findAll('h2')).toHaveLength(1)
      expect(wrapper.text()).not.toContain('IPアドレス')
    } finally { wrapper.unmount() }
  })
})
