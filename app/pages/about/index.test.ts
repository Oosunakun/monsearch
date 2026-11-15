import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AboutPage from './index.vue'
import { mockAboutAnalyticsItems } from '~~/app/utils/mockData/about'

// データ定義から生成せず、外部化前の表示を固定値として保持する。
const paragraphs = [
  ' 当サイトの正式公開環境では、検索機能の使いやすさの改善と開発の優先順位の検討のため、Google Analytics 4を利用します。 閲覧ページ、検索条件を含むURL、簡易・詳細検索の操作、検索結果件数、端末・ブラウザー等の利用情報をGoogleへ送信します。 広告・リマーケティングを目的とした利用は行いません。 ',
  ' Cookie（_ga、_ga_から始まるCookie）を使用します。Cookieの有効期間は通常、最終利用から最長2年です。 イベント・ユーザーデータの保持期間は2か月とし、Cookieの期間とは異なります。 Google Analyticsの標準データ除去機能を利用する方針ですが、個人情報の送信を完全に防ぐものではありません。 検索欄にメールアドレス・電話番号・氏名・住所等の個人情報を入力しないでください。 ',
  ' 情報の取扱いは Googleのプライバシーポリシーと Googleによる情報の利用方法をご確認ください。 計測を停止する方法は Google公式のオプトアウト案内をご参照ください。 オプトアウト用の拡張機能は対応ブラウザーでのみ利用でき、モバイル等では利用できない場合があります。 ご質問は本ページの「お問い合わせ」からご連絡ください。 ',
]
const links = [
  ['Googleのプライバシーポリシー', 'https://policies.google.com/privacy'],
  ['Googleによる情報の利用方法', 'https://policies.google.com/technologies/partner-sites'],
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
  it('全文・空白・3リンクの属性と順序・段落の要素構造を保持する', () => {
    const wrapper = mountPage()
    try {
      const content = wrapper.findAll('section')[1]!.get('.content')
      const actual = content.findAll(':scope > p')
      expect(actual.map(p => p.element.textContent)).toEqual(paragraphs)
      expect(Array.from(content.element.children, child => child.tagName)).toEqual(['P', 'P', 'P'])
      expect(actual.map(p => Array.from(p.element.children, child => child.tagName))).toEqual([[], [], ['A', 'A', 'A']])
      expect(content.findAll('a').map(a => [a.text(), a.attributes('href')])).toEqual(links)
      expect(content.findAll('a').map(a => Object.fromEntries(Object.entries(a.attributes())
        .filter(([name]) => !name.startsWith('data-v-'))))).toEqual(links.map(([, href]) => ({ href })))
      // Vueのfragment用コメント・空テキストを除き、実際の本文とリンク境界を比較する。
      expect(Array.from(actual[2]!.element.childNodes)
        .filter(node => node.nodeType !== 8 && !(node.nodeType === 3 && node.textContent === ''))
        .map(node => node.textContent)).toEqual([
        ' 情報の取扱いは ', 'Googleのプライバシーポリシー', 'と ', 'Googleによる情報の利用方法',
        'をご確認ください。 計測を停止する方法は ', 'Google公式のオプトアウト案内',
        'をご参照ください。 オプトアウト用の拡張機能は対応ブラウザーでのみ利用でき、モバイル等では利用できない場合があります。 ご質問は本ページの「お問い合わせ」からご連絡ください。 ',
      ])
    } finally { wrapper.unmount() }
  })
  it('見出しとセクションの配置順を保持する', () => {
    const wrapper = mountPage()
    try {
      expect(wrapper.findAll('main > section > header > h2').map(header => header.text())).toEqual([
        '当サイトについて', 'アクセス解析について', '謝辞', '更新履歴', 'お問い合わせ',
      ])
    } finally { wrapper.unmount() }
  })
  it('HTML風の本文・表示名と不許可URLを安全なテキストとして描画する', () => {
    const original = mockAboutAnalyticsItems[0]!.text
    mockAboutAnalyticsItems[0]!.text = '<img src=x> [<script>alert(1)</script>](https://example.com) [不可](javascript:alert(1))'
    const wrapper = mountPage()
    try {
      const paragraph = wrapper.findAll('section')[1]!.get('p')
      expect(paragraph.element.textContent).toBe('<img src=x> <script>alert(1)</script> [不可](javascript:alert(1))')
      expect(paragraph.find('img').exists()).toBe(false)
      expect(paragraph.find('script').exists()).toBe(false)
      expect(paragraph.findAll('a').map(a => [a.text(), a.attributes('href')])).toEqual([
        ['<script>alert(1)</script>', 'https://example.com'],
      ])
    } finally {
      mockAboutAnalyticsItems[0]!.text = original
      wrapper.unmount()
    }
  })
})
