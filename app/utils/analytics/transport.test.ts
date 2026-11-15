// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createGtagTransport } from './transport'
import { pageContext } from './pageContext'

const id = 'G-TEST123456'
const origin = 'https://monsearch.gifumoko.net'
const policy = { canLoad: () => true, canSend: () => true }
const commands = () => ((window as unknown as { dataLayer: IArguments[] }).dataLayer ?? []).map(args => Array.from(args))
const scripts: HTMLScriptElement[] = []
beforeEach(() => {
  scripts.length = 0
  // 外部scriptをDOMへ接続せず、Googleへの通信を完全に防ぐ。
  vi.spyOn(document.head, 'appendChild').mockImplementation(node => {
    scripts.push(node as HTMLScriptElement)
    return node
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  document.head.innerHTML = ''
  Reflect.deleteProperty(window, 'dataLayer'); Reflect.deleteProperty(window, 'gtag')
  vi.useRealTimers()
})
describe('gtag transport', () => {
  it('無効policyではscriptもconfigも生成しない', () => {
    const tag = createGtagTransport(id, { canLoad: () => false, canSend: () => false }, window, document)
    tag.context(pageContext('/', origin, '')); tag.start(); tag.event('page_view', {})
    expect(scripts).toHaveLength(0)
    expect(commands()).toEqual([])
  })
  it('ロード後に自動PV無効・Ads無効・page contextを先行設定し、3イベントだけ手動送信', () => {
    const tag = createGtagTransport(id, policy, window, document)
    const initial = pageContext('/cards?nm=火竜', origin, '')
    tag.context(initial); tag.event('page_view', { ...initial }); tag.start(); tag.start()
    expect(scripts).toHaveLength(1)
    expect(commands()).toEqual([])
    scripts[0]!.onload!(new Event('load'))
    const config = commands().find(([command]) => command === 'config')
    expect(config).toEqual(['config', id, { ...initial, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false }])
    const next = pageContext('/about', origin, origin + '/cards')
    tag.context(next); tag.event('page_view', { ...next })
    tag.event('search_submit', { search_mode: 'quick' }); tag.event('search_results', { result_count: 0 })
    expect(commands().filter(([command]) => command === 'event').map(([, name]) => name))
      .toEqual(['page_view', 'page_view', 'search_submit', 'search_results'])
    expect(commands().at(-4)).toEqual(['set', { ...next }])
    // 自動engagement等も参照する共有contextに生URLの暗黙defaultを使わせない。
    expect(commands()[2]![2]).toMatchObject({ page_location: initial.page_location, page_referrer: '', page_title: initial.page_title })
    tag.dispose()
  })
  it.each(['error', 'timeout'] as const)('%s後はqueueを捨て、遅延loadでも送信しない', failure => {
    vi.useFakeTimers()
    const tag = createGtagTransport(id, policy, window, document)
    tag.context(pageContext('/', origin, '')); tag.start()
    for (let i = 0; i < 80; i++) tag.event('search_submit', { i })
    if (failure === 'error') scripts[0]!.onerror!(new Event('error'))
    else vi.advanceTimersByTime(30000)
    scripts[0]!.onload!(new Event('load'))
    tag.event('page_view', {})
    expect(commands()).toEqual([])
  })
  it('ロード待ちqueueを50件に制限し、将来policy拒否時には破棄する', () => {
    let allowed = true
    const tag = createGtagTransport(id, { canLoad: () => allowed, canSend: () => allowed }, window, document)
    tag.context(pageContext('/', origin, '')); tag.start()
    for (let i = 0; i < 80; i++) tag.event('search_submit', { i })
    scripts[0]!.onload!(new Event('load'))
    expect(commands().filter(([command]) => command === 'event')).toHaveLength(50)
    allowed = false
    tag.event('search_results', {})
    expect(commands().filter(([command]) => command === 'event')).toHaveLength(50)
    tag.dispose()
  })
  it('DOM挿入・ロード済みgtagがthrowしても呼び出し元へ伝播しない', () => {
    vi.mocked(document.head.appendChild).mockImplementationOnce(() => { throw new Error('CSP') })
    const failed = createGtagTransport(id, policy, window, document)
    failed.context(pageContext('/', origin, ''))
    expect(() => failed.start()).not.toThrow()
    const tag = createGtagTransport(id, policy, window, document)
    tag.context(pageContext('/', origin, '')); tag.start()
    scripts[0]!.onload!(new Event('load'))
    Object.assign(window, { gtag: () => { throw new Error('blocked') } })
    expect(() => tag.event('search_submit', {})).not.toThrow()
    tag.dispose()
  })
})
