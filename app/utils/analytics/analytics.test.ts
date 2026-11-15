// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { analyticsUrl, pageContext } from './pageContext'
import { createAnalyticsPolicy, PRODUCTION_ANALYTICS_ORIGIN as origin } from './policy'
import { createSearchTracking } from './searchTracking'

const config = { enabled: true, measurementId: 'G-TEST123456', allowedOrigin: origin, environment: 'production' }
describe('analytics policy / URL', () => {
  it.each([
    {}, { ...config, enabled: false }, { ...config, enabled: 'false' },
    { ...config, measurementId: '' }, { ...config, measurementId: 'G-bad<script>' },
    { ...config, environment: 'preview' }, { ...config, allowedOrigin: 'https://fork.example' },
  ])('設定なし・不正・Previewではロードも送信もしない %j', value => {
    const policy = createAnalyticsPolicy(value, origin, false)
    expect(policy.canLoad()).toBe(false)
    expect(policy.canSend()).toBe(false)
  })
  it('本番設定でもfork host / local / devは無効', () => {
    for (const host of ['http://localhost:3000', 'https://fork.example', 'https://monsearch.pages.dev']) {
      expect(createAnalyticsPolicy(config, host, false).canLoad()).toBe(false)
    }
    expect(createAnalyticsPolicy(config, origin, true).canLoad()).toBe(false)
    expect(createAnalyticsPolicy({ ...config, enabled: 'true' }, origin, false).canLoad()).toBe(true)
  })
  it('日本語と自由入力を保持し、PIIの独自検知・置換をしない', () => {
    const input = '/cards?nm=火竜&kw=user%40example.test&rl=09012345678&email=ignore&unknown=x#fragment'
    const output = new URL(analyticsUrl(input, origin).location)
    expect(output.searchParams.get('nm')).toBe('火竜')
    expect(output.searchParams.get('kw')).toBe('user@example.test')
    expect(output.searchParams.get('rl')).toBe('09012345678')
    expect(output.searchParams.has('email')).toBe(false)
    expect(output.searchParams.has('unknown')).toBe(false)
    expect(output.hash).toBe('')
    expect(input).toContain('#fragment')
  })
  it('長文はparameter全体を省略し、他の短い条件を保持する', () => {
    const long = 'あ'.repeat(200)
    const { location, truncated } = analyticsUrl(`/cards?kw=${long}&nm=竜&cc=unit`, origin)
    expect(location.length).toBeLessThanOrEqual(1000)
    expect(truncated).toBe(1)
    expect(new URL(location).searchParams.has('kw')).toBe(false)
    expect(new URL(location).searchParams.get('nm')).toBe('竜')
    expect(analyticsUrl('/unknown/private?nm=x', origin).location).toBe(origin + '/404')
    expect(pageContext('/cards?nm=竜', origin, '').query_truncated).toBe(0)
  })
})

describe('search intent / visit tracking', () => {
  const setup = () => {
    const event = vi.fn(), context = vi.fn()
    return { event, context, tracking: createSearchTracking({ event, context }, origin, 'https://external.example/private?email=x') }
  }
  it('初期PVを一度だけ送り直リンクの全件数・0件を記録', () => {
    const { tracking, event, context } = setup()
    tracking.initial('/cards?nm=竜'); tracking.initial('/cards?nm=竜')
    tracking.results('/cards?nm=竜', 0); tracking.results('/cards?nm=竜', 0)
    expect(event.mock.calls.map(([name]) => name)).toEqual(['page_view', 'search_results'])
    expect(context.mock.calls[0]![0].page_referrer).toBe('https://external.example')
    expect(event.mock.calls[1]![1]).toMatchObject({ search_mode: 'direct', result_count: 0, zero_results: 1 })
  })
  it.each(['quick', 'advanced'] as const)('%s操作のintentと結果URLが一致し、同一URL再検索はsubmitのみ', mode => {
    const { tracking, event } = setup()
    tracking.initial('/cards/search')
    const token = tracking.submit(mode, '/cards?nm=竜')
    const nav = tracking.begin('/cards?nm=竜', false)
    tracking.commit(nav); tracking.finishSubmit(token)
    tracking.results('/cards/search', 10)
    tracking.results('/cards?nm=竜', 42)
    tracking.finishSubmit(tracking.submit(mode, '/cards?nm=竜'))
    tracking.results('/cards?nm=竜', 42)
    expect(event.mock.calls.map(([name]) => name)).toEqual(['page_view', 'search_submit', 'page_view', 'search_results', 'search_submit'])
    expect(event.mock.calls[3]![1]).toMatchObject({ search_mode: mode, result_count: 42, page_location: origin + '/cards?nm=%E7%AB%9C' })
  })
  it('履歴再訪は再計測し、ページ送り・sort・refreshは増やさない', () => {
    const { tracking, event } = setup()
    tracking.initial('/cards?cc=unit'); tracking.results('/cards?cc=unit', 60)
    tracking.results('/cards?cc=unit', 60); tracking.results('/cards?cc=unit', 60)
    tracking.commit(tracking.begin('/about', false))
    tracking.commit(tracking.begin('/cards?cc=unit', true))
    tracking.results('/cards?cc=unit', 60)
    expect(event.mock.calls.filter(([name]) => name === 'search_results')).toHaveLength(2)
    expect(event.mock.calls.at(-1)![1].search_mode).toBe('history')
  })
  it('連打A→B・古い結果・キャンセル・失敗・retryを区別する', () => {
    const { tracking, event } = setup()
    tracking.initial('/')
    const a = tracking.submit('quick', '/cards?nm=A')
    tracking.begin('/cards?nm=A', false) // navigationはキャンセルされcommitしない
    const b = tracking.submit('advanced', '/cards?nm=B')
    tracking.finishSubmit(a) // Bのintentを消さない
    tracking.commit(tracking.begin('/cards?nm=B', false)); tracking.finishSubmit(b)
    tracking.results('/cards?nm=A', 123) // 古い応答
    expect(event.mock.calls.filter(([name]) => name === 'search_results')).toHaveLength(0)
    // error時はsuccess通知なし。retry成功だけ記録する。
    tracking.results('/cards?nm=B', 2); tracking.results('/cards?nm=B', 2)
    expect(event.mock.calls.filter(([name]) => name === 'search_results')).toHaveLength(1)
    expect(event.mock.calls.at(-1)![1]).toMatchObject({ search_mode: 'advanced', result_count: 2 })
  })
  it('transportがthrowしても操作と結果通知を阻害しない', () => {
    const broken = () => { throw new Error('blocked') }
    const tracking = createSearchTracking({ context: broken, event: broken }, origin, '')
    expect(() => {
      tracking.initial('/'); tracking.submit('quick', '/cards')
      tracking.commit(tracking.begin('/cards', false)); tracking.results('/cards', 1)
    }).not.toThrow()
  })
  it('guard開始前にA→Bを連打しても、AのguardはBのintentを消さない', () => {
    const { tracking, event } = setup()
    tracking.initial('/')
    const a = tracking.submit('quick', '/cards?nm=A')
    tracking.submit('advanced', '/cards?nm=B')
    tracking.begin('/cards?nm=A', false)
    tracking.finishSubmit(a)
    tracking.commit(tracking.begin('/cards?nm=B', false))
    tracking.results('/cards?nm=B', 1)
    expect(event.mock.calls.at(-1)![1].search_mode).toBe('advanced')
  })
})
