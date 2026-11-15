import type { AnalyticsClient, AnalyticsTransport, PageContext, SearchMode } from '~~/app/types/analytics'
import { analyticsUrl, externalReferrer, pageContext } from './pageContext'

export function createSearchTracking(transport: AnalyticsTransport, origin: string, referrer: string) {
  let sequence = 0
  let pending: { token: number, target: string, mode: SearchMode } | undefined
  let visit: { path: string, mode: SearchMode, sent: boolean, context: PageContext } | undefined
  let previous = externalReferrer(referrer)
  // Analyticsの例外はrouter・検索へ伝播させない。
  const safely = (action: () => void) => { try { action() } catch { /* 計測のみを破棄 */ } }
  return {
    submit(mode: 'quick' | 'advanced', target: string) {
      const token = ++sequence
      pending = { token, target, mode }
      safely(() => transport.event('search_submit', { ...pageContext(target, origin, previous), search_mode: mode }))
      return token
    },
    finishSubmit(token: number) { if (pending?.token === token) pending = undefined },
    begin(path: string, history: boolean) {
      const mode = history ? 'history' : pending?.target === path ? pending.mode : visit ? 'other' : 'direct'
      // 古いnavigationのguardが遅れても、新しい別URLのintentを破棄しない。
      if (history || pending?.target === path) pending = undefined
      return { path, mode } as const
    },
    commit(navigation: { path: string, mode: SearchMode }) {
      const context = pageContext(navigation.path, origin, previous)
      visit = { ...navigation, sent: false, context }
      safely(() => { transport.context(context); transport.event('page_view', { ...context }) })
      previous = analyticsUrl(navigation.path, origin, 420).location
    },
    initial(path: string) {
      if (visit) return
      this.commit({ path, mode: 'direct' })
    },
    results(fullPath: string, count: number) {
      if (!visit || visit.path !== fullPath || visit.sent || !fullPath.startsWith('/cards')
        || fullPath.split(/[?#]/)[0] !== '/cards' || !Number.isFinite(count) || count < 0) return
      visit.sent = true
      safely(() => transport.event('search_results', {
        ...visit!.context, search_mode: visit!.mode,
        result_count: count, zero_results: count === 0 ? 1 : 0,
      }))
    },
  }
}

export const noopAnalytics: AnalyticsClient = {
  submit: () => 0, finishSubmit: () => {}, results: () => {},
}
