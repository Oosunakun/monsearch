import { CARD_SEARCH_QUERY_ALIASES } from '~~/app/utils/search/cardSearchQuerySchema'
import type { PageContext } from '~~/app/types/analytics'

const paths = new Set(['/', '/cards', '/cards/search', '/about', '/rules', '/restrictions', '/links'])
const aliases = new Set<string>(CARD_SEARCH_QUERY_ALIASES)
const title = 'モンさーち！｜モンコレカード検索サイト'

// PII判定はしない。query値は保持し、長さはparameter単位で制限する。
export function analyticsUrl(fullPath: string, origin: string, limit = 1000) {
  const input = new URL(fullPath, origin)
  const path = paths.has(input.pathname) ? input.pathname : '/404'
  let location = origin + path
  let truncated = 0
  if (path === '/cards' || path === '/cards/search') {
    const params = [...input.searchParams].filter(([key]) => aliases.has(key))
      .sort(([a], [b]) => a.localeCompare(b))
    for (const [key, value] of params) {
      const pair = new URLSearchParams([[key, value]]).toString()
      const next = location + (location.includes('?') ? '&' : '?') + pair
      if (next.length <= limit) location = next
      else truncated = 1
    }
  }
  return { location, truncated }
}

export function externalReferrer(referrer: string): string {
  try { return new URL(referrer).origin } catch { return '' }
}

export function pageContext(fullPath: string, origin: string, referrer: string): PageContext {
  const url = analyticsUrl(fullPath, origin)
  return { page_location: url.location, page_referrer: referrer, page_title: title, query_truncated: url.truncated }
}
