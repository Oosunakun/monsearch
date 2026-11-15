import type { AnalyticsConfig, AnalyticsPolicy } from '~~/app/types/analytics'

export const PRODUCTION_ANALYTICS_ORIGIN = 'https://monsearch.gifumoko.net'

export function isAnalyticsConfigured(config: AnalyticsConfig): boolean {
  return (config.enabled === true || config.enabled === 'true')
    && config.environment === 'production'
    && typeof config.measurementId === 'string'
    && /^G-[A-Z0-9]{4,20}$/.test(config.measurementId)
    && config.allowedOrigin === PRODUCTION_ANALYTICS_ORIGIN
}

// CMP追加時はこのpolicyを差し替える。地域判定・同意保存はここでは行わない。
export function createAnalyticsPolicy(config: AnalyticsConfig, origin: string, dev: boolean): AnalyticsPolicy {
  const allowed = !dev && isAnalyticsConfigured(config) && origin === config.allowedOrigin
  return { canLoad: () => allowed, canSend: () => allowed }
}
