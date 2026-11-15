import type { LocationQueryRaw } from 'vue-router'

export type SearchMode = 'quick' | 'advanced' | 'direct' | 'history' | 'other'
export type AnalyticsEvent = 'page_view' | 'search_submit' | 'search_results'
export type AnalyticsParams = Record<string, string | number | boolean>
export interface PageContext {
  page_location: string
  page_referrer: string
  page_title: string
  query_truncated: number
}
export interface AnalyticsTransport {
  context: (context: PageContext) => void
  event: (name: AnalyticsEvent, params: AnalyticsParams) => void
}
export interface AnalyticsClient {
  submit: (mode: 'quick' | 'advanced', query: LocationQueryRaw) => number
  finishSubmit: (token: number) => void
  results: (fullPath: string, count: number) => void
}
export interface AnalyticsConfig {
  enabled?: unknown
  measurementId?: unknown
  allowedOrigin?: unknown
  environment?: unknown
}
export interface AnalyticsPolicy {
  canLoad: () => boolean
  canSend: () => boolean
}
