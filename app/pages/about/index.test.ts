import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AboutPage from './index.vue'
import { mockAboutAnalyticsItems } from '~~/app/utils/mockData/about'

// 実装データから生成せず、確定した項目名・表示本文を独立した固定値で保持する。
const subheadings = ['利用目的', '収集情報', 'データ保持', '個人情報', '詳細情報', 'Googleカレンダー', '停止方法']
const bodies = [
  '当サイトでは、検索機能の改善とサイト運営の参考とするため、Google Analytics 4（GA4）を利用します。',
  'Cookie等を利用し、閲覧ページや検索条件を含むURL、検索機能の利用状況、アクセス環境（地域・ブラウザーなど）に関する情報をGoogleへ送信します。',
  'GA4のユーザー単位・イベント単位データの保持期間は14か月に設定しています。この設定は標準の集計レポートやCookieには適用されません。',
  'GA4の標準データ除去機能を利用しますが、個人情報の送信を完全に防ぐものではありません。検索欄に個人情報を入力しないでください。',
  'Googleによる情報の利用およびGoogleのプライバシーポリシーをご確認ください。',
  '大会情報ページでは、Googleカレンダーの読み込みに伴い、IPアドレス等の情報がGoogleへ送信されます。詳しくはGoogleのプライバシーポリシーをご確認ください。',
  'Google公式のオプトアウト案内をご参照ください。利用できるブラウザーには制限があります。',
]
const links = [
  ['Googleによる情報の利用', 'https://policies.google.com/technologies/partner-sites'],
  ['Googleのプライバシーポリシー', 'https://policies.google.com/privacy'],
  ['Googleのプライバシーポリシー', 'https://policies.google.com/privacy'],
  ['Google公式のオプトアウト案内', 'https://support.google.com/analytics/answer/181881?hl=ja'],
]
const mountPage = () => mount(AboutPage, { global: { stubs: {
  ContentMaxWidthContainer: { template: '<main><slot /></main>' },
  SectionCardShell: { template: '<section><header><slot name="header" /></header><div class="content"><slot /></div></section>' },
  SectionHeader: { props: ['title'], template: '<h2>{{ title }}</h2>' },
  HistoryTable: true, ExternalLinkCard: true,
  VRow: { template: '<div><slot /></div>' }, VCol: { template: '<div><slot /></div>' },
} } })

describe('Aboutのアクセス解析説明', () => {
  it('カレンダー説明を停止方法の直前に表示し、7項目の本文・順序と同一タブの4リンク・空白・句読点を保持する', () => {
    const wrapper = mountPage()
    try {
      const content = wrapper.findAll('section').find(section => section.find('header').text() === 'アクセス解析とプライバシー')!.get('.content')
      const list = content.get(':scope > ul.about-notice-list')
      const actual = list.findAll(':scope > li')
      expect(actual).toHaveLength(7)
      expect(mockAboutAnalyticsItems.map(item => item.id)).toEqual([
        'purpose', 'collection', 'retention', 'personal-information', 'details', 'google-calendar', 'opt-out',
      ])
      expect(actual.map(item => item.get(':scope > span.font-weight-bold').element.textContent))
        .toEqual(subheadings.map(text => text + '：'))
      expect(actual.map(item => Array.from(item.element.childNodes)
        .filter(node => node.nodeType !== 8 && node !== item.get(':scope > span').element)
        .map(node => node.textContent).join(''))).toEqual(bodies)
      expect(Array.from(content.element.children, child => child.tagName)).toEqual(['UL'])
      expect(actual.map(item => Array.from(item.element.children, child => child.tagName)))
        .toEqual([['SPAN'], ['SPAN'], ['SPAN'], ['SPAN'], ['SPAN', 'A', 'A'], ['SPAN', 'A'], ['SPAN', 'A']])
      expect(content.findAll('a').map(a => [a.text(), a.attributes('href')])).toEqual(links)
      expect(content.findAll('a').map(a => a.attributes('target'))).toEqual([undefined, undefined, undefined, undefined])
      expect(content.text()).not.toContain('最終更新日')
      expect(content.findAll('a').map(a => Object.fromEntries(Object.entries(a.attributes())
        .filter(([name]) => !name.startsWith('data-v-'))))).toEqual(links.map(([, href]) => ({ href })))
      // Vueのfragment用コメント・空テキストを除き、実際の本文とリンク境界を比較する。
      expect(Array.from(actual[4]!.element.childNodes)
        .filter(node => node.nodeType !== 8 && node !== actual[4]!.get(':scope > span').element
          && !(node.nodeType === 3 && node.textContent === ''))
        .map(node => node.textContent)).toEqual([
        'Googleによる情報の利用', 'および', 'Googleのプライバシーポリシー', 'をご確認ください。',
      ])
      expect(Array.from(actual[6]!.element.childNodes)
        .filter(node => node.nodeType !== 8 && node !== actual[6]!.get(':scope > span').element
          && !(node.nodeType === 3 && node.textContent === ''))
        .map(node => node.textContent)).toEqual([
        'Google公式のオプトアウト案内',
        'をご参照ください。利用できるブラウザーには制限があります。',
      ])
    } finally { wrapper.unmount() }
  })
  it('見出しとセクションの配置順を保持する', () => {
    const wrapper = mountPage()
    try {
      expect(wrapper.findAll('main > section > header > h2').map(header => header.text())).toEqual([
        '当サイトについて', '謝辞', '更新履歴', 'アクセス解析とプライバシー', 'お問い合わせ',
      ])
    } finally { wrapper.unmount() }
  })
  it('HTML風の本文・表示名と不許可URLを安全なテキストとして描画する', () => {
    const original = mockAboutAnalyticsItems[0]!.text
    mockAboutAnalyticsItems[0]!.text = '<img src=x> [<script>alert(1)</script>](https://example.com) [不可](javascript:alert(1))'
    let wrapper: ReturnType<typeof mountPage> | undefined
    try {
      wrapper = mountPage()
      const item = wrapper.findAll('section')[3]!.get('ul.about-notice-list > li')
      expect(item.element.textContent).toBe('利用目的：<img src=x> <script>alert(1)</script> [不可](javascript:alert(1))')
      expect(item.find('img').exists()).toBe(false)
      expect(item.find('script').exists()).toBe(false)
      expect(item.findAll('a').map(a => [a.text(), a.attributes('href')])).toEqual([
        ['<script>alert(1)</script>', 'https://example.com'],
      ])
    } finally {
      mockAboutAnalyticsItems[0]!.text = original
      wrapper?.unmount()
    }
  })
})
