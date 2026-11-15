import type { RouteLocationNormalized } from 'vue-router'
import type { AnalyticsClient } from '~~/app/types/analytics'
import { createAnalyticsPolicy } from '~~/app/utils/analytics/policy'
import { createGtagTransport } from '~~/app/utils/analytics/transport'
import { createSearchTracking, noopAnalytics } from '~~/app/utils/analytics/searchTracking'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.analytics
  const policy = createAnalyticsPolicy(config, window.location.origin, import.meta.dev)
  if (!policy.canLoad()) return { provide: { analytics: noopAnalytics } }
  const router = useRouter()
  const transport = createGtagTransport(String(config.measurementId), policy, window, document)
  const tracking = createSearchTracking(transport, window.location.origin, document.referrer)
  let ready = false
  let position: unknown = window.history.state?.position
  const navigations = new WeakMap<RouteLocationNormalized, ReturnType<typeof tracking.begin>>()
  router.beforeEach(to => {
    if (!ready) return
    // popstate通知とguardの実行順に依存せず、履歴entryの移動も照合する。
    const nextPosition: unknown = window.history.state?.position
    const moved = typeof position === 'number' && typeof nextPosition === 'number' && position !== nextPosition
    navigations.set(to, tracking.begin(to.fullPath, moved))
  })
  router.afterEach((to, _from, failure) => {
    if (!ready || to.fullPath === _from.fullPath) return
    const navigation = navigations.get(to)
    if (!failure && navigation) {
      position = window.history.state?.position
      tracking.commit(navigation)
      transport.start()
    }
  })
  // SSGのquery復元はapp:mounted時点では完了していないことがある。
  // useCardSearchのonNuxtReadyより先に登録し、最初のsuccessにも間に合わせる。
  onNuxtReady(() => {
    tracking.initial(router.currentRoute.value.fullPath)
    ready = true
    position = window.history.state?.position
    transport.start()
  })
  const analytics: AnalyticsClient = {
    submit: (mode, query) => tracking.submit(mode, router.resolve({ path: '/cards', query }).fullPath),
    finishSubmit: token => tracking.finishSubmit(token),
    results: (path, count) => tracking.results(path, count),
  }
  return { provide: { analytics } }
})
